import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../test/render"
import { Scroller } from "../components/scroller"

/**
 * Each of these is one of the four traps that make a naive wheel-to-horizontal
 * mapping feel broken. jsdom lays nothing out, so the region's scroll geometry
 * is stubbed — what is under test is the decision logic, not the pixels.
 */
describe("wheel-to-horizontal", () => {
	function strip({
		scrollLeft = 0,
		scrollWidth = 1000,
		clientWidth = 300,
		...props
	}: {
		scrollLeft?: number
		scrollWidth?: number
		clientWidth?: number
		orientation?: "horizontal" | "vertical"
		wheelScroll?: boolean
	} = {}) {
		const { container } = renderWithProviders(
			<Scroller orientation="horizontal" label="Tags" {...props}>
				content
			</Scroller>,
		)
		// Scroller renders chrome > scroller; the wheel and keys are the scroller's.
		const el = container.firstElementChild?.firstElementChild as HTMLElement
		Object.defineProperty(el, "scrollWidth", { configurable: true, value: scrollWidth })
		Object.defineProperty(el, "clientWidth", { configurable: true, value: clientWidth })
		el.scrollLeft = scrollLeft
		return el
	}

	function wheel(
		el: HTMLElement,
		init: { deltaY?: number; deltaX?: number; deltaMode?: number; shiftKey?: boolean },
	) {
		const event = new WheelEvent("wheel", {
			bubbles: true,
			cancelable: true,
			deltaY: 0,
			deltaX: 0,
			...init,
		})
		el.dispatchEvent(event)
		return event
	}

	it("turns a vertical wheel into horizontal movement", () => {
		const el = strip()
		const event = wheel(el, { deltaY: 120 })
		expect(el.scrollLeft).toBe(120)
		expect(event.defaultPrevented).toBe(true)
	})

	it("releases the wheel at the ends, so the page can scroll", () => {
		// The trap: intercepting unconditionally means a reader scrolling the
		// document stops dead when the pointer crosses the strip.
		const atEnd = strip({ scrollLeft: 700 })
		const forward = wheel(atEnd, { deltaY: 120 })
		expect(forward.defaultPrevented).toBe(false)
		expect(atEnd.scrollLeft).toBe(700)

		// …but the other direction still works from the same position.
		const back = wheel(atEnd, { deltaY: -120 })
		expect(back.defaultPrevented).toBe(true)
		expect(atEnd.scrollLeft).toBe(580)

		const atStart = strip({ scrollLeft: 0 })
		expect(wheel(atStart, { deltaY: -120 }).defaultPrevented).toBe(false)
	})

	it("leaves a trackpad's own horizontal gesture alone", () => {
		// deltaX dominant => the browser is already scrolling sideways. Handling
		// deltaY too would move a diagonal swipe twice.
		const el = strip()
		const event = wheel(el, { deltaX: 90, deltaY: 20 })
		expect(event.defaultPrevented).toBe(false)
		expect(el.scrollLeft).toBe(0)
	})

	it("leaves shift+wheel to the browser", () => {
		const el = strip()
		const event = wheel(el, { deltaY: 120, shiftKey: true })
		expect(event.defaultPrevented).toBe(false)
		expect(el.scrollLeft).toBe(0)
	})

	it("normalises line- and page-mode deltas", () => {
		// A mouse often reports lines. Using the raw value moves ~3px per notch.
		const lines = strip()
		wheel(lines, { deltaY: 3, deltaMode: 1 })
		expect(lines.scrollLeft).toBe(48)

		const pages = strip()
		wheel(pages, { deltaY: 1, deltaMode: 2 })
		expect(pages.scrollLeft).toBe(400)
	})

	it("does nothing when there is nothing to scroll", () => {
		const el = strip({ scrollWidth: 300, clientWidth: 300 })
		expect(wheel(el, { deltaY: 120 }).defaultPrevented).toBe(false)
	})

	it("can be turned off, and is off for a vertical Scroller", () => {
		const off = strip({ wheelScroll: false })
		expect(wheel(off, { deltaY: 120 }).defaultPrevented).toBe(false)

		const vertical = strip({ orientation: "vertical" })
		expect(wheel(vertical, { deltaY: 120 }).defaultPrevented).toBe(false)
	})
})

describe("keyboard scrolling", () => {
	function region(orientation: "horizontal" | "vertical" = "horizontal") {
		const { container } = renderWithProviders(
			<Scroller orientation={orientation} label="Tags">
				content
			</Scroller>,
		)
		const el = container.firstElementChild?.firstElementChild as HTMLElement
		Object.defineProperty(el, "scrollWidth", { configurable: true, value: 1000 })
		Object.defineProperty(el, "clientWidth", { configurable: true, value: 300 })
		Object.defineProperty(el, "scrollHeight", { configurable: true, value: 1000 })
		Object.defineProperty(el, "clientHeight", { configurable: true, value: 300 })
		return el
	}

	function key(el: HTMLElement, k: string) {
		const event = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true })
		el.dispatchEvent(event)
		return event
	}

	it("is reachable by keyboard in every browser, not just the ones that volunteer", () => {
		const el = region()
		expect(el.tabIndex).toBe(0)
		expect(screen.getByRole("group", { name: "Tags" })).toBe(el)
		// `data-orientation`, not `aria-orientation`: the latter is invalid on
		// role="group" and axe flags it critical.
		expect(el.getAttribute("data-orientation")).toBe("horizontal")
		expect(el.hasAttribute("aria-orientation")).toBe(false)
	})

	it("steps with the arrows along its own axis", () => {
		const el = region()
		key(el, "ArrowRight")
		expect(el.scrollLeft).toBe(60) // 20% of a 300px viewport
		key(el, "ArrowLeft")
		expect(el.scrollLeft).toBe(0)
		// The cross-axis arrows are not ours to take.
		expect(key(el, "ArrowDown").defaultPrevented).toBe(false)
	})

	it("jumps to the ends with Home and End, and clamps", () => {
		const el = region()
		key(el, "End")
		expect(el.scrollLeft).toBe(700)
		key(el, "ArrowRight")
		expect(el.scrollLeft).toBe(700)
		key(el, "Home")
		expect(el.scrollLeft).toBe(0)
	})

	it("pages with PageUp / PageDown", () => {
		const el = region()
		key(el, "PageDown")
		expect(el.scrollLeft).toBe(300)
	})

	it("uses the vertical axis when the Scroller is vertical", () => {
		const el = region("vertical")
		key(el, "ArrowDown")
		expect(el.scrollTop).toBe(60)
		expect(key(el, "ArrowRight").defaultPrevented).toBe(false)
	})
})
