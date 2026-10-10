import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Carousel, type CarouselSlidesToShow } from "./carousel"

const realMatchMedia = window.matchMedia
/** Fake a viewport width: `(min-width: Npx)` matches when N <= width. */
function mockViewport(width: number) {
	window.matchMedia = vi.fn((query: string) => {
		const min = /min-width:\s*(\d+)px/.exec(query)
		return {
			matches: min ? Number(min[1]) <= width : false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		} as MediaQueryList
	}) as typeof window.matchMedia
}

/** Number of slides on screen (off-screen slides are aria-hidden). */
function visibleSlides(slidesToShow: CarouselSlidesToShow) {
	const { container } = renderWithProviders(
		<Carousel label="Responsive" slidesToShow={slidesToShow}>
			{["A", "B", "C", "D", "E", "F"].map((s) => (
				<div key={s}>{s}</div>
			))}
		</Carousel>,
	)
	return container.querySelectorAll(
		'[aria-roledescription="slide"]:not([aria-hidden="true"])',
	).length
}

describe("Carousel slidesToShow", () => {
	afterEach(() => {
		window.matchMedia = realMatchMedia
	})

	it("still accepts a plain number", () => {
		mockViewport(1400)
		expect(visibleSlides(2)).toBe(2)
	})

	it("uses base below the first breakpoint", () => {
		mockViewport(500)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(1)
	})

	it("picks the largest matching breakpoint", () => {
		mockViewport(1100)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(3)
	})

	it("inherits a missing key from the next smaller defined one", () => {
		// md (768) is undefined, so 800px falls back to sm's value.
		mockViewport(800)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(2)
	})

	it("defaults base to 1 when only larger keys are given", () => {
		mockViewport(500)
		expect(visibleSlides({ md: 4 })).toBe(1)
	})
})

function ThreeSlides() {
	return (
		<Carousel label="Demo carousel">
			<div>One</div>
			<div>Two</div>
			<div>Three</div>
		</Carousel>
	)
}

describe("Carousel dots", () => {
	it("gives each pagination dot a 24px hit area around the small visual", () => {
		renderWithProviders(<ThreeSlides />)
		const dots = screen.getAllByRole("button", { name: /Go to slide/ })
		expect(dots).toHaveLength(3)
		for (const dot of dots) {
			// WCAG 2.2 target-size: the button is the 24px tap target …
			expect(dot).toHaveClass("size-6")
			// … and the 6px visual dot is a decorative child, hidden from AT.
			expect(dot.querySelector('[aria-hidden="true"]')).not.toBeNull()
		}
	})

	it("marks the active dot with aria-current", () => {
		renderWithProviders(<ThreeSlides />)
		const dots = screen.getAllByRole("button", { name: /Go to slide/ })
		expect(dots[0]).toHaveAttribute("aria-current", "true")
		expect(dots[1]).not.toHaveAttribute("aria-current")
	})
})

describe("Carousel arrows", () => {
	it("use Button's floating tier and centre on the slides, not the dots row", () => {
		renderWithProviders(
			<Carousel dots>
				<div>One</div>
				<div>Two</div>
			</Carousel>,
		)
		const next = screen.getByRole("button", { name: "Next slide" })
		expect(next.className).toContain("bg-popover/90")
		// The arrow's positioning box wraps the viewport only.
		const box = next.parentElement as HTMLElement
		expect(box.querySelector("[aria-keyshortcuts]")).not.toBeNull()
		expect(box.contains(screen.getByRole("group", { name: "Choose slide" }))).toBe(false)
	})
})
