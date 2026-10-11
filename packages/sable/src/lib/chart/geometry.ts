/**
 * Path geometry for Sable's charts. Every generator emits the same command
 * structure for the same number of points, so a path whose data changes can
 * ease between shapes with a CSS `d` transition instead of snapping.
 */

export type Point = [number, number]

/**
 * How a line runs between its points. `smooth` is monotone — it never
 * overshoots a value the data does not contain, so a peak is drawn where it
 * is; `step` holds each value to the midpoint between categories.
 */
export type ChartCurve = "smooth" | "linear" | "step"

const f = (n: number) => Math.round(n * 100) / 100

/** Fritsch–Carlson monotone tangents (as d3's curveMonotoneX). */
function monotoneTangents(pts: Point[]): number[] {
	const n = pts.length
	const d: number[] = []
	for (let i = 0; i < n - 1; i++) {
		const dx = pts[i + 1][0] - pts[i][0]
		d.push(dx === 0 ? 0 : (pts[i + 1][1] - pts[i][1]) / dx)
	}
	const m = new Array<number>(n)
	m[0] = d[0] ?? 0
	m[n - 1] = d[n - 2] ?? 0
	for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
	for (let i = 0; i < n - 1; i++) {
		if (d[i] === 0) {
			m[i] = 0
			m[i + 1] = 0
			continue
		}
		const a = m[i] / d[i]
		const b = m[i + 1] / d[i]
		const h = a * a + b * b
		if (h > 9) {
			const t = 3 / Math.sqrt(h)
			m[i] = t * a * d[i]
			m[i + 1] = t * b * d[i]
		}
	}
	return m
}

/** The segments after the first point (no leading M), so a line and an area share them. */
function segments(pts: Point[], curve: ChartCurve): string {
	if (pts.length < 2) return ""
	if (curve === "linear") return pts.slice(1).map(([x, y]) => `L${f(x)},${f(y)}`).join("")
	if (curve === "step") {
		let out = ""
		for (let i = 1; i < pts.length; i++) {
			const mid = (pts[i - 1][0] + pts[i][0]) / 2
			out += `L${f(mid)},${f(pts[i - 1][1])}L${f(mid)},${f(pts[i][1])}L${f(pts[i][0])},${f(pts[i][1])}`
		}
		return out
	}
	const m = monotoneTangents(pts)
	let out = ""
	for (let i = 0; i < pts.length - 1; i++) {
		const [x0, y0] = pts[i]
		const [x1, y1] = pts[i + 1]
		const dx = (x1 - x0) / 3
		out += `C${f(x0 + dx)},${f(y0 + dx * m[i])},${f(x1 - dx)},${f(y1 - dx * m[i + 1])},${f(x1)},${f(y1)}`
	}
	return out
}

export function linePath(pts: Point[], curve: ChartCurve = "smooth"): string {
	if (!pts.length) return ""
	return `M${f(pts[0][0])},${f(pts[0][1])}${segments(pts, curve)}`
}

/** A filled band between a top line and a bottom line (a baseline, or the series below). */
export function areaPath(top: Point[], bottom: Point[], curve: ChartCurve = "smooth"): string {
	if (!top.length) return ""
	const back = [...bottom].reverse()
	return `${linePath(top, curve)}L${f(back[0][0])},${f(back[0][1])}${segments(back, curve)}Z`
}

/**
 * A rectangle with each corner rounded on its own — a bar rounds only its far
 * end, and a stack rounds only its outer segments. Radii clamp to the bar.
 */
export function rectPath(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: [number, number, number, number]): string {
	const max = Math.max(0, Math.min(w / 2, h / 2))
	const r = (v: number) => Math.min(Math.max(0, v), max)
	const [a, b, c, d] = [r(tl), r(tr), r(br), r(bl)]
	return (
		`M${f(x + a)},${f(y)}H${f(x + w - b)}A${f(b)},${f(b)} 0 0 1 ${f(x + w)},${f(y + b)}` +
		`V${f(y + h - c)}A${f(c)},${f(c)} 0 0 1 ${f(x + w - c)},${f(y + h)}` +
		`H${f(x + d)}A${f(d)},${f(d)} 0 0 1 ${f(x)},${f(y + h - d)}` +
		`V${f(y + a)}A${f(a)},${f(a)} 0 0 1 ${f(x + a)},${f(y)}Z`
	)
}

/** A point on a circle; angle 0 is 12 o'clock and runs clockwise, in radians. */
export function polar(cx: number, cy: number, r: number, angle: number): Point {
	return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)]
}

/** A filled ring segment (a pie or donut slice). Inner radius 0 makes a wedge. */
export function arcPath(cx: number, cy: number, inner: number, outer: number, a0: number, a1: number): string {
	const sweep = a1 - a0
	// A full circle as one arc has coincident end points and draws nothing.
	if (Math.abs(sweep) >= Math.PI * 2 - 1e-6) {
		const mid = a0 + sweep / 2
		return `${arcPath(cx, cy, inner, outer, a0, mid)}${arcPath(cx, cy, inner, outer, mid, a1)}`
	}
	const large = Math.abs(sweep) > Math.PI ? 1 : 0
	const dir = sweep >= 0 ? 1 : 0
	const [ox0, oy0] = polar(cx, cy, outer, a0)
	const [ox1, oy1] = polar(cx, cy, outer, a1)
	let d = `M${f(ox0)},${f(oy0)}A${f(outer)},${f(outer)} 0 ${large} ${dir} ${f(ox1)},${f(oy1)}`
	if (inner > 0) {
		const [ix1, iy1] = polar(cx, cy, inner, a1)
		const [ix0, iy0] = polar(cx, cy, inner, a0)
		d += `L${f(ix1)},${f(iy1)}A${f(inner)},${f(inner)} 0 ${large} ${1 - dir} ${f(ix0)},${f(iy0)}`
	} else {
		d += `L${f(cx)},${f(cy)}`
	}
	return `${d}Z`
}

/** An open arc along one radius — stroked, it is a radial bar with round ends. */
export function strokeArcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
	const sweep = a1 - a0
	if (Math.abs(sweep) < 1e-6) {
		const [x, y] = polar(cx, cy, r, a0)
		return `M${f(x)},${f(y)}`
	}
	if (Math.abs(sweep) >= Math.PI * 2 - 1e-6) {
		const mid = a0 + sweep / 2
		const [x0, y0] = polar(cx, cy, r, a0)
		const [xm, ym] = polar(cx, cy, r, mid)
		const [x1, y1] = polar(cx, cy, r, a1 - (sweep > 0 ? 1e-4 : -1e-4))
		return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 0 1 ${f(xm)},${f(ym)}A${f(r)},${f(r)} 0 0 1 ${f(x1)},${f(y1)}`
	}
	const [x0, y0] = polar(cx, cy, r, a0)
	const [x1, y1] = polar(cx, cy, r, a1)
	return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 ${Math.abs(sweep) > Math.PI ? 1 : 0} ${sweep >= 0 ? 1 : 0} ${f(x1)},${f(y1)}`
}
