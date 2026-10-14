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
 *   anchored on itself: step 500 IS the tone, the rest walk from it toward the
 *   page and toward the ink.
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
	{ name: "yellow", hue: 92, light: { l: 0.83, c: 0.16 }, dark: { l: 0.82, c: 0.15 } },
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
 * A tone's own chroma can sit above what sRGB holds at a wash's lightness, so
 * the near-page steps are capped. The rest keep the tone's chroma as scaled:
 * a tone is already in gamut at its own depth.
 */
export const TONE_CHROMA_CAP: Record<PaletteMode, Partial<Record<PaletteStep, number>>> = {
	light: { 50: 0.02, 100: 0.04, 200: 0.07, 300: 0.11 },
	dark: { 50: 0.035, 100: 0.05, 200: 0.07, 300: 0.1 },
}

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

/** One step from an anchor, before any gamut cap — the JS twin of the CSS. */
export function stepFrom(anchor: { l: number; c: number }, step: PaletteStep, mode: PaletteMode): { l: number; c: number } {
	const curve = STEP_CURVES[mode][step]
	return { l: anchor.l + (curve.target - anchor.l) * curve.pull, c: anchor.c * curve.chroma }
}
