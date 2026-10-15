/**
 * The palette: nine colour families and a scale under every tone, generated
 * for whatever theme is painting. `scripts/build-palette.mjs` writes this into
 * `src/palette.css`; `palette.test.ts` holds every built-in theme to it.
 *
 * The contract is roles, and roles are not enough for a product. Tags, avatars,
 * labels and illustration need more colours than three tones, and raw Tailwind
 * steps ignore the theme, so they were banned outright. These follow it:
 *
 * - A **family** (red, orange, yellow, green, teal, blue, purple, pink) keeps
 *   its own hue and leans toward the brand by half the gap, at most 15°, and
 *   only as far as the brand has colour to lean toward (an ink-black primary
 *   pulls nothing). Material 3's harmonize, the same lean the customizer gives
 *   status colours. Lightness and chroma are fixed per step, fitted inside sRGB
 *   across the whole lean, so no brand can push a step out of gamut.
 * - **neutral** is the theme's own page and ink mixed in steps, so it carries
 *   whatever tint the theme's surfaces do.
 * - Every **tone** (tone-1…3, info, warning, success, destructive) gets a scale
 *   on one shared ladder of depths, and the tone lands exactly on the step
 *   nearest its own lightness: a light status colour in dark mode is 800, a
 *   mid one is 500. The steps either side stretch to keep the ladder's ends,
 *   so a tone near one end does not crush five steps into the little room
 *   left past it, and tone-1-100 and success-100 are the same depth.
 *
 * Steps follow the mode rather than literal lightness: a low step is always
 * near the page and a high step always far from it, so 800 text on a 100
 * wash reads in both modes with no `dark:` (Sable has none).
 */

export const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type PaletteStep = (typeof PALETTE_STEPS)[number]

export type PaletteMode = "light" | "dark"

export interface PaletteFamily {
	name: string
	/** The family's own hue, before the lean. */
	hue: number
	/** Step 500, per mode: lightness and the chroma the family is aiming for. */
	light: { l: number; c: number }
	dark: { l: number; c: number }
}

export const PALETTE_FAMILIES: readonly PaletteFamily[] = [
	{ name: "red", hue: 25, light: { l: 0.6, c: 0.21 }, dark: { l: 0.64, c: 0.2 } },
	{ name: "orange", hue: 50, light: { l: 0.69, c: 0.18 }, dark: { l: 0.71, c: 0.17 } },
	// Yellow is only yellow when it is light; at 0.6 it is olive.
	// In dark mode it sits a little deeper, or 800–950 crowd into the room
	// left between it and the ink.
	{ name: "yellow", hue: 92, light: { l: 0.83, c: 0.16 }, dark: { l: 0.78, c: 0.15 } },
	{ name: "green", hue: 145, light: { l: 0.64, c: 0.17 }, dark: { l: 0.68, c: 0.16 } },
	{ name: "teal", hue: 190, light: { l: 0.7, c: 0.12 }, dark: { l: 0.74, c: 0.12 } },
	{ name: "blue", hue: 262, light: { l: 0.6, c: 0.19 }, dark: { l: 0.64, c: 0.17 } },
	{ name: "purple", hue: 305, light: { l: 0.56, c: 0.22 }, dark: { l: 0.64, c: 0.2 } },
	{ name: "pink", hue: 350, light: { l: 0.65, c: 0.2 }, dark: { l: 0.69, c: 0.18 } },
]

/** The hue families by name — the values Badge, Pill and StatusDot take on `tone`. */
export const PALETTE_COLORS = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"] as const
export type PaletteColor = (typeof PALETTE_COLORS)[number]
export const isPaletteColor = (value: unknown): value is PaletteColor => (PALETTE_COLORS as readonly unknown[]).includes(value)

/**
 * The slots a `data-palette="<family>"` scope fills, so a component can paint
 * any family without naming a step: `bg-palette-wash text-palette-text`. Each
 * pair is held to contrast in `palette.test.ts`.
 */
export const PALETTE_SLOTS = {
	wash: 100,
	"wash-strong": 200,
	edge: 300,
	dot: 500,
	solid: 700,
	text: 800,
	"solid-ink": 50,
} as const satisfies Record<string, PaletteStep>

/** Tokens that get a scale of their own, `--<token>-50` … `--<token>-950`. */
export const PALETTE_TONES = ["tone-1", "tone-2", "tone-3", "tone-info", "tone-warning", "success", "destructive"] as const

/** Everything the palette names: neutral, the families, then the tone scales. */
export const PALETTE_SCALES = ["neutral", ...PALETTE_FAMILIES.map((family) => family.name), ...PALETTE_TONES] as const

/**
 * One step of a scale: lightness moves from the anchor toward `target` by
 * `pull` (0 stays on the anchor, 1 lands on the target), and chroma is the
 * anchor's times `chroma`. Below 500 the target is the page; above it, the ink.
 */
export interface StepCurve {
	target: number
	pull: number
	chroma: number
}

export const STEP_CURVES: Record<PaletteMode, Record<PaletteStep, StepCurve>> = {
	light: {
		50: { target: 0.985, pull: 0.94, chroma: 0.12 },
		100: { target: 0.985, pull: 0.86, chroma: 0.22 },
		200: { target: 0.985, pull: 0.7, chroma: 0.4 },
		300: { target: 0.985, pull: 0.5, chroma: 0.62 },
		400: { target: 0.985, pull: 0.26, chroma: 0.85 },
		500: { target: 0, pull: 0, chroma: 1 },
		// The far half pulls toward the ink, by shares of whatever distance is
		// left, so any anchor walks away from the page: a dark one (a deep tone)
		// cannot turn back lighter, and a light one (yellow) still reaches text
		// strength by 700 instead of stopping at olive.
		600: { target: 0.2, pull: 0.2, chroma: 1 },
		700: { target: 0.2, pull: 0.5, chroma: 0.92 },
		800: { target: 0.2, pull: 0.6, chroma: 0.8 },
		900: { target: 0.2, pull: 0.75, chroma: 0.66 },
		950: { target: 0.2, pull: 0.88, chroma: 0.52 },
	},
	dark: {
		50: { target: 0.17, pull: 0.93, chroma: 0.25 },
		100: { target: 0.17, pull: 0.85, chroma: 0.32 },
		200: { target: 0.17, pull: 0.7, chroma: 0.45 },
		300: { target: 0.17, pull: 0.5, chroma: 0.62 },
		400: { target: 0.17, pull: 0.27, chroma: 0.82 },
		500: { target: 0, pull: 0, chroma: 1 },
		600: { target: 0.97, pull: 0.2, chroma: 0.95 },
		700: { target: 0.97, pull: 0.42, chroma: 0.8 },
		800: { target: 0.97, pull: 0.6, chroma: 0.6 },
		900: { target: 0.97, pull: 0.75, chroma: 0.42 },
		950: { target: 0.97, pull: 0.88, chroma: 0.28 },
	},
}

/**
 * How much of the page-to-ink distance each neutral step covers. The mix is
 * the theme's own `--background` toward its `--foreground`, so in dark mode
 * the scale runs dark to light by itself.
 */
export const NEUTRAL_MIX: Record<PaletteStep, number> = {
	50: 3,
	100: 6,
	200: 12,
	300: 22,
	400: 38,
	500: 50,
	600: 62,
	700: 72,
	800: 82,
	900: 90,
	950: 95,
}

/**
 * The tone ladder: one lightness per step, per mode, shared by every tone.
 * Close to Tailwind's depths, with the washes a touch lighter. A tone takes
 * the step whose depth is nearest its own and the rest of the ladder is
 * stretched about it (see `toneStep`), so its ends hold wherever the tone sits.
 */
export const TONE_LADDER: Record<PaletteMode, Record<PaletteStep, number>> = {
	light: { 50: 0.975, 100: 0.945, 200: 0.895, 300: 0.82, 400: 0.725, 500: 0.63, 600: 0.55, 700: 0.47, 800: 0.4, 900: 0.33, 950: 0.27 },
	dark: { 50: 0.215, 100: 0.25, 200: 0.31, 300: 0.39, 400: 0.5, 500: 0.6, 600: 0.69, 700: 0.77, 800: 0.84, 900: 0.895, 950: 0.94 },
}

/**
 * The share of the tone's chroma left at each end of the ladder: `page` at 50,
 * `ink` at 950. Between the tone and an end it falls in a straight line. sRGB
 * caps it further where the depth cannot hold it (palette.css fits that bound
 * per step, over the whole hue circle, since a tone can be any hue).
 */
export const TONE_CHROMA_ENDS: Record<PaletteMode, { page: number; ink: number }> = {
	light: { page: 0.12, ink: 0.52 },
	dark: { page: 0.25, ink: 0.3 },
}

/** Steepness of the CSS step functions that pick the tone's step: 1/10000 L wide. */
export const TONE_SNAP = 10000

/**
 * The lean: half the hue gap, at most 15°, in full only past this much brand
 * chroma. Harmony scales it, clamped to 0–`maxHarmony`, so a family can move at
 * most `cap × maxHarmony` degrees: the span its chroma is fitted across.
 */
export const LEAN = { amount: 0.5, cap: 15, fullAt: 0.06, maxHarmony: 2 } as const
export const LEAN_REACH = LEAN.cap * LEAN.maxHarmony

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** A family's hue under a brand — the JS twin of the CSS in palette.css. */
export function familyHue(hue: number, brand: { c: number; h: number }, harmony = 1): number {
	const gap = ((((brand.h - hue + 540) % 360) + 360) % 360) - 180
	const lean = clamp(gap * LEAN.amount, -LEAN.cap, LEAN.cap) * clamp(harmony, 0, LEAN.maxHarmony) * clamp(brand.c / LEAN.fullAt, 0, 1)
	return (((hue + lean) % 360) + 360) % 360
}

/** One family step from its 500, before any gamut cap — the JS twin of the CSS. */
export function stepFrom(anchor: { l: number; c: number }, step: PaletteStep, mode: PaletteMode): { l: number; c: number } {
	const curve = STEP_CURVES[mode][step]
	return { l: anchor.l + (curve.target - anchor.l) * curve.pull, c: anchor.c * curve.chroma }
}

/**
 * Position along a mode's ladder, from 50 (0) toward 950: the ladder runs down
 * in light mode and up in dark, and this makes both read the same way.
 */
export function ladderDepth(l: number, mode: PaletteMode): number {
	const top = TONE_LADDER[mode][50]
	return mode === "light" ? top - l : l - top
}

/** The ladder depth of the step a tone of lightness `l` snaps to — the JS twin of `--_tone-anchor`. */
export function toneAnchor(l: number, mode: PaletteMode): number {
	const ladder = TONE_LADDER[mode]
	let depth = 0
	for (let i = 1; i < PALETTE_STEPS.length; i++) {
		const [before, at] = [ladder[PALETTE_STEPS[i - 1]], ladder[PALETTE_STEPS[i]]]
		const mid = (before + at) / 2
		depth += Math.abs(at - before) * clamp((mode === "light" ? mid - l : l - mid) * TONE_SNAP, 0, 1)
	}
	return depth
}

/**
 * One tone step, before the gamut bound — the JS twin of the CSS. The tone sits
 * on its anchor step; steps toward the page stretch over the room between the
 * tone and step 50, steps toward the ink over the room between it and 950.
 */
export function toneStep(tone: { l: number; c: number }, step: PaletteStep, mode: PaletteMode): { l: number; c: number; anchor: boolean } {
	const end = ladderDepth(TONE_LADDER[mode][950], mode)
	const at = ladderDepth(TONE_LADDER[mode][step], mode)
	const anchor = toneAnchor(tone.l, mode)
	const own = ladderDepth(tone.l, mode)
	const pageSide = clamp((anchor - at) * TONE_SNAP, 0, 1)
	const towardPage = (at * own) / Math.max(anchor, 0.001)
	const towardInk = own + ((at - anchor) * (end - own)) / Math.max(end - anchor, 0.001)
	const depth = pageSide * towardPage + (1 - pageSide) * towardInk
	const ends = TONE_CHROMA_ENDS[mode]
	const share =
		pageSide * (1 - (1 - ends.page) * ((anchor - at) / Math.max(anchor, 0.001))) +
		(1 - pageSide) * (1 - (1 - ends.ink) * ((at - anchor) / Math.max(end - anchor, 0.001)))
	const top = TONE_LADDER[mode][50]
	return { l: mode === "light" ? top - depth : top + depth, c: tone.c * share, anchor: Math.abs(at - anchor) * TONE_SNAP < 1 }
}
