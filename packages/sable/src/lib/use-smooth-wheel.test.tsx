import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../test/render"
import { Scroller } from "../components/scroller"
import { MotionProvider } from "../motion/MotionProvider"

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
			<Scroller orientation="horizontal" label="Tags" smoothWheel={false} {...props}>
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

/**
 * The easing. jsdom has no layout and no frames, so geometry is stubbed and
 * requestAnimationFrame is driven by hand: each `frame()` is one 60fps frame.
 */
describe("smooth wheel", () => {
	let queue: FrameRequestCallback[] = []
	let now = 0
	let clock: { mockRestore(): void } | undefined
	beforeEach(() => {
		queue = []
		now = 0
		clock = vi.spyOn(performance, "now").mockImplementation(() => now)
		vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => queue.push(cb))
		vi.stubGlobal("cancelAnimationFrame", () => {
			queue = []
		})
	})
	afterEach(() => {
		vi.unstubAllGlobals()
		// Only our clock: restoreAllMocks would also reset the setup file's matchMedia.
		clock?.mockRestore()
	})
	function frame(n = 1) {
		for (let i = 0; i < n; i++) {
			now += 1000 / 60
			const run = queue
			queue = []
			for (const cb of run) cb(now)
		}
	}
	function list({ scrollTop = 0, scrollHeight = 2000, clientHeight = 400, smoothWheel }: { scrollTop?: number; scrollHeight?: number; clientHeight?: number; smoothWheel?: boolean } = {}) {
		const { container } = renderWithProviders(
			<Scroller label="Rows" className="h-96" smoothWheel={smoothWheel}>
				content
			</Scroller>,
		)
		const el = container.firstElementChild?.firstElementChild as HTMLElement
		Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight })
		Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight })
		el.scrollTop = scrollTop
		return el
	}
	const notch = (el: HTMLElement, deltaY: number, extra: WheelEventInit = {}) => {
		const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY, deltaMode: 1, ...extra })
		el.dispatchEvent(event)
		return event
	}

	it("eases a mouse-wheel notch toward its target instead of jumping", () => {
		const el = list()
		const event = notch(el, 3) // Firefox: 3 lines, 48px
		expect(event.defaultPrevented).toBe(true)
		expect(el.scrollTop).toBe(0) // nothing yet: the first frame moves it
		frame()
		expect(el.scrollTop).toBeGreaterThan(0)
		expect(el.scrollTop).toBeLessThan(48)
		frame(60)
		expect(el.scrollTop).toBe(48)
		expect(queue).toHaveLength(0) // settled, no frames left running
	})

	it("adds quick notches to the target, not to where it has got to", () => {
		const el = list()
		notch(el, 3)
		frame(2)
		notch(el, 3)
		notch(el, 3)
		frame(90)
		expect(el.scrollTop).toBe(144)
	})

	it("leaves a trackpad's pixel stream to the browser", () => {
		const el = list()
		const event = notch(el, 7.5, { deltaMode: 0 })
		expect(event.defaultPrevented).toBe(false)
		expect(queue).toHaveLength(0)
	})

	it("releases at the end, so the page scrolls on", () => {
		const el = list({ scrollTop: 1600 })
		expect(notch(el, 3).defaultPrevented).toBe(false)
		expect(notch(el, -3).defaultPrevented).toBe(true)
	})

	it("stops easing the moment anything else moves the region", () => {
		const el = list()
		notch(el, 30) // 480px of travel
		frame(2)
		el.scrollTop = 900 // scrollIntoView, a key, a scrollbar drag
		el.dispatchEvent(new Event("scroll"))
		frame(30)
		expect(el.scrollTop).toBe(900)
	})

	it("lets a nested scroll area that can still move take the wheel", () => {
		const { container } = renderWithProviders(
			<Scroller label="Rows">
				<pre data-testid="code" style={{ overflowY: "auto" }}>
					code
				</pre>
			</Scroller>,
		)
		const el = container.firstElementChild?.firstElementChild as HTMLElement
		Object.defineProperty(el, "scrollHeight", { configurable: true, value: 2000 })
		Object.defineProperty(el, "clientHeight", { configurable: true, value: 400 })
		const code = screen.getByTestId("code")
		Object.defineProperty(code, "scrollHeight", { configurable: true, value: 600 })
		Object.defineProperty(code, "clientHeight", { configurable: true, value: 200 })
		expect(notch(code, 3).defaultPrevented).toBe(false)
		// At its end, the inner area hands the wheel on to the region.
		code.scrollTop = 400
		expect(notch(code, 3).defaultPrevented).toBe(true)
	})

	it("leaves easing to CSS where the region smooths or snaps itself", () => {
		const el = list()
		el.style.scrollBehavior = "smooth"
		expect(notch(el, 3).defaultPrevented).toBe(false)
		expect(queue).toHaveLength(0)
	})

	it("adds no easing, and takes no wheel, under reduced motion", () => {
		const { container } = renderWithProviders(
			<MotionProvider policy="reduced">
				<Scroller label="Rows">content</Scroller>
			</MotionProvider>,
		)
		const el = container.querySelector('[role="group"]') as HTMLElement
		Object.defineProperty(el, "scrollHeight", { configurable: true, value: 2000 })
		Object.defineProperty(el, "clientHeight", { configurable: true, value: 400 })
		expect(notch(el, 3).defaultPrevented).toBe(false)
		expect(queue).toHaveLength(0)
	})

	it("is off with smoothWheel={false}: the browser's own wheel scroll stands", () => {
		const el = list({ smoothWheel: false })
		expect(notch(el, 3).defaultPrevented).toBe(false)
	})
})
