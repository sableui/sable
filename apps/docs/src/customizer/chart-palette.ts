import { GAMUT_SAFETY, type Oklch, hueDelta, linearRgbToOklab, maxChroma, oklchToLinearRgb } from "./color"

/**
 * The chart series palette, generated from the brand — and held to the same
 * checks the shipped palette passes, so no look can produce series a reader
 * cannot tell apart.
 *
 * The default (Base's --chart-1 … --chart-8) is a validated categorical set.
 * A generated set starts from the brand: slot 1 IS the brand, and the rest
 * follow the Palette control — leaning toward it (Brand only, Harmonize) or
 * spaced from it on the wheel (Analogous, Triadic). Every slot keeps its
 * default's lightness rhythm (alternating depths are what separate neighbours
 * under colour-blindness), is lifted into the chart lightness band with a
 * chroma floor, and is then checked against the slot before it: OKLab ΔE×100
 * ≥ 15 for normal vision, ≥ 8 under protanopia and deuteranopia (Machado
 * 2009, severity 1). A slot that fails is nudged in lightness until it passes,
 * or falls back to its validated default.
 */

type Mode = "light" | "dark"
type Scheme = "preset" | "harmonize" | "analogous" | "triadic"

/** Base's validated palette, as OKLCH [L, C, H] — keep in step with base.css. */
const DEFAULTS: Record<Mode, [number, number, number][]> = {
	light: [
		[0.5753, 0.1626, 255.53],
		[0.6708, 0.175, 40.64],
		[0.669, 0.1408, 162.11],
		[0.7644, 0.1612, 75.12],
		[0.7163, 0.1412, 357.39],
		[0.5285, 0.1798, 142.5],
		[0.5271, 0.1968, 283.44],
		[0.6226, 0.1909, 24.91],
	],
	dark: [
		[0.6221, 0.1612, 255.05],
		[0.6221, 0.1726, 40.11],
		[0.6212, 0.1283, 163.11],
		[0.6699, 0.1425, 73.23],
		[0.6224, 0.1712, 0.84],
		[0.5285, 0.1798, 142.5],
		[0.6696, 0.1452, 286.83],
		[0.6693, 0.1586, 22.31],
	],
}

/** Where a series colour reads as colour on the chart surface, per mode. */
const BAND: Record<Mode, [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] }
const CHROMA_FLOOR = 0.1
const NORMAL_FLOOR = 15
const CVD_TARGET = 8

/** Hue offsets from the brand for slots 2–8, per wheel scheme. */
const OFFSETS: Record<"analogous" | "triadic", number[]> = {
	analogous: [35, -35, 70, -70, 105, -105, 180],
	triadic: [120, -120, 60, 180, -60, 150, -150],
}

/** Machado, Oliveira & Fernandes 2009 at severity 1.0, applied in linear sRGB. */
const PROTAN = [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
const DEUTAN = [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881]

const norm = (h: number) => ((h % 360) + 360) % 360
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

function lab(color: Oklch, m?: number[]): [number, number, number] {
	let [r, g, b] = oklchToLinearRgb(color.l, color.c, color.h).map((v) => clamp(v, 0, 1))
	if (m) [r, g, b] = [m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b].map((v) => clamp(v, 0, 1))
	return linearRgbToOklab(r, g, b)
}

function distance(a: Oklch, b: Oklch, m?: number[]): number {
	const [l1, a1, b1] = lab(a, m)
	const [l2, a2, b2] = lab(b, m)
	return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100
}

/** The worst of the three readings for a neighbouring pair, scaled so ≥ 1 passes. */
function separation(a: Oklch, b: Oklch): number {
	return Math.min(distance(a, b) / NORMAL_FLOOR, distance(a, b, PROTAN) / CVD_TARGET, distance(a, b, DEUTAN) / CVD_TARGET)
}

/**
 * A slot at this hue and lightness: in band, chroma floored, inside sRGB.
 * Where sRGB cannot hold the chroma floor at that lightness (deep blues,
 * cyan-greens), the lightness moves — within the band — to the nearest step
 * that can, rather than the colour going grey.
 */
function slot(h: number, l: number, c: number, mode: Mode): Oklch {
	const [lo, hi] = BAND[mode]
	const H = norm(h)
	let L = clamp(l, lo, hi)
	if (maxChroma(L, H) * GAMUT_SAFETY < CHROMA_FLOOR) {
		for (let step = 0.01; step <= hi - lo; step += 0.01) {
			const up = L + step
			const down = L - step
			if (up <= hi && maxChroma(up, H) * GAMUT_SAFETY >= CHROMA_FLOOR) {
				L = up
				break
			}
			if (down >= lo && maxChroma(down, H) * GAMUT_SAFETY >= CHROMA_FLOOR) {
				L = down
				break
			}
		}
	}
	const room = maxChroma(L, H) * GAMUT_SAFETY
	return { l: L, c: Math.min(Math.max(c, CHROMA_FLOOR), room), h: H, a: 1 }
}

/** Rotate toward the brand by part of the gap, capped — Material's harmonize. */
function lean(hue: number, brandHue: number, amount: number, cap: number): number {
	const delta = hueDelta(hue, brandHue)
	return norm(hue + Math.sign(delta) * Math.min(Math.abs(delta) * amount, cap))
}

export function chartPalette(brand: Oklch, scheme: Scheme, mode: Mode, clearOfStatus: (hue: number) => number): Oklch[] {
	const defaults = DEFAULTS[mode].map(([l, c, h]) => ({ l, c, h, a: 1 }) as Oklch)
	const out: Oklch[] = [slot(brand.h, brand.l, Math.max(brand.c, 0.12), mode)]
	for (let i = 1; i < defaults.length; i++) {
		const d = defaults[i]
		// Brand only and Harmonize keep the validated hues, leaned toward the
		// brand; the wheel schemes place them from it, clear of status colours.
		const hue = scheme === "analogous" || scheme === "triadic" ? clearOfStatus(brand.h + OFFSETS[scheme][i - 1]) : lean(d.h, brand.h, scheme === "preset" ? 0.25 : 0.4, scheme === "preset" ? 15 : 25)
		const prev = out[i - 1]
		const first = slot(hue, d.l, d.c, mode)
		let best = first
		let bestScore = separation(prev, first)
		// Nudge until the pair separates: lightness first (it keeps the hue the
		// scheme asked for), then a little hue, since dark mode's narrow band
		// cannot always open enough lightness between two neighbours.
		for (const dh of [0, 10, -10, 20, -20, 30, -30]) {
			for (let step = 0; bestScore < 1 && step <= 6; step++) {
				for (const dir of step ? [1, -1] : [1]) {
					const candidate = slot(hue + dh, d.l + dir * step * 0.03, d.c, mode)
					const score = separation(prev, candidate)
					if (score > bestScore) {
						best = candidate
						bestScore = score
					}
				}
			}
			if (bestScore >= 1) break
		}
		// Still too close: the validated default for this slot, if it separates.
		if (bestScore < 1 && separation(prev, d) > bestScore) best = d
		out.push(best)
	}
	return out
}
