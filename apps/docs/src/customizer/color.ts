/**
 * Color plumbing for the customizer: read a preset's REAL token values (both
 * modes) and do OKLCH math on them.
 *
 * Why read instead of hardcode: a neutral tint or a border-emphasis shift has
 * to start from what the active preset actually paints, and presets author in
 * oklch, hex and color-mix alike. The browser resolves all of them; we read the
 * result from an off-screen probe that carries the preset's own selectors
 * (`data-sable-theme` + optional `.dark`), so <html> never toggles modes and
 * nothing on the page transitions or flashes while we measure.
 */

export interface Oklch {
	l: number // 0–1
	c: number
	h: number // degrees
	a: number // alpha 0–1
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function srgbToLinear(c: number) {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	]
}

function labToLch(L: number, a: number, b: number, alpha: number): Oklch {
	const c = Math.sqrt(a * a + b * b)
	const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
	return { l: L, c, h, a: alpha }
}

const num = (s: string) => (s.trim().endsWith("%") ? Number.parseFloat(s) / 100 : Number.parseFloat(s))

/** Parse a computed color string (oklch / oklab / rgb / color(srgb)). */
export function parseColor(value: string): Oklch | null {
	const v = value.trim()
	let m = v.match(/^oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/)]+)(?:\s*\/\s*([^\s)]+))?\s*\)$/i)
	if (m) {
		const l = num(m[1]) > 1.5 ? num(m[1]) / 100 : num(m[1])
		return { l, c: Number.parseFloat(m[2]) || 0, h: Number.parseFloat(m[3]) || 0, a: m[4] ? num(m[4]) : 1 }
	}
	m = v.match(/^oklab\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/)]+)(?:\s*\/\s*([^\s)]+))?\s*\)$/i)
	if (m) return labToLch(num(m[1]) > 1.5 ? num(m[1]) / 100 : num(m[1]), Number.parseFloat(m[2]), Number.parseFloat(m[3]), m[4] ? num(m[4]) : 1)
	m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.%]+))?\s*\)$/i)
	if (m) {
		const [r, g, b] = [m[1], m[2], m[3]].map((x) => srgbToLinear(Number(x) / 255))
		return labToLch(...linearRgbToOklab(r, g, b), m[4] ? num(m[4]) : 1)
	}
	m = v.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)$/i)
	if (m) {
		const [r, g, b] = [m[1], m[2], m[3]].map((x) => srgbToLinear(Number(x)))
		return labToLch(...linearRgbToOklab(r, g, b), m[4] ? num(m[4]) : 1)
	}
	return null
}

export function formatOklch({ l, c, h, a }: Oklch): string {
	const L = `${(clamp01(l) * 100).toFixed(1)}%`
	const C = Math.max(0, c).toFixed(4)
	const H = h.toFixed(1)
	// design-lint-disable-next-line inline-color -- this is the colour formatter: it writes the computed values the look exports
	return a < 0.999 ? `oklch(${L} ${C} ${H} / ${a.toFixed(3)})` : `oklch(${L} ${C} ${H})`
}

/** Tokens whose job is neutral surfaces, ink and edges — the ones a tint moves. */
export const NEUTRAL_TOKENS = [
	"background", "foreground",
	"card", "card-foreground",
	"popover", "popover-foreground",
	"muted", "muted-foreground",
	"secondary", "secondary-foreground",
	"accent", "accent-foreground",
	"border", "border-strong", "input",
	"sidebar", "sidebar-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border",
] as const

/** Tokens read for preset swatches and emphasis math. */
export const PROBE_TOKENS = [
	...NEUTRAL_TOKENS,
	"primary", "primary-foreground", "ring", "highlight",
	// Status + decorative tones, so a generated palette can harmonize from the
	// preset's own values instead of replacing them blind.
	"success", "destructive", "tone-warning", "tone-info", "tone-standard", "tone-collectible", "tone-edition",
] as const

export type ResolvedTokens = Record<string, Oklch>
export interface ResolvedTheme {
	light: ResolvedTokens
	dark: ResolvedTokens
	fontSans: string
	fontMono: string
	fontDisplay: string
}

/**
 * Resolve a preset's tokens in both modes without touching <html>. The probe
 * declares the preset's own selectors on itself, so the values it reads are
 * the preset's — not the inherited page values, and not the look's overrides
 * (which target :root only).
 */
export function resolveTheme(themeId: string): ResolvedTheme {
	const read = (dark: boolean): ResolvedTokens => {
		const probe = document.createElement("div")
		probe.setAttribute("data-sable-theme", themeId)
		probe.setAttribute("aria-hidden", "true")
		// `.light` pins the light read: under a dark <html>, `.dark [data-sable-theme]:not(.light)`
		// would otherwise hand back the dark values for "light" too.
		probe.className = dark ? "dark" : "light"
		probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none"
		const swatch = document.createElement("span")
		probe.appendChild(swatch)
		document.body.appendChild(probe)
		const out: ResolvedTokens = {}
		for (const token of PROBE_TOKENS) {
			swatch.style.color = `var(--${token})`
			const parsed = parseColor(getComputedStyle(swatch).color)
			if (parsed) out[token] = parsed
		}
		probe.remove()
		return out
	}
	const font = (variable: string) => {
		const probe = document.createElement("div")
		probe.setAttribute("data-sable-theme", themeId)
		probe.style.cssText = `position:absolute;visibility:hidden;font-family:${variable}`
		document.body.appendChild(probe)
		const value = getComputedStyle(probe).fontFamily
		probe.remove()
		return value
	}
	return {
		light: read(false),
		dark: read(true),
		fontSans: font("var(--font-sans)"),
		fontMono: font("var(--font-mono)"),
		fontDisplay: font("var(--font-display, var(--font-sans))"),
	}
}

/** Is this token actually neutral in this preset? Meridian's accent is orange. */
export const isNeutral = (c: Oklch) => c.c < 0.045

export function mix(a: Oklch, b: Oklch, t: number): Oklch {
	// Interpolate in lightness only plus chroma; hue follows the more chromatic.
	return { l: a.l + (b.l - a.l) * t, c: a.c + (b.c - a.c) * t, h: a.c >= b.c ? a.h : b.h, a: a.a + (b.a - a.a) * t }
}

/* ── Hex ↔ OKLCH ─────────────────────────────────────────────────────────── */

function linearToSrgb(c: number) {
	return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

export function hexToOklch(hex: string): Oklch | null {
	const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
	if (!m) return null
	const full = m[1].length === 3 ? m[1].split("").map((ch) => ch + ch).join("") : m[1]
	const [r, g, b] = [0, 2, 4].map((i) => srgbToLinear(Number.parseInt(full.slice(i, i + 2), 16) / 255))
	return labToLch(...linearRgbToOklab(r, g, b), 1)
}

/** OKLCH → linear sRGB, unclamped: a channel outside 0–1 means out of gamut. */
function oklchToLinearRgb(l: number, c: number, h: number): [number, number, number] {
	const rad = (h * Math.PI) / 180
	const A = c * Math.cos(rad)
	const B = c * Math.sin(rad)
	const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3
	const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3
	const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3
	return [
		4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
		-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
		-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
	]
}

const GAMUT_EPSILON = 1e-4

/** Does this colour exist in sRGB, or will the browser have to clip it? */
export function inGamut({ l, c, h }: Pick<Oklch, "l" | "c" | "h">): boolean {
	return oklchToLinearRgb(l, c, h).every((v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON)
}

/**
 * The most chroma sRGB can show at this lightness and hue. Binary search:
 * the gamut is convex enough along chroma that "in" and "out" never alternate.
 */
export function maxChroma(l: number, h: number): number {
	if (l <= 0 || l >= 1) return 0
	let lo = 0
	let hi = 0.4
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2
		if (inGamut({ l, c: mid, h })) lo = mid
		else hi = mid
	}
	return lo
}

/** Headroom under the gamut edge, so rounding in the CSS string never clips. */
export const GAMUT_SAFETY = 0.98

/**
 * Keep a generated colour inside sRGB by giving up chroma — never lightness or
 * hue, which are what a palette is built on. In-gamut colours pass untouched.
 */
export function toGamut(color: Oklch, safety = GAMUT_SAFETY): Oklch {
	if (inGamut(color)) return color
	return { ...color, c: maxChroma(color.l, color.h) * safety }
}

/**
 * Hex for an OKLCH colour, gamut-mapped by reducing chroma — the same mapping
 * the preview gets from `toGamut`, so the exported hex is the painted colour.
 * Per-channel clamping would shift the hue instead (a clipped cyan goes green).
 */
export function oklchToHex(color: Oklch): string {
	const l = clamp01(color.l)
	const c = inGamut({ l, c: color.c, h: color.h }) ? color.c : maxChroma(l, color.h)
	const rgb = oklchToLinearRgb(l, Math.max(0, c), color.h)
	return `#${rgb.map((v) => Math.round(clamp01(linearToSrgb(clamp01(v))) * 255).toString(16).padStart(2, "0")).join("")}`
}

/** Shortest signed angle from a to b, in degrees (−180…180). */
export function hueDelta(a: number, b: number): number {
	return ((((b - a) % 360) + 540) % 360) - 180
}
