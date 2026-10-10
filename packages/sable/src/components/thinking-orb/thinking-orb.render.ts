/**
 * ThinkingOrb — the rendering core.
 *
 * Everything here is pure math over a 2D canvas: no WebGL, no geometry data, no
 * images, no dependency. Each mode builds a point cloud in unit-sphere space,
 * projects it through one shared camera, and paints it back-to-front as filled
 * arcs. Time is the only input that changes between frames, so a frame is fully
 * determined by `(mode, size, t)` — there is no simulation state to keep, which
 * is what lets the component stop and restart the loop freely (off-screen, tab
 * hidden, motion off) without the orb ever jumping.
 *
 * COLOR IS NOT DECIDED HERE. The caller sets `fillStyle`/`strokeStyle` from the
 * canvas's own computed `color`, so the orb inherits whatever semantic token the
 * consumer set with a `text-*` utility. Depth is expressed as radius + alpha
 * only — never as a lighter or darker ink — because "far away = paler" is the
 * one depth cue that stays correct in both color modes and under every theme.
 */

/** The three visual modes. See `thinking-orb.meta.ts` for when to reach for each. */
export type OrbMode = "orbit" | "globe" | "mesh"

/** The size ladder. Each step is separately tuned — see `ORB_TUNING`. */
export type OrbSize = "sm" | "md" | "lg"

/** Rendered box, in CSS pixels, per size step. */
export const ORB_PX: Record<OrbSize, number> = { sm: 20, md: 32, lg: 64 }

interface OrbTuning {
	/** Point-count multiplier. Counts scale by its square root — see `count()`. */
	density: number
	/** Dot-radius multiplier, on top of the size-relative base scale. */
	dotScale: number
	/** Rotation-speed multiplier, folded into `t` by the caller. */
	speed: number
}

/**
 * Per-(mode, size) tuning.
 *
 * A 20px orb is NOT a scaled-down 64px orb, and treating it as one is what makes
 * small loaders read as grey mush: the dot count that gives a 64px sphere its
 * surface has nowhere to land at 20px, and dots scaled down with the box fall
 * under a device pixel and go soft. So each step gets its own density, dot size
 * and speed — fewer, larger, faster-moving points as the box shrinks, which is
 * the only way the motion stays legible at composer scale.
 */
const ORB_TUNING: Record<OrbMode, Record<OrbSize, OrbTuning>> = {
	orbit: {
		sm: { density: 0.35, dotScale: 3.4, speed: 1.9 },
		md: { density: 0.55, dotScale: 2.3, speed: 1.5 },
		lg: { density: 1, dotScale: 1.6, speed: 1.2 },
	},
	globe: {
		sm: { density: 0.16, dotScale: 3.2, speed: 1.6 },
		md: { density: 0.4, dotScale: 2.2, speed: 1.3 },
		lg: { density: 1, dotScale: 1.5, speed: 1 },
	},
	mesh: {
		sm: { density: 0.22, dotScale: 3.2, speed: 2.2 },
		md: { density: 0.5, dotScale: 2.2, speed: 1.8 },
		lg: { density: 1, dotScale: 1.6, speed: 1.4 },
	},
}

export function orbTuning(mode: OrbMode, size: OrbSize): OrbTuning {
	return ORB_TUNING[mode][size]
}

const TAU = Math.PI * 2
/** Smallest dot we will paint. Below this an arc fill just smears. */
const MIN_R = 0.3

/* ── Primitives ─────────────────────────────────────────────────────────── */

/**
 * Deterministic pseudo-random in [0, 1). The classic GPU one-liner: no seeded
 * generator to carry, and the same `(a, b)` always gives the same value, so a
 * ring's tilt or a node's drift survives the loop being stopped and restarted.
 */
function hash(a: number, b: number): number {
	const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
	return n - Math.floor(n)
}

/**
 * The i-th of `n` points spread evenly over a unit sphere (Fibonacci lattice,
 * golden-angle spiral). Even coverage without the pole clustering a naive
 * lat/lon loop gives — which matters because `mesh` decides its edges by
 * distance, and clustered points would wire the poles into a hairball.
 */
function spherePoint(i: number, n: number): [number, number, number] {
	const golden = Math.PI * (3 - Math.sqrt(5))
	const y = 1 - (2 * (i + 0.5)) / n
	const r = Math.sqrt(Math.max(0, 1 - y * y))
	const theta = i * golden
	return [r * Math.cos(theta), y, r * Math.sin(theta)]
}

/**
 * Scale a base point count by a mode's density. Counts go by the SQUARE ROOT of
 * density: these are surface-ish quantities, so halving the linear count of a
 * ring set roughly quarters the dots on screen, and scaling linearly empties a
 * small orb out entirely.
 */
function count(base: number, density: number, floor = 3): number {
	return Math.max(floor, Math.round(base * Math.sqrt(density)))
}

/**
 * Dot radius base, in CSS px. Sub-linear in the box (`^0.6`) so a 3× bigger orb
 * gets dots about 2× bigger — the cloud reads as denser rather than merely
 * zoomed.
 */
function dotBase(size: number, dotScale: number): number {
	return (size / 300) ** 0.6 * dotScale
}

/**
 * The camera: a fixed yaw/pitch rotation, returning a projector from unit-sphere
 * coordinates to canvas coordinates plus a depth in [-1, 1] (positive = nearer).
 * Orthographic on purpose — a perspective divide at 20px buys nothing and makes
 * the near dots swell out of the box.
 */
function projector(
	yaw: number,
	pitch: number,
	cx: number,
	cy: number,
	radius: number,
): (x: number, y: number, z: number) => [number, number, number] {
	const sy = Math.sin(yaw)
	const cyaw = Math.cos(yaw)
	const sp = Math.sin(pitch)
	const cp = Math.cos(pitch)
	return (x, y, z) => {
		const rx = x * cyaw + z * sy
		const rz = -x * sy + z * cyaw
		const ry = y * cp - rz * sp
		const depth = y * sp + rz * cp
		return [cx + rx * radius, cy - ry * radius, depth]
	}
}

/** An orthonormal pair perpendicular to a unit axis — the plane of a ring. */
function ringBasis(
	ax: number,
	ay: number,
	az: number,
): [[number, number, number], [number, number, number]] {
	// Cross with whichever cardinal axis is least parallel, so the cross product
	// never degenerates to zero length.
	const [rx, ry, rz] = Math.abs(ax) < 0.9 ? [1, 0, 0] : [0, 1, 0]
	let e1x = ay * rz - az * ry
	let e1y = az * rx - ax * rz
	let e1z = ax * ry - ay * rx
	const len = Math.max(1e-6, Math.hypot(e1x, e1y, e1z))
	e1x /= len
	e1y /= len
	e1z /= len
	const e2x = ay * e1z - az * e1y
	const e2y = az * e1x - ax * e1z
	const e2z = ax * e1y - ay * e1x
	return [
		[e1x, e1y, e1z],
		[e2x, e2y, e2z],
	]
}

interface Dot {
	x: number
	y: number
	/** Depth, used only for painter's-algorithm ordering. */
	z: number
	r: number
	a: number
}

interface Line {
	x1: number
	y1: number
	x2: number
	y2: number
	w: number
	a: number
}

/** Painter's algorithm: sort far-to-near, then fill. */
function paintDots(ctx: CanvasRenderingContext2D, dots: Dot[]) {
	dots.sort((a, b) => a.z - b.z)
	for (const d of dots) {
		if (d.a < 0.02) continue
		ctx.globalAlpha = Math.min(1, d.a)
		ctx.beginPath()
		ctx.arc(d.x, d.y, Math.max(MIN_R, d.r), 0, TAU)
		ctx.fill()
	}
	ctx.globalAlpha = 1
}

function paintLines(ctx: CanvasRenderingContext2D, lines: Line[]) {
	for (const l of lines) {
		if (l.a < 0.02) continue
		ctx.globalAlpha = Math.min(1, l.a)
		ctx.lineWidth = l.w
		ctx.beginPath()
		ctx.moveTo(l.x1, l.y1)
		ctx.lineTo(l.x2, l.y2)
		ctx.stroke()
	}
	ctx.globalAlpha = 1
}

/* ── Modes ──────────────────────────────────────────────────────────────── */

export type OrbRenderer = (
	ctx: CanvasRenderingContext2D,
	/** Box size in CSS px (the context is already DPR-scaled). */
	size: number,
	/** Elapsed seconds, already multiplied by the tuning + prop speed. */
	t: number,
	tuning: OrbTuning,
) => void

/**
 * `orbit` — tilted rings, each with a faint static trace and a few bright
 * particles travelling around it at their own rate and direction. The default:
 * busy enough to read as work happening, with no beginning or end to suggest
 * progress the caller cannot actually report.
 */
const orbit: OrbRenderer = (ctx, size, t, tuning) => {
	const c = size / 2
	const radius = (size / 2) * 0.84
	const project = projector(t * 0.12, 0.3, c, c, radius)
	const rs = dotBase(size, tuning.dotScale)
	const rings = count(10, tuning.density)
	const traceN = count(34, tuning.density, 10)
	// Floor of 2: one particle per ring at small densities leaves so few bright
	// dots that the orb reads as scattered specks rather than as things orbiting.
	const particles = count(3, tuning.density, 2)
	const dots: Dot[] = []

	for (let i = 0; i < rings; i++) {
		const a = hash(i, 1.7)
		const b = hash(i, 5.2)
		const c2 = hash(i, 8.9)
		const rr = 0.45 + 0.5 * a
		// A uniformly-distributed ring axis: phi around, theta from acos so the
		// tilts do not bunch toward the poles.
		const phi = a * TAU
		const theta = Math.acos(2 * b - 1)
		const ax = Math.sin(theta) * Math.cos(phi)
		const ay = Math.cos(theta)
		const az = Math.sin(theta) * Math.sin(phi)
		const [e1, e2] = ringBasis(ax, ay, az)
		const spin = (0.3 + 0.6 * c2) * (c2 > 0.5 ? 1 : -1)

		for (let g = 0; g < traceN; g++) {
			const th = (g / traceN) * TAU
			const cs = Math.cos(th) * rr
			const sn = Math.sin(th) * rr
			const [x, y, z] = project(
				e1[0] * cs + e2[0] * sn,
				e1[1] * cs + e2[1] * sn,
				e1[2] * cs + e2[2] * sn,
			)
			const depth = (z + 1) / 2
			dots.push({ x, y, z, r: 0.6 * rs, a: 0.08 + 0.14 * depth })
		}

		for (let p = 0; p < particles; p++) {
			const th = t * spin + (p / particles) * TAU + b * 6
			const cs = Math.cos(th) * rr
			const sn = Math.sin(th) * rr
			const [x, y, z] = project(
				e1[0] * cs + e2[0] * sn,
				e1[1] * cs + e2[1] * sn,
				e1[2] * cs + e2[2] * sn,
			)
			const depth = (z + 1) / 2
			dots.push({ x, y, z, r: (0.85 + 1.2 * depth) * rs, a: 0.4 + 0.55 * depth })
		}
	}

	paintDots(ctx, dots)
}

/**
 * `globe` — a lat/lon dot sphere turning under a scan band that ping-pongs pole
 * to pole. The sweep is what makes it read as *searching* rather than merely
 * spinning; it reverses instead of wrapping so there is no jump at the seam.
 */
const globe: OrbRenderer = (ctx, size, t, tuning) => {
	const c = size / 2
	const radius = (size / 2) * 0.86
	const project = projector(t * 0.5, 0.38, c, c, radius)
	const rs = dotBase(size, tuning.dotScale)
	const latRings = count(15, tuning.density, 5)
	const lonDensity = count(40, tuning.density, 8)
	// Triangle wave in [-1, 1]: the scan latitude, sweeping and returning.
	const scan = 2 * Math.abs(((t * 0.22) % 2) - 1) - 1
	const dots: Dot[] = []

	for (let i = 0; i <= latRings; i++) {
		const lat = -Math.PI / 2 + (i / latRings) * Math.PI
		const cl = Math.cos(lat)
		const sl = Math.sin(lat)
		// Longitude count follows the ring's circumference, so spacing stays even
		// instead of crowding at the poles.
		const n = Math.max(1, Math.round(Math.abs(cl) * lonDensity))
		const near = Math.max(0, 1 - Math.abs(sl - scan) / 0.24)
		for (let j = 0; j < n; j++) {
			const lon = (j / n) * TAU
			const [x, y, z] = project(cl * Math.cos(lon), sl, cl * Math.sin(lon))
			const depth = (z + 1) / 2
			dots.push({
				x,
				y,
				z,
				r: (0.45 + 1 * depth + 0.9 * near) * rs,
				a: 0.1 + 0.4 * depth + 0.5 * near * depth,
			})
		}
	}

	paintDots(ctx, dots)
}

/**
 * `mesh` — nodes drifting on a sphere, wired to their near neighbours, with
 * signals running along the edges. Reads as relating things to each other, which
 * is why it is the one to use for retrieval/tool-call phases rather than for a
 * generic wait.
 */
const mesh: OrbRenderer = (ctx, size, t, tuning) => {
	const c = size / 2
	const radius = (size / 2) * 0.82
	const project = projector(t * 0.18, 0.32, c, c, radius)
	const rs = dotBase(size, tuning.dotScale)
	const nodeN = count(26, tuning.density, 8)
	const signals = count(4, tuning.density, 1)
	// The wiring distance has to follow the node spacing, which goes as 1/√n on a
	// sphere. Held fixed, a low-density orb has no pairs inside it and draws no
	// edges at all — the mode collapses into unrelated specks at exactly the size
	// where it most needs to say "these things are connected".
	const threshold = Math.min(1, 0.78 * Math.sqrt(26 / nodeN))
	// Same reason, applied to contrast: the same alpha over a third of the pixel
	// length reads as nothing. Contrast rises as density falls — the "small is
	// tuned, not scaled" move that dotScale makes for the dots.
	const edgeGain = Math.min(1.6, 1 / Math.sqrt(tuning.density))

	// Nodes: an even lattice, nudged by slow out-of-phase sines and renormalised
	// back onto the sphere so the drift never inflates or collapses the cloud.
	const pts: [number, number, number][] = []
	for (let i = 0; i < nodeN; i++) {
		const [bx, by, bz] = spherePoint(i, nodeN)
		const x = bx + 0.16 * Math.sin(t * 0.6 + i * 1.7)
		const y = by + 0.16 * Math.sin(t * 0.5 + i * 2.9)
		const z = bz + 0.16 * Math.sin(t * 0.7 + i * 4.3)
		const len = Math.max(1e-6, Math.hypot(x, y, z))
		pts.push([x / len, y / len, z / len])
	}

	const projected = pts.map(([x, y, z]) => project(x, y, z))
	const lines: Line[] = []
	for (let i = 0; i < nodeN; i++) {
		for (let j = i + 1; j < nodeN; j++) {
			const d = Math.hypot(
				pts[i][0] - pts[j][0],
				pts[i][1] - pts[j][1],
				pts[i][2] - pts[j][2],
			)
			if (d >= threshold) continue
			const [x1, y1, z1] = projected[i]
			const [x2, y2, z2] = projected[j]
			const depth = ((z1 + z2) / 2 + 1) / 2
			lines.push({
				x1,
				y1,
				x2,
				y2,
				w: Math.max(0.6, 0.5 * rs),
				// Fade with distance so an edge appears and dissolves rather than
				// popping in when two nodes drift across the threshold.
				a: (1 - d / threshold) * (0.14 + 0.34 * depth) * edgeGain,
			})
		}
	}

	const dots: Dot[] = []
	for (let i = 0; i < nodeN; i++) {
		const [x, y, z] = projected[i]
		const depth = (z + 1) / 2
		dots.push({ x, y, z, r: (0.7 + 1.1 * depth) * rs, a: 0.35 + 0.5 * depth })
	}

	// Signals: each occupies a whole-numbered "tick", and the tick seeds which
	// pair of nodes it runs between — so a signal picks a new route every cycle
	// without any state carried between frames.
	for (let s = 0; s < signals; s++) {
		const cycle = t * 0.5 + s * 7.31
		const tick = Math.floor(cycle)
		const p = cycle - tick
		const from = Math.floor(hash(tick, s * 3.1 + 1.7) * nodeN)
		const to = Math.floor(hash(tick, s * 5.7 + 4.2) * nodeN)
		if (from === to || !pts[from] || !pts[to]) continue
		const x = pts[from][0] + (pts[to][0] - pts[from][0]) * p
		const y = pts[from][1] + (pts[to][1] - pts[from][1]) * p
		const z = pts[from][2] + (pts[to][2] - pts[from][2]) * p
		const len = Math.max(1e-6, Math.hypot(x, y, z))
		const [px, py, pz] = project(x / len, y / len, z / len)
		const depth = (pz + 1) / 2
		dots.push({
			x: px,
			y: py,
			z: pz,
			r: (1.1 + 1.2 * depth) * rs,
			// Fade in and out at the ends of the run so a signal does not blink.
			a: Math.sin(p * Math.PI) * (0.6 + 0.4 * depth),
		})
	}

	paintLines(ctx, lines)
	paintDots(ctx, dots)
}

export const ORB_RENDERERS: Record<OrbMode, OrbRenderer> = { orbit, globe, mesh }
