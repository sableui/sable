/**
 * Colour maths for ColorField — pure, so it can be tested without rendering.
 *
 * The value format IS the contract, and consumers persist it (Glitch writes
 * `canvas.background` into preset JSON and parses it in the renderer). So:
 *
 *   "transparent" | "#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa"
 *
 * ColorField only ever *emits* `"transparent"`, `"#rrggbb"`, or `"#rrggbbaa"` —
 * the 3- and 4-digit forms are accepted on input (people paste them) but never
 * produced, so a consumer's parser has three shapes to handle, not five. Alpha
 * is omitted when fully opaque rather than written as `ff`, because a parser
 * that predates alpha support must keep reading opaque colours correctly.
 */

/** The one non-colour value. */
export const TRANSPARENT = "transparent"

/** 0–255 each. */
export interface Rgb {
	r: number
	g: number
	b: number
}

/** `h` 0–360, `s` and `v` 0–1. */
export interface Hsv {
	h: number
	s: number
	v: number
}

export function isTransparent(value: string): boolean {
	return value.trim().toLowerCase() === TRANSPARENT
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Clamp to 0–255 and round — the only place channel coercion happens. */
const byte = (n: number) => clamp(Math.round(n), 0, 255)

/**
 * Parse any accepted hex form. Returns `null` for anything unparseable —
 * including `"transparent"`, which callers must test for separately, because
 * "no colour" and "not a colour" are different answers.
 */
export function parseHex(input: string): { rgb: Rgb; a: number } | null {
	const hex = input.trim().replace(/^#/, "").toLowerCase()
	if (!/^[0-9a-f]+$/.test(hex)) return null

	const expand = (c: string) => Number.parseInt(c + c, 16)
	if (hex.length === 3 || hex.length === 4) {
		return {
			rgb: { r: expand(hex[0]!), g: expand(hex[1]!), b: expand(hex[2]!) },
			a: hex.length === 4 ? expand(hex[3]!) / 255 : 1,
		}
	}
	if (hex.length === 6 || hex.length === 8) {
		const pair = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16)
		return {
			rgb: { r: pair(0), g: pair(2), b: pair(4) },
			a: hex.length === 8 ? pair(6) / 255 : 1,
		}
	}
	return null
}

/** `a` is omitted when fully opaque — see the format note above. */
export function formatHex(rgb: Rgb, a = 1): string {
	const hex = (n: number) => byte(n).toString(16).padStart(2, "0")
	const base = `#${hex(rgb.r)}${hex(rgb.g)}${hex(rgb.b)}`
	const alpha = clamp(a, 0, 1)
	return alpha >= 1 ? base : `${base}${hex(alpha * 255)}`
}

export function rgbToHsv({ r, g, b }: Rgb): Hsv {
	const rn = r / 255
	const gn = g / 255
	const bn = b / 255
	const max = Math.max(rn, gn, bn)
	const min = Math.min(rn, gn, bn)
	const d = max - min

	let h = 0
	if (d !== 0) {
		if (max === rn) h = ((gn - bn) / d) % 6
		else if (max === gn) h = (bn - rn) / d + 2
		else h = (rn - gn) / d + 4
		h *= 60
		if (h < 0) h += 360
	}
	// Grey has no hue. Returning 0 is a lie the caller has to know about, which
	// is exactly why ColorField keeps hue in its own state rather than
	// re-deriving it from the value on every render: dragging saturation to 0
	// would otherwise snap the hue slider to red and you could not get back.
	return { h, s: max === 0 ? 0 : d / max, v: max }
}

export function hsvToRgb({ h, s, v }: Hsv): Rgb {
	const hn = ((h % 360) + 360) % 360
	const c = v * clamp(s, 0, 1)
	const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
	const m = v - c

	const [r, g, b] =
		hn < 60
			? [c, x, 0]
			: hn < 120
				? [x, c, 0]
				: hn < 180
					? [0, c, x]
					: hn < 240
						? [0, x, c]
						: hn < 300
							? [x, 0, c]
							: [c, 0, x]

	return { r: byte((r + m) * 255), g: byte((g + m) * 255), b: byte((b + m) * 255) }
}

/** The fully-saturated colour for a hue — the SV area's and hue slider's base. */
export function hueColor(h: number): string {
	return formatHex(hsvToRgb({ h, s: 1, v: 1 }))
}
