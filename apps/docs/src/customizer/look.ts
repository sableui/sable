/**
 * A "look": a theme preset plus the global deltas a person dialed in on top of
 * it. Themes are starting points, not the unit of customization — every value
 * here becomes an ordinary Sable token override, so the exported CSS works in
 * any consuming app after its Sable imports.
 *
 * Most controls are continuous (0–100) rather than enumerated, because the
 * point is exploration: you move through the space and watch the whole system
 * respond, instead of choosing among four labels someone else picked.
 *
 * `toCss` is the single source of truth: the live preview injects exactly the
 * string the Export panel shows. If the preview looks right, the export is.
 */

import { GAMUT_SAFETY, NEUTRAL_TOKENS, type Oklch, type ResolvedTheme, formatOklch as formatRaw, hexToOklch, hueDelta, isNeutral, maxChroma, mix, toGamut } from "./color"
import { chartPalette } from "./chart-palette"
import { type FontEntry, findFont, googleFontsUrl, stackFor } from "./fonts"
import { SHADOW_STEPS, type ShadowLadder, type ShadowStyle, anchorLadder, definingDrop, densityFor, depthFactors, formatShadow, isFlat, recipeLadder, rotateLadder, scaleLadder, shadowInk, shadowToken } from "./shadow"

export type { ShadowStyle } from "./shadow"

export type ButtonShape = "theme" | "pill" | "match"
export type Motion = "off" | "snappy" | "default" | "relaxed"
export type IconSet = "reicon"
export type Neutrals = "theme" | "mono" | "warm" | "cool" | "brand"
export type PrimaryAction = "brand" | "neutral"
/**
 * How far the brand reaches into the rest of the palette.
 *   preset     — "Brand only": decorative tones become shades of the brand
 *   harmonize  — status colours (success, warning, destructive, info) lean a
 *                capped few degrees toward the brand hue, Material 3–style:
 *                red stays red, but every colour now shares an undertone
 *   analogous  — decorative tones are generated as neighbours of the brand
 *   triadic    — decorative tones are spaced around the wheel from the brand
 * The generated schemes also harmonize status colours.
 */
export type Palette = "preset" | "harmonize" | "analogous" | "triadic"

export interface Look {
	/** Quiet ↔ Bold, 0–100. null = the preset as shipped. */
	bold: number | null
	/** Compact ↔ Airy, 0–100. null = the preset as shipped. */
	airy: number | null
	/** Corners, 0 (square) – 100 (very round). null = the preset's ladder. */
	corners: number | null
	/** Depth, 0 (flat) – 100 (lifted). null = the preset's shadows as shipped. */
	depth: number | null
	/** The shape of a shadow: the preset's own, or a recipe (see shadow.ts). */
	shadows: ShadowStyle
	/** Brand hue in degrees, from the swatch strip. null = the preset's own colors. */
	hue: number | null
	/** An exact brand colour (hex), from the picker. Wins over `hue`. */
	brand: string | null
	palette: Palette
	primary: PrimaryAction
	neutrals: Neutrals
	buttons: ButtonShape
	/** Primary font (body + interface): "theme" or a Google Fonts family. */
	sans: string
	/** Mono font: "theme" or a family. */
	mono: string
	/** Secondary font (headings + display): "theme" | "sans" (= primary) | a family. */
	display: string
	motion: Motion
	icons: IconSet
	/*
	 * Advanced anchors. Each is ONE number per domain — everything else in that
	 * domain is derived from it, so a rhythm can be retuned but not broken. A
	 * set anchor wins over the simple control for its domain; moving the simple
	 * control clears it (see Inspector). Lengths are rendered px.
	 */
	/** Body text size. Every type tier keeps its distance from body. */
	typeBase: number | null
	/** Type scale ratio: how far apart the tiers sit. */
	typeRatio: number | null
	/** Medium control height. The control ladder keeps its proportions. */
	controlBase: number | null
	/** Row padding. Gaps and the spacing unit follow proportionally. */
	spacingBase: number | null
	/** Medium radius. The radius ladder keeps its proportions and ceilings. */
	radiusBase: number | null
	/** Base duration in ms. Every duration scales with it. */
	motionBase: number | null
	/** Light angle in degrees (90 = overhead). Every shadow falls away from it, keeping its length. */
	shadowAngle: number | null
	/** The top shadow step's offset length in px; the ladder keeps its proportions. Wins over Depth's reach. */
	shadowDistance: number | null
	/** The top shadow step's blur in px; every drop takes the same blur-to-distance ratio. */
	shadowBlur: number | null
	/** The top shadow step's opacity in %, in light mode; every drop in both modes scales with it. Wins over Depth's strength. */
	shadowOpacity: number | null
}

export const DEFAULT_LOOK: Look = {
	bold: null,
	airy: null,
	corners: null,
	depth: null,
	shadows: "theme",
	hue: null,
	brand: null,
	palette: "preset",
	primary: "brand",
	neutrals: "theme",
	buttons: "theme",
	sans: "theme",
	mono: "theme",
	display: "theme",
	motion: "default",
	icons: "reicon",
	typeBase: null,
	typeRatio: null,
	controlBase: null,
	spacingBase: null,
	radiusBase: null,
	motionBase: null,
	shadowAngle: null,
	shadowDistance: null,
	shadowBlur: null,
	shadowOpacity: null,
}

/** The anchor fields — the numeric keys the URL decoder must accept. */
export const ANCHOR_KEYS = ["typeBase", "typeRatio", "controlBase", "spacingBase", "radiusBase", "motionBase", "shadowAngle", "shadowDistance", "shadowBlur", "shadowOpacity"] as const

export const MOTION_SCALE: Record<Motion, number> = { off: 0, snappy: 0.7, default: 1, relaxed: 1.4 }

/** The catalog entries a look uses — what its Google Fonts <link> must load. */
export function fontsInUse(look: Look): FontEntry[] {
	const out: FontEntry[] = []
	for (const family of [look.sans, look.display, look.mono]) {
		if (family === "theme" || family === "sans") continue
		const entry = findFont(family)
		if (entry && !out.includes(entry)) out.push(entry)
	}
	return out
}

/** The brand strip: 24 hue stops, like a swatch book rather than a color wheel. */
export const HUE_STOPS = Array.from({ length: 24 }, (_, i) => i * 15)

export const RADIUS_STEPS = ["xs", "sm", "md", "lg", "xl"] as const
export const CONTROL_STEPS = ["xs", "sm", "md", "cta", "lg"] as const

/** Every paired type tier that reads a `--type-<tier>-size` override. */
export const TYPE_SIZE_TIERS = [
	"display-4xl", "display-3xl", "display-2xl", "display-xl", "display-lg",
	"heading-1", "heading-2", "heading-3", "heading-4",
	"title-lg", "title-sm",
	"body-lg", "body-md", "body-sm", "body-xs",
	"label-lg", "label-md", "label-sm", "label-xs", "caption", "overline",
	"mono-xl", "mono-lg", "mono-md", "mono-caption", "mono-sm",
] as const

/** styles.css fallbacks for tiers a theme does not declare (read from the sheet). */
export const TYPE_SIZE_FALLBACK: Record<string, string> = {
	"title-lg": "1rem", "title-sm": "0.875rem",
	"body-lg": "1.0625rem", "body-md": "0.9375rem", "body-sm": "0.8125rem", "body-xs": "0.75rem",
	"label-lg": "0.875rem", "label-md": "0.75rem", "label-sm": "0.6875rem", "label-xs": "0.6875rem",
	caption: "0.75rem", overline: "0.75rem",
	"mono-xl": "1.75rem", "mono-lg": "1.25rem", "mono-md": "0.8125rem", "mono-caption": "0.75rem", "mono-sm": "0.6875rem",
}

/** The active preset's own values, read before any override applies. */
export interface ThemeBase {
	radius: Record<string, string>
	typeSize: Record<string, string>
	control: Record<string, string>
	colors: ResolvedTheme | null
	/** Root font size in px, to turn rem tokens into the px the anchors use. */
	rootPx: number
	/** The preset's base duration in ms at motion scale 1. */
	motionBaseMs: number
	/** The preset's shadow ladder per mode, as the browser resolves it. */
	shadows: { light: ShadowLadder; dark: ShadowLadder } | null
}

/** A length token in rendered px. */
export function toPx(value: string | undefined, rootPx: number): number | null {
	const m = value?.trim().match(/^(-?[\d.]+)(px|rem|em)$/)
	if (!m) return null
	return Number(m[1]) * (m[2] === "px" ? 1 : rootPx)
}

/** How far above body a heading tier sits, as a per-step ratio — the preset's own. */
export function presetTypeRatio(base: ThemeBase): number {
	const body = toPx(base.typeSize["body-md"] || TYPE_SIZE_FALLBACK["body-md"], base.rootPx)
	const h1 = toPx(base.typeSize["heading-1"], base.rootPx)
	if (!body || !h1 || h1 <= body) return 1.25
	// Heading 1 sits four steps above body on a conventional modular scale.
	return Math.round((h1 / body) ** (1 / 4) * 100) / 100
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Piecewise: 0 → lo, 0.5 → 1 (the preset), 1 → hi. */
const around1 = (t: number, lo: number, hi: number) => (t < 0.5 ? lerp(lo, 1, t / 0.5) : lerp(1, hi, (t - 0.5) / 0.5))
const round = (n: number, step = 0.001) => Math.round(n / step) * step

/**
 * Every colour this file writes goes through here. Generated colours are built
 * in gamut already; this also catches the derived ones (a harmonized status
 * colour, a border mixed toward the ink, a dark-mode lift of an exact brand),
 * which can step outside sRGB and would otherwise be clipped by the browser
 * into a different colour than the export describes.
 */
const formatOklch = (color: Oklch) => formatRaw(toGamut(color))

/** The chroma we asked for, or as much as sRGB can show at this l/h — whichever is less. */
const fitChroma = (l: number, c: number, h: number) => Math.min(c, maxChroma(l, h) * GAMUT_SAFETY)

function scaleLength(value: string, factor: number): string {
	const m = value.trim().match(/^(-?[\d.]+)(px|rem|em)$/)
	if (!m) return `calc(${value} * ${factor.toFixed(3)})`
	return `${round(Number(m[1]) * factor, m[2] === "px" ? 0.5 : 0.001)}${m[2]}`
}


/**
 * A brand color tuned per mode so the primary fill holds contrast in both.
 * Chroma is a ceiling, not a constant: at a fixed lightness sRGB holds far less
 * chroma for cyan and blue than for red, so a fixed 0.17 put 10 of the 24 strip
 * stops outside the gamut and the browser clipped them — the strip's saturation
 * went uneven and the picked brand was not the one painted.
 */
export function brandColor(hue: number, mode: "light" | "dark"): Oklch {
	// Yellows and limes are only vivid when light; push them up so they stay
	// saturated, and let the foreground flip to dark ink instead.
	const yellowish = hue >= 70 && hue <= 125
	const target = yellowish ? 0.16 : 0.17
	const l = mode === "light" ? (yellowish ? 0.8 : 0.56) : yellowish ? 0.84 : 0.72
	return { l, c: fitChroma(l, target, hue), h: hue, a: 1 }
}

/** The brand as picked — an exact hex, else the strip's hue — or null for the preset. */
export function brandSource(look: Look): Oklch | null {
	if (look.brand) {
		const parsed = hexToOklch(look.brand)
		if (parsed) return parsed
	}
	return look.hue == null ? null : brandColor(look.hue, "light")
}

/**
 * The brand for one mode. An exact colour is used as picked in light mode;
 * dark mode lifts it to a lightness that holds against a near-black page,
 * keeping its hue and chroma, so a deep navy stays navy instead of vanishing.
 */
export function brandFor(look: Look, mode: "light" | "dark"): Oklch | null {
	if (!look.brand) return look.hue == null ? null : brandColor(look.hue, mode)
	const src = brandSource(look)
	if (!src) return null
	const c = Math.min(src.c, 0.25)
	if (mode === "light") return toGamut({ ...src, c })
	// The lift keeps chroma the darker colour could hold; a lighter one may not.
	const l = Math.min(0.88, Math.max(src.l, 0.7))
	return { ...src, l, c: fitChroma(l, c, src.h) }
}

/** Text-safe tone at a given hue: legible as text on the page, vivid as a fill. */
function toneAt(h: number, c: number, mode: "light" | "dark"): Oklch {
	const hue = ((h % 360) + 360) % 360
	const yellowish = hue >= 70 && hue <= 125
	const l = mode === "light" ? (yellowish ? 0.62 : 0.55) : yellowish ? 0.82 : 0.74
	return { l, c: fitChroma(l, Math.min(Math.max(c, 0.11), 0.17), hue), h: hue, a: 1 }
}

/**
 * Material 3's harmonize: rotate toward the brand by half the gap, at most 15°.
 * Decorative tones pass a stronger pull; status colours keep the default cap.
 */
function harmonize(color: Oklch, brandHue: number, amount = 0.5, cap = 15): Oklch {
	const delta = hueDelta(color.h, brandHue)
	const rotate = Math.sign(delta) * Math.min(Math.abs(delta) * amount, cap)
	return { ...color, h: (color.h + rotate + 360) % 360 }
}

/**
 * Keep a decorative hue out of the status colours' territory. A generated
 * "edition" tone that lands within ~25° of destructive red reads as an error;
 * one near success green reads as a confirmation. Push it to the near edge of
 * the exclusion zone so it stays as close to its scheme position as it can.
 */
const STATUS_CLEARANCE = 25
function clearOfStatus(hue: number, statusHues: readonly number[]): number {
	const norm = (x: number) => ((x % 360) + 360) % 360
	const clear = (x: number) => statusHues.every((s) => Math.abs(hueDelta(s, x)) >= STATUS_CLEARANCE)
	// Search outward from the scheme position for the nearest clear hue. A push
	// away from one status colour can land on the next when two sit close
	// together (warning and destructive are ~30° apart), so test them all.
	for (let step = 0; step <= 180; step += 3) {
		if (clear(norm(hue + step))) return norm(hue + step)
		if (clear(norm(hue - step))) return norm(hue - step)
	}
	return norm(hue)
}

const DECORATIVE_TONES = ["tone-info", "tone-edition", "tone-collectible", "tone-standard"] as const

/**
 * Brand-only steps: an even lightness ramp, darkest to lightest, in the order
 * the tones usually stack (edition → collectible → standard → info). Chroma
 * eases off a little toward the light end so the ramp stays one family
 * instead of one shade dropping out as grey.
 */
const MONO_STEPS: Record<string, { dl: number; c: number }> = {
	"tone-edition": { dl: -0.12, c: 1 },
	"tone-collectible": { dl: -0.04, c: 0.95 },
	"tone-standard": { dl: 0.04, c: 0.85 },
	"tone-info": { dl: 0.12, c: 0.75 },
}

function monoTone(brand: Oklch, step: { dl: number; c: number }, mode: "light" | "dark"): Oklch {
	const base = toneAt(brand.h, brand.c, mode)
	// Dark mode reads lighter tones as the "front", so the ladder flips.
	const dl = mode === "light" ? step.dl : -step.dl
	const l = Math.min(0.9, Math.max(0.3, base.l + dl))
	return { ...base, l, c: fitChroma(l, base.c * step.c, base.h) }
}

/** Hue offsets from the brand for each decorative tone. */
const SCHEMES: Record<"analogous" | "triadic", Record<string, number>> = {
	analogous: { "tone-info": 30, "tone-edition": -30, "tone-collectible": 60, "tone-standard": -60 },
	triadic: { "tone-info": 120, "tone-edition": -120, "tone-collectible": 180, "tone-standard": 60 },
}

/** Ink that reads on a fill: near-white on dark fills, near-black on light ones. */
export function inkOn(fill: Oklch): Oklch {
	return fill.l > 0.68 ? { l: 0.2, c: 0.03, h: fill.h, a: 1 } : { l: 0.985, c: 0.01, h: fill.h, a: 1 }
}

const NEUTRAL_TINT: Record<Exclude<Neutrals, "theme">, { c: number; h: number | "brand" }> = {
	mono: { c: 0, h: 0 },
	warm: { c: 0.012, h: 70 },
	cool: { c: 0.012, h: 255 },
	brand: { c: 0.016, h: "brand" },
}

function tint(color: Oklch, neutrals: Exclude<Neutrals, "theme">, hue: number | null | undefined): Oklch {
	const spec = NEUTRAL_TINT[neutrals]
	const h = spec.h === "brand" ? (hue ?? color.h) : spec.h
	// Chroma tapers toward black and white, where a tint reads as a cast.
	const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, color.l)))
	return { ...color, c: spec.c * (0.35 + 0.65 * taper), h }
}

/** Colors that differ per mode, for one mode. */
function colorDecls(look: Look, base: ThemeBase, mode: "light" | "dark"): string[] {
	const resolved = base.colors?.[mode]
	const out: string[] = []
	if (!resolved) return out
	const brandHue = brandSource(look)?.h ?? null

	if (look.neutrals !== "theme") {
		for (const token of NEUTRAL_TOKENS) {
			const value = resolved[token]
			if (value && isNeutral(value)) out.push(`--${token}: ${formatOklch(tint(value, look.neutrals, brandHue))};`)
		}
	}

	// Quiet ↔ Bold, color half: edges soften toward the surface or firm toward
	// the ink. A quiet look leans on space; a bold one draws its boundaries.
	if (look.bold != null) {
		const t = look.bold / 100
		const bg = resolved.background
		const fg = resolved.foreground
		for (const token of ["border", "border-strong", "input"] as const) {
			const value = resolved[token]
			if (!value || !bg || !fg) continue
			const shifted = t < 0.5 ? mix(value, { ...bg, a: value.a }, (0.5 - t) * 1.1) : mix(value, { ...fg, a: value.a }, (t - 0.5) * 0.5)
			const tinted = look.neutrals !== "theme" && isNeutral(shifted) ? tint(shifted, look.neutrals, brandHue) : shifted
			out.push(`--${token}: ${formatOklch(tinted)};`)
		}
	}

	const brand = brandFor(look, mode)
	if (brand) {
		const ink = formatOklch(inkOn(brand))
		const fill = formatOklch(brand)
		if (look.primary === "brand") out.push(`--primary: ${fill};`, `--primary-foreground: ${ink};`)
		// A preset whose selection colour is a colour, not a tinted neutral
		// (Meridian's orange accent: pressed toggles, selected tabs), carries its
		// brand there too, so it follows the brand at its own depth. Neutral
		// accents are the Neutrals control's job, above.
		for (const token of ["accent", "sidebar-accent"] as const) {
			const value = resolved[token]
			if (!value || isNeutral(value)) continue
			const hued = { ...value, h: brand.h, c: fitChroma(value.l, value.c, brand.h) }
			out.push(`--${token}: ${formatOklch(hued)};`, `--${token}-foreground: ${formatOklch(inkOn(hued))};`)
		}
		out.push(
			`--ring: ${fill};`,
			`--highlight: ${fill};`,
			`--highlight-foreground: ${ink};`,
			`--sidebar-primary: ${fill};`,
			`--sidebar-primary-foreground: ${ink};`,
			`--sidebar-ring: ${fill};`,
		)
		// Bold looks let the brand reach selection fills, not just the primary.
		if (look.bold != null && look.bold > 60 && resolved.accent && resolved.background) {
			const strength = ((look.bold - 60) / 40) * 0.22
			const acc = mix(resolved.accent, { ...brand, l: mode === "light" ? 0.93 : 0.3 }, strength * 3)
			// A fill never moves without its ink: Meridian's orange accent, lifted
			// toward a light brand step, kept its white label at under 2:1.
			out.push(`--accent: ${formatOklch(acc)};`, `--accent-foreground: ${formatOklch(inkOn(acc))};`)
		}

		// The rest of the palette, built from the brand.
		if (look.palette === "preset") {
			// Brand only: the decorative tones become one family, the brand hue at
			// different depths plus a muted member, so charts and badges read as
			// monochrome brand rather than the preset's own colours.
			for (const [token, step] of Object.entries(MONO_STEPS)) {
				const tone = monoTone(brand, step, mode)
				out.push(`--${token}: ${formatOklch(tone)};`, `--${token}-foreground: ${formatOklch(inkOn(tone))};`)
			}
		} else {
			const statusHues: number[] = []
			for (const token of ["success", "destructive", "tone-warning"] as const) {
				const value = resolved[token]
				if (!value) continue
				const harmonized = harmonize(value, brand.h)
				statusHues.push(harmonized.h)
				out.push(`--${token}: ${formatOklch(harmonized)};`)
			}
			if (look.palette === "harmonize") {
				// Decorative tones keep their own identity but lean well toward the
				// brand, further than status colours, which must stay unmistakable.
				for (const token of DECORATIVE_TONES) {
					const value = resolved[token]
					if (!value) continue
					const tone = toneAt(harmonize(value, brand.h, 0.4, 35).h, Math.max(value.c, brand.c * 0.8), mode)
					out.push(`--${token}: ${formatOklch(tone)};`, `--${token}-foreground: ${formatOklch(inkOn(tone))};`)
				}
			} else {
				for (const [token, offset] of Object.entries(SCHEMES[look.palette])) {
					const tone = toneAt(clearOfStatus(brand.h + offset, statusHues), brand.c, mode)
					out.push(`--${token}: ${formatOklch(tone)};`, `--${token}-foreground: ${formatOklch(inkOn(tone))};`)
				}
			}
		}

		// Chart series: generated from the brand and this palette scheme, and
		// held to the validated palette's separation checks (chart-palette.ts).
		// Status hues are the ones this look paints, so a generated series never
		// lands on "error red" or "success green".
		const chartStatus = (["success", "destructive", "tone-warning"] as const)
			.map((token) => resolved[token])
			.filter((value): value is Oklch => Boolean(value))
			.map((value) => (look.palette === "preset" ? value.h : harmonize(value, brand.h).h))
		chartPalette(brand, look.palette, mode, (hue) => clearOfStatus(hue, chartStatus)).forEach((color, i) => {
			out.push(`--chart-${i + 1}: ${formatOklch(color)};`)
		})
	}
	return out
}

/**
 * The shadow ladder a look paints in one mode, or null to leave the preset's.
 * Depth scales whichever shape is chosen. A flat preset (Meridian, Prism) has
 * no shape to scale, so with its own style it stays flat up to the middle and
 * Soft fades in above it: lifting a flat preset should lift it, not do nothing.
 * Then the Advanced anchors set exact distance, blur and opacity on the top
 * step (the rest follow), and a light angle turns whatever comes out.
 */
export function shadowLadder(look: Look, base: ThemeBase, mode: "light" | "dark"): ShadowLadder | null {
	let ladder = shapedLadder(look, base, mode)
	if (!ladder) return null
	if (hasShadowAnchors(look)) {
		// Opacity is set in light mode's terms; dark mode scales by the same factor.
		const lightTop = definingDrop(mode === "light" ? ladder : (shapedLadder(look, base, "light") ?? ladder))?.color.a ?? 0
		const density = look.shadowOpacity != null ? densityFor(lightTop, look.shadowOpacity / 100) : null
		ladder = anchorLadder(ladder, { distance: look.shadowDistance, blur: look.shadowBlur, density })
	}
	return look.shadowAngle != null ? rotateLadder(ladder, look.shadowAngle) : ladder
}

const hasShadowAnchors = (look: Look) => look.shadowDistance != null || look.shadowBlur != null || look.shadowOpacity != null

function shapedLadder(look: Look, base: ThemeBase, mode: "light" | "dark"): ShadowLadder | null {
	const anchored = hasShadowAnchors(look)
	if (look.depth == null && look.shadows === "theme" && look.shadowAngle == null && !anchored) return null
	const fg = base.colors?.[mode]?.foreground
	const brandHue = brandSource(look)?.h ?? null
	const ink = shadowInk(fg && look.neutrals !== "theme" ? tint(fg, look.neutrals, brandHue) : fg, mode)
	const depth = look.depth ?? 50
	if (look.shadows !== "theme") return scaleLadder(recipeLadder(look.shadows, mode, ink), depthFactors(depth))
	const preset = base.shadows?.[mode]
	if (!preset) return null
	if (!isFlat(preset)) return scaleLadder(preset, depthFactors(depth))
	// Exact numbers on a flat preset need a shape to hold them: Soft, as authored.
	if (anchored) return recipeLadder("soft", mode, ink)
	if (depth <= 50) return look.shadowAngle != null ? preset : null
	const s = (depth - 50) / 50
	return scaleLadder(recipeLadder("soft", mode, ink), { length: 0.6 + 0.4 * s, alpha: s })
}

function shadowDecls(look: Look, base: ThemeBase, mode: "light" | "dark"): string[] {
	const ladder = shadowLadder(look, base, mode)
	return ladder ? SHADOW_STEPS.map((step) => `${shadowToken(step)}: ${formatShadow(ladder[step])};`) : []
}

/** The roundest each step may get — see the corners note in shapeDecls. */
const RADIUS_CEILING: Record<(typeof RADIUS_STEPS)[number], string> = {
	xs: "8px",
	sm: "12px",
	md: "18px",
	lg: "22px",
	xl: "28px",
}

/**
 * One step's radius in px at a Corners setting — the same curve shapeDecls
 * writes as CSS, so the slider's preview shows what the page will get.
 */
export function cornerRadius(step: (typeof RADIUS_STEPS)[number], presetPx: number, corners: number): number {
	const t = corners / 100
	if (t <= 0.5) return presetPx * (t / 0.5)
	const ceiling = Number.parseFloat(RADIUS_CEILING[step])
	return Math.min(presetPx + (ceiling - presetPx) * ((t - 0.5) / 0.5), ceiling)
}

/** Sable's own radius ladder, for sizing a preset that ships square. */
const SQUARE_LADDER: Record<(typeof RADIUS_STEPS)[number], number> = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 }

/** Mode-independent declarations: shape, scale, weight, type, motion. */
function shapeDecls(look: Look, base: ThemeBase): string[] {
	const out: string[] = []

	if (look.radiusBase != null) {
		const md = toPx(base.radius.md, base.rootPx)
		if (md) {
			const f = look.radiusBase / md
			for (const step of RADIUS_STEPS) {
				const value = base.radius[step]
				if (value) out.push(`--theme-radius-${step}: min(${scaleLength(value, f)}, ${RADIUS_CEILING[step]});`)
			}
		} else {
			// A square preset (Meridian) has no ladder to scale, so an exact medium
			// radius sets Sable's own ladder in proportion to it.
			const f = look.radiusBase / 12
			for (const step of RADIUS_STEPS) out.push(`--theme-radius-${step}: min(${round(SQUARE_LADDER[step] * f, 0.5)}px, ${RADIUS_CEILING[step]});`)
		}
	} else if (look.corners != null) {
		// The round end tops out where nesting still works. A row inside a
		// container gets the container's radius minus the inset; past roughly
		// `inset + row height / 2` every inner row turns into a pill and the
		// container stops reading as a box. So each step has a hard ceiling,
		// whatever the preset starts from.
		//
		// Squarer scales the preset's radii toward 0. Rounder moves each one
		// toward its ceiling rather than multiplying it: a multiplier left a
		// square preset (Meridian, every radius 0) square at any setting.
		const t = look.corners / 100
		for (const step of RADIUS_STEPS) {
			const raw = base.radius[step]
			if (!raw) continue
			// calc() rejects a unitless 0 beside a length.
			const value = raw.trim() === "0" ? "0px" : raw
			if (t <= 0.5) out.push(`--theme-radius-${step}: ${scaleLength(value, t / 0.5)};`)
			else {
				const k = ((t - 0.5) / 0.5).toFixed(3)
				out.push(`--theme-radius-${step}: min(calc(${value} + (${RADIUS_CEILING[step]} - ${value}) * ${k}), ${RADIUS_CEILING[step]});`)
			}
		}
	}
	if (look.buttons === "pill") out.push("--button-radius: 9999px;")
	if (look.buttons === "match") {
		// Buttons echo the small corner. But nothing nests inside a button, so the
		// ceiling that keeps containers reading as boxes does not apply to them:
		// past the preset scale they keep going, to a full pill at the round end.
		const k = look.radiusBase == null && look.corners != null && look.corners > 50 ? (look.corners - 50) / 50 : 0
		out.push(
			k > 0
				? `--button-radius: calc(var(--theme-radius-sm) + (var(--control-lg) / 2 - var(--theme-radius-sm)) * ${k.toFixed(3)});`
				: "--button-radius: var(--theme-radius-sm);",
		)
	}

	// Compact ↔ Airy: controls, spacing and type move together, so density is
	// one gesture instead of three settings that can contradict each other.
	// An anchor replaces the airy factor for its own domain only.
	const t = look.airy != null ? look.airy / 100 : 0.5
	const airy = look.airy != null
	const mdControl = toPx(base.control.md, base.rootPx)
	const controls = look.controlBase != null && mdControl ? look.controlBase / mdControl : airy ? around1(t, 0.8, 1.25) : null
	const spacing = look.spacingBase != null ? look.spacingBase / 8 : airy ? around1(t, 0.75, 1.4) : null
	if (controls != null) {
		for (const step of CONTROL_STEPS) {
			const value = base.control[step]
			if (value) out.push(`--control-${step}: ${scaleLength(value, controls)};`)
		}
	}
	if (spacing != null) {
		out.push(`--spacing: ${round(0.25 * spacing)}rem;`)
		out.push(`--control-gap: ${round(8 * spacing, 0.5)}px;`, `--item-px: ${round(8 * spacing, 0.5)}px;`, `--item-gap: ${round(8 * spacing, 0.5)}px;`)
	}
	if (look.typeBase != null || look.typeRatio != null) {
		// Each tier keeps its position on the preset's scale (its log-distance
		// from body, in steps of the preset ratio) and is re-spaced on the chosen
		// ratio from the chosen body size. Nothing drops under 10px.
		const bodyPx = toPx(base.typeSize["body-md"] || TYPE_SIZE_FALLBACK["body-md"], base.rootPx) ?? 15
		const r0 = presetTypeRatio(base)
		const r = look.typeRatio ?? r0
		const body = look.typeBase ?? bodyPx
		for (const tier of TYPE_SIZE_TIERS) {
			const px = toPx(base.typeSize[tier] || TYPE_SIZE_FALLBACK[tier], base.rootPx)
			if (!px) continue
			const steps = Math.log(px / bodyPx) / Math.log(r0)
			out.push(`--type-${tier}-size: ${round(Math.max(10, body * r ** steps), 0.1)}px;`)
		}
	} else if (airy) {
		const type = around1(t, 0.92, 1.1)
		for (const tier of TYPE_SIZE_TIERS) {
			const value = base.typeSize[tier] || TYPE_SIZE_FALLBACK[tier]
			if (value) out.push(`--type-${tier}-size: ${scaleLength(value, type)};`)
		}
	}

	// Quiet ↔ Bold, type half: three real weights (the families ship 500/600/700
	// as static instances), stepped rather than interpolated to a weight that
	// would silently snap.
	if (look.bold != null) {
		const t = look.bold / 100
		const strong = t < 0.34 ? 500 : t > 0.66 ? 700 : 600
		const label = t < 0.34 ? 500 : 600
		out.push(
			`--type-heading-weight: ${strong};`,
			`--type-title-weight: ${strong};`,
			`--type-label-lg-weight: ${label};`,
			`--type-label-md-weight: ${label};`,
		)
	}

	if (look.sans !== "theme") out.push(`--font-sans: ${stackFor(findFont(look.sans), look.sans, "sans-serif")};`)
	if (look.mono !== "theme") out.push(`--font-mono: ${stackFor(findFont(look.mono), look.mono, "monospace")};`)
	if (look.display === "sans") out.push("--font-display: var(--font-sans);")
	else if (look.display !== "theme") out.push(`--font-display: ${stackFor(findFont(look.display), look.display, "serif")};`)

	if (look.motionBase != null && base.motionBaseMs > 0) out.push(`--motion-scale: ${round(look.motionBase / base.motionBaseMs, 0.01)};`)
	else if (look.motion !== "default") out.push(`--motion-scale: ${MOTION_SCALE[look.motion]};`)
	return out
}

/**
 * The light block sits on :root, so it applies in BOTH modes; any colour it sets
 * that the dark block does not set again leaks its light value into dark mode.
 * (Prism with Mono neutrals: its light surfaces were retinted and its dark ones
 * were not, so dark mode got light wells and light selected toggles.) Every
 * colour token the light block declares is declared for dark too, from the
 * look's own dark value when it has one and the preset's dark value otherwise.
 */
function darkCovering(light: string[], dark: string[], base: ThemeBase): string[] {
	const name = (decl: string) => decl.slice(0, decl.indexOf(":"))
	const covered = new Set(dark.map(name))
	const out = [...dark]
	for (const decl of light) {
		const token = name(decl)
		if (covered.has(token)) continue
		const value = base.colors?.dark?.[token.slice(2) as keyof NonNullable<ThemeBase["colors"]>["dark"]]
		if (value) {
			out.push(`${token}: ${formatOklch(value)};`)
			covered.add(token)
		}
	}
	return out
}

/**
 * Render a look as CSS. Selectors are deliberately heavy (`:root:root:root`):
 * the export is pasted AFTER the theme CSS and must beat a theme's
 * `[data-sable-theme="x"].dark` block without `!important`, which would also
 * beat a consumer's own later override.
 */
export function toCss(look: Look, base: ThemeBase, themeId: string): string {
	const light = colorDecls(look, base, "light")
	// Shadows differ per mode, like colours, and are always written for both.
	const root = [...shapeDecls(look, base), ...light, ...shadowDecls(look, base, "light")]
	const dark = [...darkCovering(light, colorDecls(look, base, "dark"), base), ...shadowDecls(look, base, "dark")]

	const header = [
		"/* Sable look — paste AFTER your Sable imports:",
		`   @import "@sableui/react/styles.css";${themeId === "sable" ? "" : `\n   @import "@sableui/react/theme/${themeId}.css";  and set data-sable-theme="${themeId}" on <html>`}`,
		(() => {
			const url = googleFontsUrl(fontsInUse(look))
			return url ? `   Fonts: add to <head>
   <link rel="stylesheet" href="${url}">` : null
		})(),
		look.airy != null || look.spacingBase != null ? "   Spacing: --spacing rescales every Tailwind spacing utility, app-wide." : null,
		"*/",
	]
		.filter(Boolean)
		.join("\n")

	const blocks = [header]
	if (root.length) blocks.push(`:root:root:root {\n\t${root.join("\n\t")}\n}`)
	if (dark.length) blocks.push(`:root:root:root.dark {\n\t${dark.join("\n\t")}\n}`)
	if (!root.length && !dark.length) blocks.push("/* No overrides — the preset as shipped. */")
	return `${blocks.join("\n\n")}\n`
}

/* ── URL + storage encoding ─────────────────────────────────────────────────
 * Only fields that differ from the default are written, so a shared link stays
 * short and a future field decodes to its default. Unknown fields from older
 * looks are ignored. */

export function encodeLook(look: Look): string {
	const diff: Record<string, unknown> = {}
	for (const key of Object.keys(DEFAULT_LOOK) as (keyof Look)[]) {
		if (look[key] !== DEFAULT_LOOK[key]) diff[key] = look[key]
	}
	if (!Object.keys(diff).length) return ""
	return btoa(JSON.stringify(diff)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")
}

export function decodeLook(value: string | null | undefined): Look {
	if (!value) return DEFAULT_LOOK
	try {
		return sanitizeLook(JSON.parse(atob(value.replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>)
	} catch {
		return DEFAULT_LOOK
	}
}

const isNumeric = (key: keyof Look) =>
	key === "bold" || key === "airy" || key === "corners" || key === "depth" || key === "hue" || (ANCHOR_KEYS as readonly string[]).includes(key)

function sanitizeLook(parsed: Record<string, unknown>): Look {
	const look: Record<string, unknown> = { ...DEFAULT_LOOK }
	for (const key of Object.keys(DEFAULT_LOOK) as (keyof Look)[]) {
		if (key === "icons") continue // Migrate the retired fallback selection to Reicon.
		const v = parsed[key]
		const d = DEFAULT_LOOK[key]
		const numeric = isNumeric(key)
		if (numeric && ((typeof v === "number" && Number.isFinite(v)) || v === null)) look[key] = v
		else if (key === "brand" && (typeof v === "string" || v === null)) look[key] = v
		else if (!numeric && typeof v === typeof d) look[key] = v
	}
	return look as unknown as Look
}

/* ── Share links ─────────────────────────────────────────────────────────────
 * A share link spells the look out one setting per param, only where it
 * differs from the preset: `?theme=poppy&shadows=crisp&corners=40`. Readable,
 * short, and a future field still decodes to its default. */

/** The look's fields as share-link params; empty for an untouched look. */
export function lookToParams(look: Look): [string, string][] {
	const params: [string, string][] = []
	for (const key of Object.keys(DEFAULT_LOOK) as (keyof Look)[]) {
		const v = look[key]
		if (key === "icons" || v === DEFAULT_LOOK[key] || v == null) continue
		if (typeof v === "number") params.push([key, String(Math.round(v * 100) / 100)])
		else if (key === "brand") params.push([key, v.replace(/^#/, "")])
		else params.push([key, v])
	}
	return params
}

/** Whether a query string names any look field. */
export function hasLookParams(params: URLSearchParams): boolean {
	return (Object.keys(DEFAULT_LOOK) as (keyof Look)[]).some((key) => params.has(key))
}

/** Read a share link's look. Unknown or malformed values fall back to the default. */
export function lookFromParams(params: URLSearchParams): Look {
	const parsed: Record<string, unknown> = {}
	for (const key of Object.keys(DEFAULT_LOOK) as (keyof Look)[]) {
		const raw = params.get(key)
		if (!raw) continue
		if (isNumeric(key)) parsed[key] = Number(raw)
		else if (key === "brand") parsed[key] = /^#?[0-9a-f]{3,8}$/i.test(raw) ? `#${raw.replace(/^#/, "")}` : null
		else parsed[key] = raw
	}
	return sanitizeLook(parsed)
}

/** Every param a share link may carry, so the address bar can be cleared of them. */
export const SHARE_PARAMS = ["theme", "mode", "look", ...Object.keys(DEFAULT_LOOK)]
