import { useRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders } from "../test/render"
import { useScrollActivity } from "./use-scroll-activity"

function Region({ hide = false }: { hide?: boolean }) {
	const setNode = useScrollActivity()
	const stable = useRef(null)
	if (hide) return <p ref={stable}>gone</p>
	return (
		<div data-testid="region" ref={setNode} className="overflow-y-auto scrollbar-quiet">
			content
		</div>
	)
}

describe("useScrollActivity", () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})
	afterEach(() => {
		vi.useRealTimers()
	})

	function region(container: HTMLElement) {
		return container.querySelector("[data-testid='region']") as HTMLElement
	}

	it("marks the element while scrolling and clears it after the linger", () => {
		const { container } = renderWithProviders(<Region />)
		const el = region(container)
		expect(el.hasAttribute("data-scrolling")).toBe(false)

		fireEvent.scroll(el)
		expect(el.hasAttribute("data-scrolling")).toBe(true)

		vi.advanceTimersByTime(599)
		expect(el.hasAttribute("data-scrolling")).toBe(true)

		vi.advanceTimersByTime(2)
		expect(el.hasAttribute("data-scrolling")).toBe(false)
	})

	it("keeps the mark alive through a continuous scroll", () => {
		// The failure this prevents: a timer set on the FIRST event and never
		// reset, so the bar vanishes mid-gesture on any scroll longer than the
		// linger.
		const { container } = renderWithProviders(<Region />)
		const el = region(container)

		for (let i = 0; i < 5; i++) {
			fireEvent.scroll(el)
			vi.advanceTimersByTime(400)
			expect(el.hasAttribute("data-scrolling")).toBe(true)
		}
		vi.advanceTimersByTime(701)
		expect(el.hasAttribute("data-scrolling")).toBe(false)
	})

	it("detaches on unmount without touching a removed node", () => {
		const { container, unmount } = renderWithProviders(<Region />)
		const el = region(container)
		fireEvent.scroll(el)
		expect(el.hasAttribute("data-scrolling")).toBe(true)

		unmount()
		// The pending timer must not throw or resurrect the attribute on a node
		// that is no longer in the tree.
		expect(() => vi.advanceTimersByTime(1000)).not.toThrow()
		expect(el.hasAttribute("data-scrolling")).toBe(false)
	})

	it("stops listening to an element it no longer owns", () => {
		const { container, rerender } = renderWithProviders(<Region />)
		const el = region(container)
		rerender(<Region hide />)

		// The old node is detached; scrolling it must not re-mark it.
		fireEvent.scroll(el)
		expect(el.hasAttribute("data-scrolling")).toBe(false)
	})
})
