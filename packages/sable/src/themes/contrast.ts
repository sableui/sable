/**
 * Contrast measurement for Sable's house readability checks.
 * A house pass is not WCAG conformance. `wcagRatioPasses` reports the relevant
 * contrast threshold separately; a rendered product still needs an audit.
 *
 * `token-docs.ts` reasons about contrast constantly — one token exists because
 * `foreground` elsewhere is "a contrast gamble that happens to pass in the default
 * theme and fails in another", another because opacity on text "can fall below the
 * contrast floor". Three tokens exist *specifically* to solve contrast problems.
 * And until this file, nothing measured any of it: five themes shipped, sixteen
 * theme tests, and not one asserted that a foreground was readable on its surface.
 *
 * A prose assertion about a number is not a contract. This makes it one.
 *
 * The pairing comes from each token's documented `pairsWith`, not from the
 * `X`/`X-foreground` naming convention, because the convention both over- and
 * under-counts: `muted-foreground` is documented for `background` and `card` as
 * well as `muted`, and the worst real failure found was on `card` — a pair the
 * naming convention does not even suggest.
 */

/** Linear-light sRGB, the space WCAG relative luminance is defined in. */
export type LinearRgb = [number, number, number]

/**
 * OKLCH → linear sRGB (Ottosson's matrices).
 *
 * Returns LINEAR values deliberately: WCAG luminance wants linear light, so
 * gamma-encoding here only to decode again would add a rounding trip for nothing.
 * Out-of-gamut components are left unclamped so callers can detect them; the
 * luminance helper clamps.
 */
export function oklchToLinearRgb(L: number, C: number, H: number): LinearRgb {
	const h = (H * Math.PI) / 180
	const a = C * Math.cos(h)
	const b = C * Math.sin(h)
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	]
}

/** `#rrggbb` → linear sRGB. */
export function hexToLinearRgb(hex: string): LinearRgb | null {
	const m = hex.trim().match(/^#([0-9a-f]{6})$/i)
	if (!m) return null
	const n = Number.parseInt(m[1], 16)
	const toLinear = (c: number) =>
		c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	return [
		toLinear(((n >> 16) & 255) / 255),
		toLinear(((n >> 8) & 255) / 255),
		toLinear((n & 255) / 255),
	]
}

/**
 * A parsed colour: linear-light sRGB plus its alpha channel.
 *
 * Alpha is not decoration here. Sable's dark themes draw their hairlines with
 * translucent borders — `oklch(32% 0.02 270 / 0.45)` in Prism, `oklch(from
 * var(--zinc-700) l c h / 0.4)` in one preset — so a contrast check that reads only
 * the opaque triplet measures a colour that never reaches a pixel. It would report
 * Prism's dark border against its dark card as if the border were three times
 * lighter than it renders. Anything gating a border must composite first.
 */
export interface ParsedColor {
	rgb: LinearRgb
	/** 0–1. Fully opaque unless the value carried a `/ alpha` component. */
	alpha: number
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

/** Linear-light → gamma-encoded sRGB. */
export function linearToSrgb(c: number): number {
	const v = clamp01(c)
	return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}

/** Gamma-encoded sRGB → linear light. */
export function srgbToLinear(c: number): number {
	const v = clamp01(c)
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

/**
 * `source-over` composite of a translucent colour onto an opaque surface.
 *
 * Blended in GAMMA-ENCODED sRGB rather than linear light, because that is what
 * browsers actually do: CSS alpha compositing happens in the (non-linear) sRGB
 * space unless a page opts into `color-interpolation` elsewhere. Blending in
 * linear light here would be more "correct" physically and less correct about the
 * pixel the gate is supposed to be measuring — a 0.4-alpha border would come out
 * measurably lighter than the browser paints it.
 */
export function compositeOver(fg: ParsedColor, surface: LinearRgb): LinearRgb {
	if (fg.alpha >= 1) return fg.rgb
	const a = clamp01(fg.alpha)
	return [0, 1, 2].map((i) => {
		const top = linearToSrgb(fg.rgb[i] as number)
		const bottom = linearToSrgb(surface[i] as number)
		return srgbToLinear(top * a + bottom * (1 - a))
	}) as unknown as LinearRgb
}

/**
 * Parse the colour notations a theme may author, alpha included:
 * `oklch(L C H[ / A])`, `#rrggbb`, `#rrggbbaa`.
 */
export function parseColorWithAlpha(value: string): ParsedColor | null {
	const v = value.trim()
	if (v.startsWith("#")) {
		const rgb = hexToLinearRgb(v.length === 9 ? v.slice(0, 7) : v)
		if (!rgb) return null
		const alpha = v.length === 9 ? Number.parseInt(v.slice(7), 16) / 255 : 1
		return { rgb, alpha: Number.isNaN(alpha) ? 1 : alpha }
	}
	const m = v.match(
		/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)/i,
	)
	if (!m) return null
	const rgb = oklchToLinearRgb(
		m[2] === "%" ? Number(m[1]) / 100 : Number(m[1]),
		Number(m[3]),
		Number(m[4]),
	)
	const alpha =
		m[5] === undefined ? 1 : m[6] === "%" ? Number(m[5]) / 100 : Number(m[5])
	return { rgb, alpha }
}

/**
 * Parse the colour notations a theme may author: `oklch(…)` or `#rrggbb`.
 *
 * Drops alpha. Kept for the opaque ink/surface pairs, where every value in every
 * shipped theme is opaque; anything that might be translucent must go through
 * `parseColorWithAlpha` + `compositeOver` instead.
 */
export function parseColor(value: string): LinearRgb | null {
	return parseColorWithAlpha(value)?.rgb ?? null
}

/** WCAG 2 relative luminance. */
export function luminance([r, g, b]: LinearRgb): number {
	return 0.2126 * clamp01(r) + 0.7152 * clamp01(g) + 0.0722 * clamp01(b)
}

/** WCAG 2 contrast ratio, 1–21. Verified: pure white on pure black = exactly 21. */
export function contrastRatio(a: LinearRgb, b: LinearRgb): number {
	const [l1, l2] = [luminance(a), luminance(b)]
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/**
 * The floor: WCAG 2 AA for normal-size text.
 *
 * 4.5 rather than 3.0 because these tokens carry body copy by definition —
 * `muted-foreground` is documented as "captions, helper text, timestamps", which
 * is normal-size text, not large text. AAA (7:1) is not the bar: 62 of 180
 * documented pairs sit below it, and raising the floor there would mean retuning
 * every theme's entire secondary-ink palette rather than fixing a defect.
 */
export const CONTRAST_FLOOR = 4.5

/* ──────────────────────────────────────────────────────────────────────────────
   Perceptual contrast (APCA).

   APCA is an additional design signal whose interpretation depends on size,
   weight and polarity. It cannot waive a WCAG 2 contrast ratio requirement.
   `evaluateContrast().passes` retains the historical house-policy result for
   diagnostics; shipped-theme tests require `wcagRatioPasses` independently.
   The report shows both measurements. A dark ink, a darker fill, or a larger
   text treatment is an art-direction decision to verify in the rendered design.
   ────────────────────────────────────────────────────────────────────────────── */

/** Gamma-encoded sRGB channel, the space APCA's luminance is defined on. */
const toSrgb = linearToSrgb

/**
 * APCA-W3 0.1.9 lightness contrast, `Lc`.
 *
 * Sign carries polarity: negative = light ink on a dark surface, positive = dark
 * ink on a light surface. Magnitude is predicted perceptual contrast. Note this
 * uses a simple 2.4 exponent on the *encoded* channel — deliberately NOT the
 * piecewise transfer WCAG luminance uses, which is why it re-encodes rather than
 * reusing the linear values.
 */
export function apcaLc(ink: LinearRgb, surface: LinearRgb): number {
	const Y = (rgb: LinearRgb) => {
		const [r, g, b] = rgb.map(toSrgb)
		const y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4
		// Soft-clamp near-black so very dark surfaces don't overstate contrast.
		return y < 0.022 ? y + (0.022 - y) ** 1.414 : y
	}
	const Yt = Y(ink)
	const Yb = Y(surface)
	if (Math.abs(Yb - Yt) < 0.0005) return 0
	let out: number
	if (Yb > Yt) {
		const s = (Yb ** 0.56 - Yt ** 0.57) * 1.14
		out = s < 0.035 ? 0 : s - 0.027
	} else {
		const s = (Yb ** 0.65 - Yt ** 0.62) * 1.14
		out = s > -0.035 ? 0 : s + 0.027
	}
	return out * 100
}

/**
 * The perceptual floor, in APCA `Lc`.
 *
 * 60 is Sable's historical diagnostic threshold. It is not a promise that
 * text at any size and weight is readable, nor an alternative WCAG threshold.
 */
export const PERCEPTUAL_FLOOR = 60

/**
 * The bottom nobody may pass under, whatever APCA says.
 *
 * Without it, "or APCA" is an open door: a pair could fail WCAG catastrophically
 * and still be waved through on the strength of the other model. 3.0 is WCAG's own
 * floor for large text and non-text UI components. It does not satisfy the
 * normal-text criterion; the separate wcagRatioPasses field remains false.
 */
export const WCAG_HARD_FLOOR = 3.0

export interface ContrastVerdict {
	ratio: number
	lc: number
	/** Meets the ratio threshold being measured, not whole-product conformance. */
	wcagRatioPasses: boolean
	/** Passes Sable's house readability/visibility policy, which may be weaker. */
	passes: boolean
	/** Which model carried it — for reporting, so an override is never silent. */
	basis: "wcag" | "perceptual" | "visibility" | "none"
}

/**
 * House readability gate. Reports the normal-text WCAG ratio independently so
 * APCA cannot silently substitute for it. See https://www.w3.org/TR/WCAG22/#contrast-minimum.
 */
export function evaluateContrast(ink: LinearRgb, surface: LinearRgb): ContrastVerdict {
	const ratio = contrastRatio(ink, surface)
	const lc = apcaLc(ink, surface)
	const wcagRatioPasses = ratio >= CONTRAST_FLOOR
	if (wcagRatioPasses) return { ratio, lc, wcagRatioPasses, passes: true, basis: "wcag" }
	if (Math.abs(lc) >= PERCEPTUAL_FLOOR && ratio >= WCAG_HARD_FLOOR) {
		return { ratio, lc, wcagRatioPasses, passes: true, basis: "perceptual" }
	}
	return { ratio, lc, wcagRatioPasses, passes: false, basis: "none" }
}

/* ──────────────────────────────────────────────────────────────────────────────
   Non-text contrast.

   Everything above measures INK on a SURFACE. Nothing measured the other half of
   what a theme draws: the structural marks — a form-control outline, a focus
   ring, a divider — which carry no ink at all and are invisible to a check that
   only looks at `*-foreground` tokens. That is the "invisible input outline"
   defect class, and it had no gate.

   WCAG 1.4.11 puts non-text UI components at 3:1, and APCA's own guidance puts
   the equivalent spot-reading floor around Lc 30. Same dual-gate shape as the
   text check for HOUSE readability. Only the ratio can satisfy WCAG 1.4.11.
   ────────────────────────────────────────────────────────────────────────────── */

/** WCAG 1.4.11's floor for non-text UI components and graphical objects. */
export const NON_TEXT_FLOOR = 3.0

/** Sable's historical perceptual diagnostic threshold for non-text marks. */
export const NON_TEXT_PERCEPTUAL_FLOOR = 30

/**
 * Historical house-policy floor for diagnostics. The shipped-theme focus gate
 * uses NON_TEXT_FLOOR and cannot pass through this weaker branch.
 */
export const NON_TEXT_HARD_FLOOR = 2.0

/**
 * The `hairline` tier's floor — a VISIBILITY floor, not a conformance one.
 *
 * A house heuristic for decorative lines. It does not establish visibility for
 * every person or display. When a boundary is required to identify a control,
 * WCAG 1.4.11 requires 3:1; a faint decorative divider has different obligations.
 * The report lists all boundary pairs below 3:1 for a rendered review of those
 * cues. Existing values below this house floor remain counted exemptions in
 * themes.test.ts, rather than being reported as conforming.
 */
export const HAIRLINE_VISIBILITY_FLOOR = 1.1

/**
 * How strictly a structural token is held.
 *
 * - `focus` — checks the 1.4.11 non-text ratio and the house perceptual floor
 *   separately. WCAG 2.4.11 concerns obscuration, not a numeric contrast floor;
 *   2.4.13 adds focus appearance requirements at AAA. A house pass here does
 *   not establish either criterion. https://www.w3.org/TR/WCAG22/#non-text-contrast
 * - `hairline` — the visibility floor above. A divider is entitled to be quiet;
 *   it is not entitled to be absent.
 */
export type NonTextTier = "focus" | "hairline"

/**
 * Which structural tokens must be visible against which surfaces, and how hard.
 *
 * `token-docs.ts`'s `pairsWith` was the first choice — it is the authoritative
 * pairing statement for the text check — but it does not carry these: `border`,
 * `border-strong`, `input` and `ring` have no `pairsWith` at all, because that
 * field answers "which surface is this INK legible on", and a hairline is not
 * ink. Rather than overload the field with a second meaning, the non-text pairing
 * is stated here, next to the floors that consume it.
 */
export const NON_TEXT_PAIRS: Record<
	string,
	{ surfaces: readonly string[]; tier: NonTextTier }
> = {
	// The chrome hairlines, on every page surface a bounded element sits on.
	border: { surfaces: ["background", "card", "popover", "muted"], tier: "hairline" },
	"border-strong": {
		surfaces: ["background", "card", "popover", "muted"],
		tier: "hairline",
	},
	// A form control's outline IS the control's boundary — the case that names
	// this whole defect class, since an invisible outline makes a text field
	// indistinguishable from the surface it sits on.
	input: { surfaces: ["background", "card", "popover", "muted"], tier: "hairline" },
	ring: { surfaces: ["background", "card", "popover", "muted"], tier: "focus" },
	// The sidebar family repeats the set against its own surface, which is exactly
	// why it exists as a family (see token-docs: "tuned against `sidebar`").
	"sidebar-border": { surfaces: ["sidebar"], tier: "hairline" },
	"sidebar-ring": { surfaces: ["sidebar"], tier: "focus" },
}

/**
 * The non-text gate. Same two-model shape as `evaluateContrast` for the `focus`
 * tier; the `hairline` tier is a single visibility floor, because APCA has no
 * meaningful reading down there — it soft-clamps to exactly 0 for most of the
 * band, which would wave through the byte-identical pair this is here to catch.
 */
export function evaluateNonTextContrast(
	mark: LinearRgb,
	surface: LinearRgb,
	tier: NonTextTier = "focus",
): ContrastVerdict {
	const ratio = contrastRatio(mark, surface)
	const lc = apcaLc(mark, surface)
	const wcagRatioPasses = ratio >= NON_TEXT_FLOOR
	if (tier === "hairline") {
		const passes = ratio >= HAIRLINE_VISIBILITY_FLOOR
		return { ratio, lc, wcagRatioPasses, passes, basis: wcagRatioPasses ? "wcag" : passes ? "visibility" : "none" }
	}
	if (wcagRatioPasses) return { ratio, lc, wcagRatioPasses, passes: true, basis: "wcag" }
	if (Math.abs(lc) >= NON_TEXT_PERCEPTUAL_FLOOR && ratio >= NON_TEXT_HARD_FLOOR) {
		return { ratio, lc, wcagRatioPasses, passes: true, basis: "perceptual" }
	}
	return { ratio, lc, wcagRatioPasses, passes: false, basis: "none" }
}

/* ──────────────────────────────────────────────────────────────────────────────
   sRGB gamut.
   ────────────────────────────────────────────────────────────────────────────── */

/**
 * How far outside [0,1] a linear component may sit and still count as in-gamut.
 *
 * Not zero, because the OKLCH → linear matrices are floating-point and a value
 * authored exactly at the gamut boundary (pure white, a maximally saturated
 * primary) round-trips to 1.0000000004. A tolerance this small cannot hide a real
 * excursion: the ones that matter overshoot by whole percent.
 */
export const GAMUT_EPSILON = 1e-4

/**
 * Is this colour representable in sRGB?
 *
 * `oklchToLinearRgb` deliberately leaves out-of-gamut components unclamped "so
 * callers can detect them" — this is the caller that does. An out-of-gamut OKLCH
 * value does not error; the browser clips it, per channel, and clipping is not
 * monotonic in lightness. Two adjacent steps of a ramp authored past the boundary
 * can clip to the SAME rendered colour, which erases a step of the ramp with no
 * symptom other than a design that quietly stops working.
 */
export function isInSrgbGamut(rgb: LinearRgb, epsilon = GAMUT_EPSILON): boolean {
	return rgb.every((c) => c >= -epsilon && c <= 1 + epsilon)
}

/** How far outside sRGB, in linear units — 0 when in gamut. Used for reporting. */
export function gamutExcursion(rgb: LinearRgb): number {
	return Math.max(0, ...rgb.map((c) => Math.max(-c, c - 1)))
}
