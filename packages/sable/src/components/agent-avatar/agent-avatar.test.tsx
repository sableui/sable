import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MotionProvider } from "../../motion/MotionProvider"
import { AgentAvatar } from "./agent-avatar"
import {
	BODY,
	EAR_LEFT,
	EAR_PIVOT,
	EAR_RIGHT,
	pose,
	RISE,
	restPose,
	riseTarget,
	stepRise,
} from "./agent-avatar.render"

/** The point a path starts at: `M x y`. */
const start = (d: string) => d.match(/^M([\d.]+) ([\d.]+)/)!.slice(1).map(Number)

describe("AgentAvatar", () => {
	it("is a named image, with the drawing hidden from assistive tech", () => {
		const { getByRole, container } = render(<AgentAvatar />)
		expect(getByRole("img")).toHaveAttribute("aria-label", "Assistant")
		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
	})

	it("takes a label", () => {
		const { getByRole } = render(<AgentAvatar label="Sable Copilot" />)
		expect(getByRole("img")).toHaveAttribute("aria-label", "Sable Copilot")
	})

	it("sits on the Avatar size ladder and frame", () => {
		const { getByRole } = render(<AgentAvatar size="sm" />)
		expect(getByRole("img")).toHaveClass("size-8", "rounded-full", "bg-muted", "overflow-hidden")
	})

	it("reports its state, and a turn that is not live rests whatever its state", () => {
		const { getByRole, rerender } = render(<AgentAvatar state="thinking" />)
		expect(getByRole("img")).toHaveAttribute("data-state", "thinking")
		rerender(<AgentAvatar state="thinking" live={false} />)
		expect(getByRole("img")).toHaveAttribute("data-state", "idle")
	})

	it("draws each state as a still pose when motion is off", () => {
		const { container, rerender } = render(
			<MotionProvider policy="off">
				<AgentAvatar />
			</MotionProvider>,
		)
		const body = () => container.querySelector("svg > g")!.getAttribute("transform")
		expect(body()).toBe(restPose("idle").body)
		rerender(
			<MotionProvider policy="off">
				<AgentAvatar state="thinking" />
			</MotionProvider>,
		)
		expect(body()).toBe(restPose("thinking").body)
	})

	it("marks a turned-down motion level on the root for the CSS policy", () => {
		const { getByRole } = render(<AgentAvatar motion="subtle" />)
		expect(getByRole("img")).toHaveAttribute("data-motion", "subtle")
	})
})

describe("AgentAvatar drawing", () => {
	it("pivots each ear on the point where its outer edge meets the head", () => {
		// The bug this guards: pivoted anywhere else, a perked ear's outer corner
		// lifts off the curved skull and a sliver of frame shows between them.
		expect(start(EAR_LEFT)).toEqual([...EAR_PIVOT.left])
		expect(start(EAR_RIGHT)).toEqual([...EAR_PIVOT.right])
		const p = pose({ rise: 0, gx: 0, gy: 0, near: 1, happy: 1, think: 0, blink: 0, twitchLeft: 16, twitchRight: 16 })
		expect(p.earLeft).toContain(`${EAR_PIVOT.left[0]} ${EAR_PIVOT.left[1]})`)
		expect(p.earRight).toContain(`${EAR_PIVOT.right[0]} ${EAR_PIVOT.right[1]})`)
	})

	it("mirrors the ears", () => {
		const nums = (d: string) => d.match(/[\d.]+/g)!.map(Number)
		const left = nums(EAR_LEFT)
		const right = nums(EAR_RIGHT)
		left.forEach((n, i) => expect(i % 2 === 0 ? 100 - n : n).toBeCloseTo(right[i]))
	})

	it("runs the body on below the frame, so a risen sable never floats", () => {
		const bottom = Math.max(...BODY.match(/[\d.]+/g)!.map(Number).filter((_, i) => i % 2 === 1))
		expect(bottom).toBeGreaterThan(100 + Math.max(...Object.values(RISE)))
	})

	it("sinks to think, rises to speak, and peeks at rest", () => {
		expect(RISE.thinking).toBeGreaterThan(RISE.idle)
		expect(RISE.speaking).toBeLessThan(RISE.idle)
		expect(riseTarget("idle", 1, false, 0, 0)).toBe(RISE.near)
		expect(riseTarget("idle", 0, true, 0, 0)).toBe(RISE.hover)
		// Thinking holds its pose even with the pointer over it.
		expect(riseTarget("thinking", 1, true, 0, 0)).toBe(RISE.thinking)
	})

	it("settles the rise spring on its target, with and without overshoot", () => {
		for (const springy of [true, false]) {
			let y: number = RISE.idle
			let v = 0
			let peak = y
			for (let i = 0; i < 240; i++) {
				;[y, v] = stepRise(y, v, RISE.speaking, 1 / 60, springy)
				peak = Math.min(peak, y)
			}
			expect(y).toBeCloseTo(RISE.speaking, 1)
			// Only the expressive spring may pass its target on the way in.
			if (!springy) expect(peak).toBeGreaterThanOrEqual(RISE.speaking - 1e-6)
		}
	})

	it("closes the eyes to a sliver on a blink, never to nothing", () => {
		const shut = pose({ rise: 0, gx: 0, gy: 0, near: 0, happy: 0, think: 0, blink: 1, twitchLeft: 0, twitchRight: 0 })
		expect(shut.eye.h).toBeGreaterThan(0)
		expect(shut.eye.h).toBeLessThan(restPose("idle").eye.h)
	})
})
