import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

/**
 * Test setup. Adds jest-dom matchers, tears down the DOM between tests, and
 * polyfills the handful of browser APIs jsdom omits that Base UI primitives
 * (Dialog, Popover, Menu, Combobox…) touch on mount. Without these, opening a
 * portalled overlay throws in jsdom even though the component is correct.
 */

afterEach(() => {
	cleanup()
})

// matchMedia — read by reduced-motion checks and Base UI positioning.
if (!window.matchMedia) {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}))
}

// Observers — jsdom ships neither; overlays measure on open.
class MockObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return []
	}
}
globalThis.ResizeObserver ??= MockObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??=
	MockObserver as unknown as typeof IntersectionObserver

// Pointer-capture + scrolling — used by drag/focus logic; no-op in jsdom.
if (!Element.prototype.hasPointerCapture) {
	Element.prototype.hasPointerCapture = () => false
	Element.prototype.setPointerCapture = () => {}
	Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {}
}
