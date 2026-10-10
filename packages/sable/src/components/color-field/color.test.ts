import { describe, expect, it } from "vitest"
import { formatHex, hsvToRgb, hueColor, isTransparent, parseHex, rgbToHsv } from "./color"

describe("parseHex", () => {
	it("accepts every form people actually paste", () => {
		expect(parseHex("#fff")).toEqual({ rgb: { r: 255, g: 255, b: 255 }, a: 1 })
		expect(parseHex("FFF")).toEqual({ rgb: { r: 255, g: 255, b: 255 }, a: 1 })
		expect(parseHex("#3b82f6")).toEqual({ rgb: { r: 59, g: 130, b: 246 }, a: 1 })
		expect(parseHex("  #3B82F6  ")).toEqual({ rgb: { r: 59, g: 130, b: 246 }, a: 1 })
	})

	it("reads alpha from the 4- and 8-digit forms", () => {
		expect(parseHex("#0000")).toEqual({ rgb: { r: 0, g: 0, b: 0 }, a: 0 })
		expect(parseHex("#00000080")?.a).toBeCloseTo(128 / 255, 5)
		expect(parseHex("#000000ff")?.a).toBe(1)
	})

	it("returns null for anything unparseable, including transparent", () => {
		// "no colour" and "not a colour" are different answers; the caller tests
		// isTransparent separately rather than treating null as transparent.
		expect(parseHex("transparent")).toBeNull()
		expect(parseHex("")).toBeNull()
		expect(parseHex("#12345")).toBeNull()
		expect(parseHex("#gggggg")).toBeNull()
		expect(parseHex("rgb(0,0,0)")).toBeNull()
	})
})

describe("formatHex", () => {
	it("omits alpha when fully opaque", () => {
		// A parser that predates alpha support must keep reading opaque colours.
		expect(formatHex({ r: 59, g: 130, b: 246 })).toBe("#3b82f6")
		expect(formatHex({ r: 59, g: 130, b: 246 }, 1)).toBe("#3b82f6")
	})

	it("writes 8-digit hex only when translucent", () => {
		expect(formatHex({ r: 0, g: 0, b: 0 }, 0)).toBe("#00000000")
		expect(formatHex({ r: 0, g: 0, b: 0 }, 0.5)).toBe("#00000080")
	})

	it("pads and clamps rather than emitting a malformed value", () => {
		expect(formatHex({ r: 1, g: 2, b: 3 })).toBe("#010203")
		expect(formatHex({ r: -50, g: 999, b: 128.6 })).toBe("#00ff81")
	})
})

describe("rgbToHsv / hsvToRgb", () => {
	it("round-trips the primaries exactly", () => {
		for (const rgb of [
			{ r: 255, g: 0, b: 0 },
			{ r: 0, g: 255, b: 0 },
			{ r: 0, g: 0, b: 255 },
			{ r: 255, g: 255, b: 0 },
			{ r: 0, g: 255, b: 255 },
			{ r: 255, g: 0, b: 255 },
			{ r: 255, g: 255, b: 255 },
			{ r: 0, g: 0, b: 0 },
		]) {
			expect(hsvToRgb(rgbToHsv(rgb))).toEqual(rgb)
		}
	})

	it("round-trips arbitrary colours within one 8-bit step", () => {
		// The picker converts on every pointer move, so drift here would make a
		// colour crawl while the user drags a different axis.
		for (const rgb of [
			{ r: 59, g: 130, b: 246 },
			{ r: 17, g: 24, b: 39 },
			{ r: 250, g: 204, b: 21 },
			{ r: 3, g: 7, b: 18 },
			{ r: 244, g: 63, b: 94 },
		]) {
			const out = hsvToRgb(rgbToHsv(rgb))
			expect(Math.abs(out.r - rgb.r)).toBeLessThanOrEqual(1)
			expect(Math.abs(out.g - rgb.g)).toBeLessThanOrEqual(1)
			expect(Math.abs(out.b - rgb.b)).toBeLessThanOrEqual(1)
		}
	})

	it("reports grey as unsaturated with a hue of zero", () => {
		// Documented lie: grey has no hue. ColorField therefore keeps hue in its
		// own state instead of re-deriving it, or dragging saturation to 0 would
		// snap the hue slider to red with no way back.
		expect(rgbToHsv({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, v: 128 / 255 })
		expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 })
	})

	it("normalises out-of-range hue instead of producing black", () => {
		expect(hsvToRgb({ h: 360, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 0 })
		expect(hsvToRgb({ h: -60, s: 1, v: 1 })).toEqual({ r: 255, g: 0, b: 255 })
		expect(hsvToRgb({ h: 420, s: 1, v: 1 })).toEqual({ r: 255, g: 255, b: 0 })
	})
})

describe("isTransparent", () => {
	it("matches case-insensitively and ignores surrounding space", () => {
		expect(isTransparent("transparent")).toBe(true)
		expect(isTransparent("  TRANSPARENT ")).toBe(true)
		expect(isTransparent("#00000000")).toBe(false)
		expect(isTransparent("")).toBe(false)
	})
})

describe("hueColor", () => {
	it("gives the fully saturated colour for each 60° step", () => {
		expect(hueColor(0)).toBe("#ff0000")
		expect(hueColor(120)).toBe("#00ff00")
		expect(hueColor(240)).toBe("#0000ff")
	})
})
