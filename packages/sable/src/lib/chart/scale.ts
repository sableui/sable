/**
 * Scales for Sable's charts — the few d3-style mappings a dashboard chart
 * needs, written out so the package takes no charting dependency.
 */

/** Round a float that should be a clean decimal (0.30000000000000004 → 0.3). */
const clean = (n: number) => Number.parseFloat(n.toPrecision(12))

/**
 * "Nice" ticks covering [min, max]: steps of 1, 2 or 5 × 10ⁿ, about `count` of
 * them, with the domain widened to the outer ticks so the axis never ends
 * mid-step.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1]
	if (min === max) {
		if (min === 0) return [0, 1]
		const pad = Math.abs(min) * 0.5
		return niceTicks(min > 0 ? 0 : min - pad, max > 0 ? max + pad : 0, count)
	}
	const raw = (max - min) / Math.max(1, count)
	const power = 10 ** Math.floor(Math.log10(raw))
	const error = raw / power
	const step = (error >= 7.07 ? 10 : error >= 3.16 ? 5 : error >= 1.41 ? 2 : 1) * power
	const start = Math.floor(min / step) * step
	const end = Math.ceil(max / step) * step
	const ticks: number[] = []
	for (let v = start; v <= end + step / 2; v += step) ticks.push(clean(v))
	return ticks
}

/** A linear map from a domain onto a pixel range. */
export function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
	const span = d1 - d0 || 1
	return (v: number) => r0 + ((v - d0) / span) * (r1 - r0)
}

/** Evenly spaced bands for `n` categories, with gaps between them. */
export function bandScale(n: number, [r0, r1]: [number, number], paddingInner = 0.2, paddingOuter = 0.1) {
	const step = (r1 - r0) / Math.max(1, n - paddingInner + paddingOuter * 2)
	const bandwidth = step * (1 - paddingInner)
	const start = r0 + step * paddingOuter
	return { step, bandwidth, at: (i: number) => start + i * step }
}

/** Points for `n` categories spread edge to edge — line and area x positions. */
export function pointScale(n: number, [r0, r1]: [number, number]) {
	const step = n > 1 ? (r1 - r0) / (n - 1) : 0
	return { step, at: (i: number) => (n > 1 ? r0 + i * step : (r0 + r1) / 2) }
}

/**
 * Stack series values per category: each series gets its [base, top] at every
 * index. `expand` normalises each category to 0–1 (a 100% stacked chart).
 * Positive and negative values stack away from zero separately.
 */
export function stack(values: number[][], expand = false): [number, number][][] {
	const n = values[0]?.length ?? 0
	const out = values.map(() => new Array<[number, number]>(n))
	for (let i = 0; i < n; i++) {
		const total = values.reduce((sum, s) => sum + Math.abs(s[i] ?? 0), 0) || 1
		let up = 0
		let down = 0
		for (let s = 0; s < values.length; s++) {
			const v = (values[s][i] ?? 0) / (expand ? total : 1)
			if (v >= 0) {
				out[s][i] = [up, up + v]
				up += v
			} else {
				out[s][i] = [down, down + v]
				down += v
			}
		}
	}
	return out
}

/** Min and max across every value, always including 0 so bars and areas have a baseline. */
export function extent(values: number[][], includeZero = true): [number, number] {
	let min = includeZero ? 0 : Number.POSITIVE_INFINITY
	let max = includeZero ? 0 : Number.NEGATIVE_INFINITY
	for (const s of values) for (const v of s) {
		if (!Number.isFinite(v)) continue
		if (v < min) min = v
		if (v > max) max = v
	}
	if (!Number.isFinite(min)) return [0, 1]
	return [min, max]
}
