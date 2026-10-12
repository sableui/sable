import { describe, expect, it } from "vitest"
import {
	CONTRAST_FLOOR,
	GAMUT_EPSILON,
	HAIRLINE_VISIBILITY_FLOOR,
	NON_TEXT_FLOOR,
	NON_TEXT_PAIRS,
	NON_TEXT_PERCEPTUAL_FLOOR,
	PERCEPTUAL_FLOOR,
	WCAG_HARD_FLOOR,
	apcaLc,
	compositeOver,
	contrastRatio,
	evaluateContrast,
	evaluateNonTextContrast,
	checkLabelledFills,
	fitFillToInk,
	inkFor,
	inkPolarity,
	labelContrast,
	maxChromaAt,
	gamutExcursion,
	isInSrgbGamut,
	oklchToLinearRgb,
	parseColor,
	parseColorWithAlpha,
} from "./contrast"

const c = (v: string) => {
	const parsed = parseColor(v)
	if (!parsed) throw new Error(`unparseable: ${v}`)
	return parsed
}

const WHITE = c("#ffffff")
const BLACK = c("#000000")
/** The accent that forced this: a real brand orange the ratio model gets wrong. */
const ACCENT = c("oklch(65.2% 0.235 32.9)")
/** That theme's own warm near-black — the "obvious" ink the ratio prefers. */
const WARM_BLACK = c("oklch(14.1% 0.018 70.5)")

describe("WCAG ratio", () => {
	it("is 21:1 for white on black", () => {
		expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 1)
	})

	it("is symmetric — which is exactly its blind spot", () => {
		// Not a quirk to work around: this IS why the ratio cannot tell you which
		// polarity to use, and why APCA had to be added below.
		expect(contrastRatio(WHITE, ACCENT)).toBeCloseTo(contrastRatio(ACCENT, WHITE), 5)
	})
})

describe("APCA Lc", () => {
	/*
	 * Pinned against the published APCA-W3 0.1.9 figures for this exact colour.
	 * The whole contrast gate now rests on this implementation, so it must not be
	 * free to drift: a silent regression here would quietly widen the gate for
	 * every theme rather than failing loudly.
	 */
	it("matches the reference implementation on the orange case", () => {
		expect(apcaLc(WHITE, ACCENT)).toBeCloseTo(-66.9, 0)
		expect(apcaLc(BLACK, ACCENT)).toBeCloseTo(42.6, 0)
		expect(apcaLc(WARM_BLACK, ACCENT)).toBeCloseTo(42.4, 0)
	})

	it("ranks white ABOVE black on that orange, where the ratio ranks them the other way", () => {
		// The disagreement in one assertion. If this ever flips, the reason this
		// module exists has gone with it.
		expect(Math.abs(apcaLc(WHITE, ACCENT))).toBeGreaterThan(Math.abs(apcaLc(WARM_BLACK, ACCENT)))
		expect(contrastRatio(WHITE, ACCENT)).toBeLessThan(contrastRatio(WARM_BLACK, ACCENT))
	})

	it("signs polarity: negative for light ink on dark, positive for dark on light", () => {
		expect(apcaLc(WHITE, BLACK)).toBeLessThan(0)
		expect(apcaLc(BLACK, WHITE)).toBeGreaterThan(0)
	})

	it("returns 0 for a pair with no meaningful separation", () => {
		expect(apcaLc(WHITE, WHITE)).toBe(0)
	})
})

describe("evaluateContrast — the gate", () => {
	it("passes a conforming pair on WCAG and says so", () => {
		const v = evaluateContrast(WHITE, BLACK)
		expect(v.passes).toBe(true)
		expect(v.basis).toBe("wcag")
		expect(v.wcagRatioPasses).toBe(true)
	})

	it("passes white on the accent perceptually, and reports which model carried it", () => {
		const v = evaluateContrast(WHITE, ACCENT)
		expect(v.ratio).toBeLessThan(CONTRAST_FLOOR) // fails the ratio
		expect(Math.abs(v.lc)).toBeGreaterThan(PERCEPTUAL_FLOOR) // clears perception
		expect(v.passes).toBe(true)
		expect(v.basis).toBe("perceptual")
		expect(v.wcagRatioPasses).toBe(false)
	})

	it("still passes the dark-ink alternative on the ratio — both are permitted, the theme chooses", () => {
		// The gate's job is to reject the unreadable, not to pick a look.
		const v = evaluateContrast(WARM_BLACK, ACCENT)
		expect(v.passes).toBe(true)
		expect(v.basis).toBe("wcag")
	})

	it("rejects a pair that fails both models", () => {
		const v = evaluateContrast(c("oklch(62% 0.02 90)"), c("oklch(68% 0.02 90)"))
		expect(v.passes).toBe(false)
		expect(v.basis).toBe("none")
	})

	it("will not let APCA wave through a pair below the hard ratio floor", () => {
		/*
		 * The open-door risk: without WCAG_HARD_FLOOR, "or APCA" is a bypass rather
		 * than a widening. This is not hypothetical — a gamut sweep finds ~1380
		 * colours where perception clears the floor while the ratio sits under 3.0,
		 * concentrated in high-chroma cyans around 57% lightness. One of them:
		 */
		const exploit = c("oklch(57% 0.35 180)")
		const v = evaluateContrast(WHITE, exploit)
		expect(Math.abs(v.lc)).toBeGreaterThanOrEqual(PERCEPTUAL_FLOOR) // perception says fine
		expect(v.ratio).toBeLessThan(WCAG_HARD_FLOOR) // the ratio says nowhere near
		expect(v.passes).toBe(false) // the guard holds
		expect(v.basis).toBe("none")
	})
})

describe("alpha", () => {
	/** Prism's dark border and the card it is drawn on. */
	const TRANSLUCENT = "oklch(32% 0.02 270 / 0.45)"
	const DARK_CARD = c("oklch(17% 0.025 268)")

	it("reads the alpha component instead of dropping it", () => {
		expect(parseColorWithAlpha(TRANSLUCENT)?.alpha).toBeCloseTo(0.45, 5)
		expect(parseColorWithAlpha("oklch(32% 0.02 270)")?.alpha).toBe(1)
		expect(parseColorWithAlpha("#80402040")?.alpha).toBeCloseTo(64 / 255, 5)
	})

	it("measures a translucent border far darker than its opaque triplet", () => {
		// The whole reason compositing had to come first. Read as opaque, this
		// border looks like a usable line; painted at 0.45 alpha on the card it
		// actually sits on, it is barely there — and the second number is the one
		// the user sees.
		const parsed = parseColorWithAlpha(TRANSLUCENT)
		if (!parsed) throw new Error("unparseable")
		const opaque = contrastRatio(parsed.rgb, DARK_CARD)
		const painted = contrastRatio(compositeOver(parsed, DARK_CARD), DARK_CARD)
		expect(opaque).toBeGreaterThan(painted)
		expect(painted).toBeLessThan(1.3)
	})

	it("leaves an opaque colour untouched", () => {
		const parsed = parseColorWithAlpha("#ffffff")
		if (!parsed) throw new Error("unparseable")
		expect(compositeOver(parsed, BLACK)).toEqual(parsed.rgb)
	})

	it("composites a fully transparent colour into the surface exactly", () => {
		const painted = compositeOver({ rgb: WHITE, alpha: 0 }, DARK_CARD)
		expect(contrastRatio(painted, DARK_CARD)).toBeCloseTo(1, 3)
	})
})

describe("evaluateNonTextContrast — the structural gate", () => {
	it("passes a focus ring that conforms outright", () => {
		const v = evaluateNonTextContrast(c("oklch(55% 0.2 282)"), WHITE, "focus")
		expect(v.ratio).toBeGreaterThanOrEqual(NON_TEXT_FLOOR)
		expect(v.passes).toBe(true)
		expect(v.basis).toBe("wcag")
	})

	it("carries a focus ring on perception when the ratio just misses", () => {
		// Sable's light ring on its page background: 2.88:1, Lc 55.1. The ratio
		// says no by a hair; perception says comfortably yes, and the hard floor
		// keeps that from being a bypass.
		const v = evaluateNonTextContrast(c("oklch(70.9% 0.0064 286)"), WHITE, "focus")
		expect(v.ratio).toBeLessThan(NON_TEXT_FLOOR)
		expect(Math.abs(v.lc)).toBeGreaterThanOrEqual(NON_TEXT_PERCEPTUAL_FLOOR)
		expect(v.passes).toBe(true)
		expect(v.basis).toBe("perceptual")
	})

	it("rejects a focus ring that neither model can see", () => {
		const v = evaluateNonTextContrast(c("oklch(94% 0.01 282)"), WHITE, "focus")
		expect(v.passes).toBe(false)
		expect(v.basis).toBe("none")
	})

	it("holds hairlines to visibility rather than to conformance", () => {
		// A quiet hairline is the house style — 1.4:1 is a real Sable border and
		// must not be a build failure. What must fail is a line that isn't there.
		const quiet = evaluateNonTextContrast(c("oklch(92% 0 0)"), WHITE, "hairline")
		expect(quiet.ratio).toBeLessThan(NON_TEXT_FLOOR)
		expect(quiet.ratio).toBeGreaterThanOrEqual(HAIRLINE_VISIBILITY_FLOOR)
		expect(quiet.passes).toBe(true)
		expect(quiet.wcagRatioPasses).toBe(false)
		expect(quiet.basis).toBe("visibility")
	})

	it("rejects a hairline that is the same colour as its surface", () => {
		// The defect the tier exists for: Meridian's dark `--border` IS its
		// `--muted`. APCA reads exactly 0 here, which is why the hairline tier does
		// not offer a perceptual arm — it would wave this straight through.
		const v = evaluateNonTextContrast(c("oklch(27.1% 0.0143 101.41)"), c("oklch(27.1% 0.0143 101.41)"), "hairline")
		expect(v.ratio).toBeCloseTo(1, 5)
		expect(v.lc).toBe(0)
		expect(v.passes).toBe(false)
	})

	it("covers every structural token the contract declares, with a tier each", () => {
		// A token added to the contract and forgotten here is a gate that silently
		// does not run — the exact shape of the gap this whole file closes.
		expect(Object.keys(NON_TEXT_PAIRS).sort()).toEqual(
			["border", "border-strong", "control-border", "input", "ring", "sidebar-border", "sidebar-ring"],
		)
		for (const [token, pair] of Object.entries(NON_TEXT_PAIRS)) {
			expect(pair.surfaces.length, `${token} pairs with no surface`).toBeGreaterThan(0)
			expect(["focus", "control", "hairline"]).toContain(pair.tier)
		}
	})
})

describe("sRGB gamut", () => {
	it("accepts the extremes without tripping on float noise", () => {
		expect(isInSrgbGamut(WHITE)).toBe(true)
		expect(isInSrgbGamut(BLACK)).toBe(true)
		expect(isInSrgbGamut(oklchToLinearRgb(1, 0, 0))).toBe(true)
	})

	it("detects a colour OKLCH can name and sRGB cannot show", () => {
		// A real shipped value: Sable's `--tone-collectible`. Blue overshoots by
		// 0.41 in linear light, so the browser clips it and renders a colour the
		// theme never authored.
		const outside = oklchToLinearRgb(0.72, 0.225, 285)
		expect(isInSrgbGamut(outside)).toBe(false)
		expect(gamutExcursion(outside)).toBeCloseTo(0.412, 3)
	})

	it("reports zero excursion for anything in gamut", () => {
		expect(gamutExcursion(WHITE)).toBe(0)
		expect(gamutExcursion(c("oklch(50% 0.05 100)"))).toBe(0)
	})

	it("keeps the tolerance too small to hide a real excursion", () => {
		expect(GAMUT_EPSILON).toBeLessThan(0.001)
	})
})

describe("un-checkable values", () => {
	it("returns null for the notations the gate cannot measure", () => {
		// This is the hook the theme suite turns into a hard failure. A theme that
		// authored a gated token as `color-mix()` used to leave the contrast gate
		// rather than fail it.
		expect(parseColor("color-mix(in oklab, var(--a), var(--b) 40%)")).toBeNull()
		expect(parseColor("var(--zinc-200)")).toBeNull()
		expect(parseColor("transparent")).toBeNull()
		expect(parseColorWithAlpha("oklch(from var(--x) calc(l + 0.1) c h)")).toBeNull()
	})
})

describe("labels on fills", () => {
	const white = { l: 0.985, c: 0.01, h: 32.9 }
	const dark = { l: 0.2, c: 0.03, h: 32.9 }
	const inks = [white, dark]

	it("keeps Ember's white label in dark mode and brings the fill down to it", () => {
		// Ember's orange-red: the dark-mode lift (65.2%) is where WCAG prefers
		// dark ink and APCA calls it muddy — the defect a lightness cut shipped.
		const lifted = { l: 0.652, c: 0.235, h: 32.9 }
		expect(labelContrast(dark, lifted).reads).toBe(false)
		expect(labelContrast(white, lifted).reads).toBe(false)
		expect(inkPolarity({ l: 0.58, c: 0.245, h: 32.9 }, inks)).toBe(white)
		const fitted = fitFillToInk(lifted, white)
		expect(fitted.h).toBe(32.9)
		expect(fitted.l).toBeGreaterThan(0.56)
		expect(fitted.l).toBeLessThan(0.6)
		expect(labelContrast(white, fitted).reads).toBe(true)
	})

	it("leaves a fill alone when its ink already reads, and carries extra fields", () => {
		const fill = { l: 0.45, c: 0.15, h: 260, a: 0.5 }
		expect(fitFillToInk(fill, white)).toBe(fill)
		expect(fitFillToInk({ ...fill, l: 0.7 }, white)).toMatchObject({ a: 0.5, h: 260 })
	})

	it("gives yellows dark ink and keeps it", () => {
		const yellow = { l: 0.84, c: 0.16, h: 95 }
		expect(inkPolarity(yellow, inks)).toBe(dark)
		expect(inkFor(yellow, inks)).toBe(dark)
	})

	it("never trades the ratio for APCA on a fill that cannot move", () => {
		// Neither reads; white has the stronger Lc but fails the ratio.
		const fill = { l: 0.652, c: 0.235, h: 32.9 }
		expect(Math.abs(labelContrast(white, fill).lc)).toBeGreaterThan(Math.abs(labelContrast(dark, fill).lc))
		expect(inkFor(fill, inks)).toBe(dark)
	})

	it("finds a reading pair for every hue at every lift the customizer makes", () => {
		const failures: string[] = []
		for (let h = 0; h < 360; h += 5) {
			const at = { white: { ...white, h }, dark: { ...dark, h } }
			for (const l of [0.3, 0.45, 0.56, 0.65, 0.72, 0.8, 0.88]) {
				const color = { l, c: Math.min(0.2, maxChromaAt(l, h) * 0.98), h }
				const ink = inkPolarity(color, [at.white, at.dark])
				for (const lift of [l, Math.min(0.88, Math.max(l, 0.7))]) {
					const fill = fitFillToInk({ ...color, l: lift, c: Math.min(color.c, maxChromaAt(lift, h) * 0.98) }, ink)
					if (!labelContrast(ink, fill).reads) failures.push(`h${h} l${l} lift${lift}`)
					if (!isInSrgbGamut(oklchToLinearRgb(fill.l, fill.c, fill.h))) failures.push(`h${h} l${l} out of gamut`)
				}
			}
		}
		expect(failures).toEqual([])
	})
})

describe("status fills", () => {
	it("brings a dark-mode status fill down to the white label its colour takes", () => {
		// Ember's old dark destructive: 5.06:1 but Lc 38. Its text lives in
		// `--destructive-text` now, so the fill is free to sit under white.
		const { findings } = checkLabelledFills({
			light: { destructive: "oklch(50% 0.17 25)", "destructive-foreground": "oklch(100% 0 0)" },
			dark: { destructive: "oklch(62% 0.16 25)", "destructive-foreground": "oklch(14.1% 0.018 70.5)" },
		})
		expect(findings).toHaveLength(1)
		const fill = Number(findings[0].suggestion.fill.match(/oklch\(([\d.]+)%/)?.[1])
		expect(fill).toBeLessThan(62)
		expect(findings[0].suggestion.ink).toMatch(/^oklch\(98\.5%/)
	})

	it("still brings a brand fill down to the white label it takes", () => {
		const { findings } = checkLabelledFills({
			light: { primary: "oklch(55% 0.2 30)", "primary-foreground": "oklch(98.5% 0.01 30)" },
			dark: { background: "oklch(14% 0.01 70)", primary: "oklch(70% 0.18 30)", "primary-foreground": "oklch(20% 0.03 30)" },
		})
		expect(findings.map((f) => `${f.mode}.${f.fill}`)).toEqual(["dark.primary"])
		const dark = findings[0]
		expect(dark.suggestion.ink).toMatch(/^oklch\(98\.5%/)
	})
})

