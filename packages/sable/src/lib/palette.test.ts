import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
// @ts-expect-error Plain JS rule table shipped with the CLI.
import { PALETTE_SCALES as LINTED_SCALES } from "../../scripts/lint-rules.mjs"
import {
	type LinearRgb,
	type OklchColor,
	contrastRatio,
	gamutExcursion,
	linearRgbToOklch,
	oklchToLinearRgb,
	parseColorWithAlpha,
} from "../themes/contrast"
import { PALETTE_SLOT_TOKENS } from "../themes/_contract"
import { themeIds } from "../themes/index"
import { LEAN, NEUTRAL_MIX, PALETTE_COLORS, PALETTE_FAMILIES, PALETTE_SCALES, PALETTE_SLOTS, PALETTE_STEPS, PALETTE_TONES, type PaletteMode, TONE_LADDER, familyHue, toneStep } from "./palette"

const PKG = resolve(__dirname, "..", "..")
const css = readFileSync(resolve(PKG, "src", "palette.css"), "utf8")

/** The declarations of the one generated block whose selector matches. */
function block(selector: string): Map<string, string> {
	const start = css.indexOf(`${selector} {`)
	const body = css.slice(start, css.indexOf("\n}", start))
	return new Map(Array.from(body.matchAll(/(--[\w-]+):\s*([^;]+);/g), (m) => [m[1], m[2].trim()]))
}
const MODE_BLOCKS: Record<PaletteMode, Map<string, string>> = {
	light: block(":where(:root, [data-sable-theme], .light)"),
	dark: block(":where(.dark, .dark [data-sable-theme]:not(.light))"),
}

/**
 * Evaluate a channel expression from the generated CSS — calc, min, max,
 * clamp, mod and the channel keywords — as the browser would. The test reads
 * the CSS itself, so what it checks is what ships.
 */
function evaluate(expression: string, channels: Partial<OklchColor>): number {
	const js = expression
		.replace(/\bcalc\(/g, "(")
		.replace(/\b([lch])\b/g, (_, name: keyof OklchColor) => `(${channels[name]})`)
	const fn = new Function("min", "max", "clamp", "mod", `return ${js}`) as (...args: unknown[]) => number
	return fn(Math.min, Math.max, (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v)), (a: number, b: number) => ((a % b) + b) % b)
}

/**
 * Substitute var() references from a declaration block, as the browser does:
 * the tone steps name per-mode custom properties written in the tone's own
 * channel keywords, which resolve once they land inside its oklch(from …).
 */
function expand(expression: string, decls: Map<string, string>): string {
	return expression.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
		const value = decls.get(name)
		if (value === undefined) throw new Error(`unknown ${name}`)
		return `(${expand(value, decls)})`
	})
}

/** `oklch(from var(--x) L C h)` → the L and C expressions. */
function channelsOf(value: string): { l: string; c: string } {
	const inner = value.replace(/^oklch\(from var\(--[\w-]+\)\s+/, "").replace(/\s+h\)$/, "")
	// L is the first top-level token; C is the rest.
	let depth = 0
	for (let i = 0; i < inner.length; i++) {
		if (inner[i] === "(") depth++
		else if (inner[i] === ")") depth--
		else if (inner[i] === " " && depth === 0) return { l: inner.slice(0, i), c: inner.slice(i + 1) }
	}
	throw new Error(`unparsable: ${value}`)
}

/** A theme's tokens per mode, following var() chains. Light skips .dark blocks; dark applies all in order. */
function themeTokens(themeId: string, mode: PaletteMode) {
	const source = readFileSync(resolve(PKG, "src", "themes", themeId, `${themeId}.css`), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
	const vars = new Map<string, string>()
	for (const rule of source.match(/[^{}]+\{[^{}]*\}/g) ?? []) {
		if (mode === "light" && /\.dark/.test(rule.slice(0, rule.indexOf("{")))) continue
		for (const d of rule.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars.set(d[1], d[2].trim())
	}
	const color = (name: string, depth = 0): LinearRgb | null => {
		const raw = vars.get(name)
		if (!raw || depth > 10) return null
		const ref = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/)
		if (ref) return color(ref[1], depth + 1)
		return parseColorWithAlpha(raw)?.rgb ?? null
	}
	const oklch = (name: string) => {
		const rgb = color(name)
		if (!rgb) throw new Error(`${themeId} ${mode}: cannot resolve ${name}`)
		return linearRgbToOklch(rgb)
	}
	return { color, oklch, has: (name: string) => vars.has(name) }
}

const toRgb = ({ l, c, h }: OklchColor) => oklchToLinearRgb(l, c, h)

function oklabMix(a: LinearRgb, b: LinearRgb, t: number): LinearRgb {
	const [x, y] = [linearRgbToOklch(a), linearRgbToOklch(b)]
	const lab = (o: OklchColor) => [o.l, o.c * Math.cos((o.h * Math.PI) / 180), o.c * Math.sin((o.h * Math.PI) / 180)]
	const [p, q] = [lab(x), lab(y)]
	const [L, A, B] = p.map((v, i) => v + (q[i] - v) * t)
	return oklchToLinearRgb(L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI)
}

/** Every scale of one theme in one mode, step → colour, as the CSS computes it. */
function scalesFor(themeId: string, mode: PaletteMode, harmony = 1) {
	const theme = themeTokens(themeId, mode)
	const brand = theme.oklch(theme.has("--theme-art-brand") ? "--theme-art-brand" : "--primary")
	const decls = MODE_BLOCKS[mode]
	const scales = new Map<string, Map<number, OklchColor>>()
	for (const family of PALETTE_FAMILIES) {
		const h = familyHue(family.hue, brand, harmony)
		scales.set(
			family.name,
			new Map(
				PALETTE_STEPS.map((step) => {
					const { l, c } = channelsOf(decls.get(`--${family.name}-${step}`) ?? "")
					return [step, { l: evaluate(l, { h }), c: evaluate(c, { h }), h }]
				}),
			),
		)
	}
	for (const tone of PALETTE_TONES) {
		const anchor = theme.oklch(`--${tone}`)
		scales.set(
			tone,
			new Map(
				PALETTE_STEPS.map((step) => {
					const { l, c } = channelsOf(decls.get(`--${tone}-${step}`) ?? "")
					return [step, { l: evaluate(expand(l, decls), anchor), c: evaluate(expand(c, decls), anchor), h: anchor.h }]
				}),
			),
		)
	}
	const page = theme.color("--background")
	const ink = theme.color("--foreground")
	if (!page || !ink) throw new Error(`${themeId} ${mode}: no page or ink`)
	scales.set("neutral", new Map(PALETTE_STEPS.map((step) => [step, linearRgbToOklch(oklabMix(page, ink, NEUTRAL_MIX[step] / 100))])))
	return { scales, page, brand }
}

/**
 * The least OKLab distance (×100) between neighbouring steps. About 2 is the
 * smallest difference anyone notices; 3 reads as a step. The 50→100 washes
 * are meant to be quiet (Tailwind's own are about 1.5 apart), so they get less.
 */
const STEP_GAP = 3
const WASH_GAP = 1.4
const deltaE = (a: OklchColor, b: OklchColor) => {
	const lab = (o: OklchColor) => [o.l * 100, o.c * 100 * Math.cos((o.h * Math.PI) / 180), o.c * 100 * Math.sin((o.h * Math.PI) / 180)]
	const [p, q] = [lab(a), lab(b)]
	return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}

const cases = themeIds.flatMap((id) => (["light", "dark"] as const).map((mode) => [id, mode] as const))

describe("palette", () => {
	it("src/palette.css is generated from src/lib/palette.ts", () => {
		expect(() => execFileSync("node", ["scripts/build-palette.mjs", "--check"], { cwd: PKG, stdio: "pipe" })).not.toThrow()
	})

	it("lets apps use exactly what is generated: the consumer lint names the same scales", () => {
		expect(LINTED_SCALES).toEqual([...PALETTE_SCALES])
	})

	it("leans a family toward the brand by half the gap, at most 15°, and not at all toward an ink-black brand", () => {
		expect(familyHue(262, { c: 0.2, h: 272 })).toBeCloseTo(267)
		expect(familyHue(262, { c: 0.2, h: 32 })).toBeCloseTo(277) // the short way round
		expect(familyHue(25, { c: 0.2, h: 320 })).toBeCloseTo(10)
		expect(familyHue(25, { c: 0.003, h: 320 })).toBeCloseTo(24.25)
		expect(familyHue(25, { c: 0.2, h: 320 }, 0)).toBe(25)
		expect(familyHue(25, { c: 0.2, h: 320 }, 9)).toBeCloseTo(355) // harmony clamps at 2×
	})

	it.each(cases)("%s %s: every family step is inside sRGB at the hue the brand leans it to, at any harmony", (themeId, mode) => {
		const out: string[] = []
		for (const harmony of [0, 0.5, 1, 1.5, 2]) {
			const { scales } = scalesFor(themeId, mode, harmony)
			for (const family of PALETTE_FAMILIES) {
				for (const [step, color] of scales.get(family.name) ?? []) {
					const excursion = gamutExcursion(toRgb(color))
					if (excursion > 1e-3) out.push(`harmony ${harmony} ${family.name}-${step} ${excursion.toFixed(4)}`)
				}
			}
		}
		expect(out).toEqual([])
	})

	it("fits any brand, not only the built-in themes': a full turn of the wheel at the strongest lean", () => {
		const out: string[] = []
		for (const mode of ["light", "dark"] as const) {
			for (let h = 0; h < 360; h += 5) {
				for (const family of PALETTE_FAMILIES) {
					const hue = familyHue(family.hue, { c: 0.2, h }, LEAN.maxHarmony)
					for (const step of PALETTE_STEPS) {
						const { l, c } = channelsOf(MODE_BLOCKS[mode].get(`--${family.name}-${step}`) ?? "")
						const color = { l: evaluate(l, { h: hue }), c: evaluate(c, { h: hue }), h: hue }
						if (gamutExcursion(toRgb(color)) > 1e-3) out.push(`${mode} brand ${h}° ${family.name}-${step}`)
					}
				}
			}
		}
		expect(out.slice(0, 10)).toEqual([])
	})

	it.each(cases)("%s %s: every scale walks steadily away from the page", (themeId, mode) => {
		const { scales } = scalesFor(themeId, mode)
		const out: string[] = []
		for (const [name, steps] of scales) {
			const ls = PALETTE_STEPS.map((step) => steps.get(step)?.l ?? Number.NaN)
			for (let i = 1; i < ls.length; i++) {
				const away = mode === "light" ? ls[i - 1] - ls[i] : ls[i] - ls[i - 1]
				if (!(away > 0.005)) out.push(`${name} ${PALETTE_STEPS[i - 1]}→${PALETTE_STEPS[i]}`)
			}
		}
		expect(out).toEqual([])
	})

	it.each(cases)("%s %s: neighbouring steps are told apart, the 50 and 100 washes less so", (themeId, mode) => {
		const { scales } = scalesFor(themeId, mode)
		const out: string[] = []
		for (const [name, steps] of scales) {
			for (let i = 1; i < PALETTE_STEPS.length; i++) {
				const [from, to] = [PALETTE_STEPS[i - 1], PALETTE_STEPS[i]]
				const gap = deltaE(steps.get(from) as OklchColor, steps.get(to) as OklchColor)
				if (gap < (from === 50 ? WASH_GAP : STEP_GAP)) out.push(`${name} ${from}→${to} ${gap.toFixed(2)}`)
			}
		}
		expect(out).toEqual([])
	})

	it.each(cases)("%s %s: every tone sits exactly on the step nearest its own depth", (themeId, mode) => {
		const theme = themeTokens(themeId, mode)
		const { scales } = scalesFor(themeId, mode)
		const out: string[] = []
		for (const tone of PALETTE_TONES) {
			const own = theme.oklch(`--${tone}`)
			// A tone on the midpoint between two steps may take either.
			const off = (step: (typeof PALETTE_STEPS)[number]) => Math.abs(TONE_LADDER[mode][step] - own.l)
			const least = Math.min(...PALETTE_STEPS.map(off))
			const nearest = PALETTE_STEPS.filter((step) => off(step) < least + 1e-3)
			const gap = Math.min(...nearest.map((step) => deltaE(scales.get(tone)?.get(step) as OklchColor, own)))
			if (gap > 0.05) out.push(`${tone} is ${gap.toFixed(2)} from step ${nearest.join(" or ")}`)
		}
		expect(out).toEqual([])
	})

	it("matches its JS twin: toneStep computes what palette.css does", () => {
		const out: string[] = []
		for (const mode of ["light", "dark"] as const) {
			for (let l = 0.25; l <= 0.95; l += 0.0125) {
				const tone = { l, c: 0.05, h: 140 }
				for (const step of PALETTE_STEPS) {
					const { l: lx, c: cx } = channelsOf(MODE_BLOCKS[mode].get(`--success-${step}`) ?? "")
					const twin = toneStep(tone, step, mode)
					const css = { l: evaluate(expand(lx, MODE_BLOCKS[mode]), tone), c: evaluate(expand(cx, MODE_BLOCKS[mode]), tone) }
					if (Math.abs(css.l - twin.l) > 1e-4 || Math.abs(css.c - twin.c) > 1e-4) out.push(`${mode} L${l.toFixed(3)} ${step}: css ${css.l.toFixed(4)}/${css.c.toFixed(4)} twin ${twin.l.toFixed(4)}/${twin.c.toFixed(4)}`)
				}
			}
		}
		expect(out).toEqual([])
	})

	it.each(cases)("%s %s: step 700 reads as text on the page, and 800 on its own 100 wash", (themeId, mode) => {
		const { scales, page } = scalesFor(themeId, mode)
		const out: string[] = []
		for (const [name, steps] of scales) {
			const text = toRgb(steps.get(700) as OklchColor)
			const strong = toRgb(steps.get(800) as OklchColor)
			const wash = toRgb(steps.get(100) as OklchColor)
			const onPage = contrastRatio(text, page)
			const onWash = contrastRatio(strong, wash)
			if (onPage < 4.5) out.push(`${name}-700 on page ${onPage.toFixed(2)}`)
			if (onWash < 4.5) out.push(`${name}-800 on ${name}-100 ${onWash.toFixed(2)}`)
		}
		expect(out).toEqual([])
	})

	it.each(cases)("%s %s: every slot pair a component paints is readable", (themeId, mode) => {
		const { scales } = scalesFor(themeId, mode)
		const pairs = [["text", "wash"], ["text", "wash-strong"], ["solid-ink", "solid"]] as const
		const out: string[] = []
		for (const name of ["neutral", ...PALETTE_COLORS]) {
			const at = (slot: keyof typeof PALETTE_SLOTS) => toRgb(scales.get(name)?.get(PALETTE_SLOTS[slot]) as OklchColor)
			for (const [ink, fill] of pairs) {
				const ratio = contrastRatio(at(ink), at(fill))
				if (ratio < 4.5) out.push(`${name} ${ink} on ${fill} ${ratio.toFixed(2)}`)
			}
		}
		expect(out).toEqual([])
	})

	it("names the slots once: the contract lists what palette.css fills", () => {
		expect([...PALETTE_SLOT_TOKENS]).toEqual(Object.keys(PALETTE_SLOTS).map((slot) => `palette-${slot}`))
	})

	it("names the families once: the tone values are the generated families", () => {
		expect([...PALETTE_COLORS]).toEqual(PALETTE_FAMILIES.map((family) => family.name))
	})

	it.each(cases)("%s %s: neighbouring families stay apart after the lean", (themeId, mode) => {
		const { scales } = scalesFor(themeId, mode)
		const lab = (o: OklchColor) => [o.l, o.c * Math.cos((o.h * Math.PI) / 180), o.c * Math.sin((o.h * Math.PI) / 180)]
		const out: string[] = []
		PALETTE_FAMILIES.forEach((family, i) => {
			const next = PALETTE_FAMILIES[(i + 1) % PALETTE_FAMILIES.length]
			const [a, b] = [lab(scales.get(family.name)?.get(500) as OklchColor), lab(scales.get(next.name)?.get(500) as OklchColor)]
			const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 100
			if (distance < 8) out.push(`${family.name}/${next.name} ΔE ${distance.toFixed(1)}`)
		})
		expect(out).toEqual([])
	})
})
