import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ThinkingOrb } from "./thinking-orb"
import {
	ORB_PX,
	ORB_RENDERERS,
	type OrbMode,
	type OrbSize,
	orbTuning,
} from "./thinking-orb.render"

const MODES: OrbMode[] = ["orbit", "globe", "mesh"]
const SIZES: OrbSize[] = ["sm", "md", "lg"]

describe("ThinkingOrb", () => {
	it("announces the wait as a live region and hides the canvas from AT", () => {
		const { getByRole, container } = render(<ThinkingOrb />)
		const status = getByRole("status")
		expect(status).toHaveAttribute("aria-label", "Thinking")
		expect(container.querySelector("canvas")).toHaveAttribute(
			"aria-hidden",
			"true",
		)
	})

	it("uses the label prop as the announcement", () => {
		const { getByRole } = render(<ThinkingOrb label="Searching" />)
		expect(getByRole("status")).toHaveAttribute("aria-label", "Searching")
	})

	it("sizes the box from the size ladder on the spacing scale, not from className", () => {
		const { getByRole } = render(<ThinkingOrb size="lg" />)
		// 16 spacing units = ORB_PX.lg at the default --spacing; density moves it.
		expect(getByRole("status").getAttribute("style")).toContain("calc(var(--spacing) * 16)")
		expect(ORB_PX.lg).toBe(64)
	})

	it("renders without a 2D context (jsdom, SSR-ish hosts) rather than throwing", () => {
		// getContext returns null here; the effect must bail, not blow up.
		expect(() => render(<ThinkingOrb mode="mesh" />)).not.toThrow()
	})
})

describe("ThinkingOrb rendering core", () => {
	it("tunes every mode at every size step", () => {
		for (const mode of MODES) {
			for (const size of SIZES) {
				const t = orbTuning(mode, size)
				expect(t.density).toBeGreaterThan(0)
				expect(t.dotScale).toBeGreaterThan(0)
				expect(t.speed).toBeGreaterThan(0)
			}
		}
	})

	it("gives smaller boxes fewer, larger, faster points", () => {
		// The tuning table's whole reason to exist: a 20px orb is not a scaled-down
		// 64px one. If this inverts, small orbs go back to reading as grey mush.
		for (const mode of MODES) {
			const sm = orbTuning(mode, "sm")
			const lg = orbTuning(mode, "lg")
			expect(sm.density).toBeLessThan(lg.density)
			expect(sm.dotScale).toBeGreaterThan(lg.dotScale)
			expect(sm.speed).toBeGreaterThan(lg.speed)
		}
	})

	it("paints every mode at every size, and paints more at larger sizes", () => {
		for (const mode of MODES) {
			let previous = 0
			for (const size of SIZES) {
				const ctx = stubContext()
				ORB_RENDERERS[mode](ctx.api, ORB_PX[size], 1.23, orbTuning(mode, size))
				expect(ctx.arcs).toBeGreaterThan(0)
				expect(ctx.arcs).toBeGreaterThan(previous)
				previous = ctx.arcs
			}
		}
	})

	it("wires edges in mesh at every size", () => {
		// Edges carry the mode's meaning; they used to vanish entirely at sm
		// because the wiring distance was a constant instead of following 1/√n.
		for (const size of SIZES) {
			const ctx = stubContext()
			ORB_RENDERERS.mesh(ctx.api, ORB_PX[size], 0.8, orbTuning("mesh", size))
			expect(ctx.strokes).toBeGreaterThan(0)
		}
	})

	it("is a pure function of time — same frame in, same frame out", () => {
		const a = stubContext()
		const b = stubContext()
		ORB_RENDERERS.orbit(a.api, 64, 2.5, orbTuning("orbit", "lg"))
		ORB_RENDERERS.orbit(b.api, 64, 2.5, orbTuning("orbit", "lg"))
		expect(a.log).toEqual(b.log)
	})

	it("keeps every dot inside the canvas box", () => {
		for (const mode of MODES) {
			for (const t of [0, 0.6, 3.7, 41]) {
				const ctx = stubContext()
				ORB_RENDERERS[mode](ctx.api, 64, t, orbTuning(mode, "lg"))
				for (const [x, y, r] of ctx.circles) {
					expect(x - r).toBeGreaterThanOrEqual(0)
					expect(x + r).toBeLessThanOrEqual(64)
					expect(y - r).toBeGreaterThanOrEqual(0)
					expect(y + r).toBeLessThanOrEqual(64)
				}
			}
		}
	})

	it("never paints with an alpha outside [0, 1]", () => {
		for (const mode of MODES) {
			const ctx = stubContext()
			ORB_RENDERERS[mode](ctx.api, 64, 5.5, orbTuning(mode, "lg"))
			for (const a of ctx.alphas) {
				expect(a).toBeGreaterThanOrEqual(0)
				expect(a).toBeLessThanOrEqual(1)
			}
		}
	})
})

/**
 * A recording stand-in for CanvasRenderingContext2D — enough surface for the
 * renderers, and a log of what they drew so a frame can be asserted on without
 * a real canvas (jsdom has none).
 */
function stubContext() {
	const state = {
		arcs: 0,
		strokes: 0,
		alpha: 1,
		log: [] as string[],
		circles: [] as [number, number, number][],
		alphas: [] as number[],
	}
	const api = {
		set globalAlpha(v: number) {
			state.alpha = v
			state.alphas.push(v)
			state.log.push(`alpha:${v.toFixed(4)}`)
		},
		get globalAlpha() {
			return state.alpha
		},
		fillStyle: "",
		strokeStyle: "",
		lineWidth: 1,
		beginPath: vi.fn(),
		fill: () => {
			state.log.push("fill")
		},
		stroke: () => {
			state.strokes++
			state.log.push("stroke")
		},
		moveTo: (x: number, y: number) => state.log.push(`m:${x.toFixed(3)},${y.toFixed(3)}`),
		lineTo: (x: number, y: number) => state.log.push(`l:${x.toFixed(3)},${y.toFixed(3)}`),
		arc: (x: number, y: number, r: number) => {
			state.arcs++
			state.circles.push([x, y, r])
			state.log.push(`a:${x.toFixed(3)},${y.toFixed(3)},${r.toFixed(3)}`)
		},
	} as unknown as CanvasRenderingContext2D

	return {
		api,
		get arcs() {
			return state.arcs
		},
		get strokes() {
			return state.strokes
		},
		get log() {
			return state.log
		},
		get circles() {
			return state.circles
		},
		get alphas() {
			return state.alphas
		},
	}
}
