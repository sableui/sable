import { PRESET_TOKEN_NAMES } from "@sableui/react/presets"
import { describe, expect, it } from "vitest"
import {
	DEFAULT_LOOK,
	DEFAULT_RHYTHM,
	ENUM_VALUES,
	type Look,
	NUMERIC_RANGES,
	type ThemeBase,
	decodeLook,
	encodeLook,
	lookDecls,
	lookFromParams,
	sanitizeLook,
	toCss,
} from "../src/customizer/look"

/*
 * The look arrives from outside: a share link anyone can edit, and a stored
 * look an older build may have written. `?shadows=bogus` once blanked every
 * docs page. Whatever comes in, the decoders must return a valid look and the
 * CSS must render without throwing.
 */

const BASE: ThemeBase = {
	radius: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "20px" },
	typeSize: { "body-md": "0.9375rem", "heading-1": "2.25rem", "title-lg": "1rem" },
	control: { xs: "28px", sm: "32px", md: "40px", cta: "44px", lg: "48px" },
	colors: null,
	rootPx: 16,
	motionBaseMs: 200,
	shadows: null,
	rhythm: DEFAULT_RHYTHM,
}

const HOSTILE: unknown[] = [
	"bogus", "", " ", "theme; } body { display:none", "__proto__", "constructor", "9999", "NaN",
	9999, -9999, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 1e308, -0, 0.5,
	true, false, null, undefined, {}, [], ["soft"], { light: 1 }, () => 1, Symbol.iterator,
]

function expectValid(look: Look) {
	expect(Object.keys(look).sort()).toEqual(Object.keys(DEFAULT_LOOK).sort())
	for (const [key, [lo, hi]] of Object.entries(NUMERIC_RANGES)) {
		const value = look[key as keyof Look]
		if (value === null) continue
		expect(typeof value).toBe("number")
		expect(Number.isFinite(value)).toBe(true)
		expect(value as number).toBeGreaterThanOrEqual(lo)
		expect(value as number).toBeLessThanOrEqual(key === "hue" ? 360 : hi)
	}
	for (const [key, allowed] of Object.entries(ENUM_VALUES)) expect(allowed).toContain(look[key as keyof Look])
	expect(look.icons).toBe("reicon")
	expect(look.brand === null || /^#[0-9a-f]{3}([0-9a-f]{3})?$/.test(look.brand)).toBe(true)
	for (const key of ["sans", "mono", "display"] as const) expect(look[key]).not.toMatch(/[;{}"'<>]/)
	// The CSS renders, and carries no injected rule.
	const css = toCss(look, BASE, "sable")
	expect(css).not.toContain("display:none")
	expect(css.match(/\{/g)?.length ?? 0).toBe(css.match(/\}/g)?.length ?? 0)
}

describe("sanitizeLook", () => {
	it("passes a valid look through unchanged", () => {
		const look: Look = { ...DEFAULT_LOOK, shadows: "crisp", corners: 80, hue: 195, brand: "#3366ff", sans: "Inter", display: "sans", motion: "snappy" }
		expect(sanitizeLook(look)).toEqual(look)
	})

	it("falls back to the default for every hostile value in every field", () => {
		for (const key of Object.keys(DEFAULT_LOOK)) {
			for (const value of HOSTILE) {
				const look = sanitizeLook({ [key]: value })
				expectValid(look)
				if (key in ENUM_VALUES) expect(look[key as keyof Look]).toBe(DEFAULT_LOOK[key as keyof Look])
			}
		}
	})

	it("clamps numbers to their control's range and wraps the hue", () => {
		const look = sanitizeLook({ corners: 9999, depth: -5, typeBase: 1, typeRatio: 9, motionBase: 1e9, hue: -30, shadowAngle: 720 })
		expect(look).toMatchObject({ corners: 100, depth: 0, typeBase: 11, typeRatio: 1.6, motionBase: 600, hue: 330, shadowAngle: 360 })
	})

	it("accepts only parseable hex brands and catalog fonts", () => {
		expect(sanitizeLook({ brand: "#ABCDEF" }).brand).toBe("#abcdef")
		expect(sanitizeLook({ brand: "abc" }).brand).toBe("#abc")
		expect(sanitizeLook({ brand: "red" }).brand).toBeNull()
		expect(sanitizeLook({ brand: "#12345" }).brand).toBeNull()
		expect(sanitizeLook({ sans: 'Inter", serif; } body { x' }).sans).toBe("theme")
		expect(sanitizeLook({ sans: "Not A Catalog Font" }).sans).toBe("theme")
		expect(sanitizeLook({ display: "sans" }).display).toBe("sans")
		expect(sanitizeLook({ mono: "sans" }).mono).toBe("theme")
	})

	it("ignores non-object input and prototype keys", () => {
		for (const input of [null, undefined, 42, "look", [], [1, 2], () => 1]) expect(sanitizeLook(input)).toEqual(DEFAULT_LOOK)
		const polluted = JSON.parse('{"__proto__": {"shadows": "bogus"}, "constructor": {"prototype": {"x": 1}}}')
		expect(sanitizeLook(polluted)).toEqual(DEFAULT_LOOK)
		expect(({} as Record<string, unknown>).shadows).toBeUndefined()
	})

	it("survives random garbage", () => {
		let seed = 7
		const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
		const pick = () => HOSTILE[Math.floor(rand() * HOSTILE.length)]
		for (let i = 0; i < 300; i++) {
			const input: Record<string, unknown> = {}
			for (const key of Object.keys(DEFAULT_LOOK)) if (rand() < 0.6) input[key] = rand() < 0.3 ? rand() * 2000 - 1000 : pick()
			expectValid(sanitizeLook(input))
		}
	})
})

describe("decoders", () => {
	it("never throw on malformed stored looks", () => {
		const b64 = (value: string) => btoa(value).replace(/=+$/, "")
		for (const raw of ["!!!", "%%%", b64("null"), b64("[1,2]"), b64("42"), b64('"x"'), b64("{"), b64('{"shadows":"bogus","corners":1e999}')]) {
			expectValid(decodeLook(raw))
		}
		expect(decodeLook(b64('{"shadows":"bogus"}')).shadows).toBe("theme")
	})

	it("round-trips a valid look through storage encoding", () => {
		const look: Look = { ...DEFAULT_LOOK, palette: "triadic", neutrals: "mono", fields: "filled", corners: 80, depth: 80, airy: 100, bold: 90 }
		expect(decodeLook(encodeLook(look))).toEqual(look)
	})

	it("reads hostile share links as valid looks", () => {
		const params = new URLSearchParams("shadows=bogus&palette=rainbow&neutrals=__proto__&motion=warp&fields=1&buttons=&primary=null&corners=9999&hue=abc&brand=zzz&sans=%22%3B%7D&typeBase=Infinity")
		const look = lookFromParams(params)
		expectValid(look)
		expect(look).toMatchObject({ shadows: "theme", palette: "preset", corners: 100, hue: null, brand: null, sans: "theme", typeBase: null })
	})
})

describe("export coverage", () => {
	it("writes only preset tokens, so a snapshot carries everything the look sets", () => {
		// Every field moved, the anchors included: what the look writes must be
		// in the preset vocabulary, or the export drops it (the lost leading).
		const looks: Look[] = [
			{ ...DEFAULT_LOOK, bold: 90, airy: 100, corners: 80, depth: 80, shadows: "offset", buttons: "match", fields: "filled", motion: "relaxed", harmony: 150, sans: "Inter", mono: "DM Mono", display: "sans" },
			{ ...DEFAULT_LOOK, typeBase: 17, typeRatio: 1.3, controlBase: 44, spacingBase: 10, radiusBase: 14, motionBase: 300, buttons: "pill", fields: "outline", shadows: "soft", shadowAngle: 45, shadowDistance: 20, shadowBlur: 40, shadowOpacity: 30 },
		]
		const tokens = new Set(PRESET_TOKEN_NAMES)
		for (const look of looks) {
			const { root, dark } = lookDecls(look, BASE)
			const names = [...root, ...dark].map((decl) => decl.slice(2, decl.indexOf(":")))
			expect(names.filter((name) => !tokens.has(name))).toEqual([])
		}
	})

	it("writes Airy and the step anchor through the preset's rhythm hooks", () => {
		const airy = lookDecls({ ...DEFAULT_LOOK, airy: 100 }, { ...BASE, rhythm: { ...DEFAULT_RHYTHM, leadingScale: 1.05 } }).root
		expect(airy).toContain("--theme-leading-scale: 1.155;")
		expect(airy.some((decl) => decl.startsWith("--leading-scale"))).toBe(false)
		// Step 10 at Sable's 15px body and 1.55 leading: a split of 23.25 / 10.
		const step = lookDecls({ ...DEFAULT_LOOK, spacingBase: 10 }, BASE).root
		expect(step).toContain("--theme-baseline-split: 2.325;")
		expect(step.some((decl) => decl.startsWith("--baseline-step"))).toBe(false)
	})

	it("sizes the body anchor as rendered at the page's type base", () => {
		// At --type-base 14 (the docs from 768px), a 14px body is written as 16px.
		const decls = lookDecls({ ...DEFAULT_LOOK, typeBase: 14 }, { ...BASE, rhythm: { ...DEFAULT_RHYTHM, typeBase: 14 } }).root
		expect(decls).toContain("--type-body-md-size: 16px;")
	})
})
