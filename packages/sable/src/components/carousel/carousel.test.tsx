import { afterEach, describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Carousel, type CarouselSlidesToShow } from "./carousel"

const realClientWidth = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")
/** Fake the carousel's own width: jsdom lays nothing out, so every clientWidth is 0. */
function mockCarouselWidth(width: number) {
	Object.defineProperty(Element.prototype, "clientWidth", {
		configurable: true,
		get(this: Element) {
			return this.tagName === "SECTION" ? width : 0
		},
	})
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
		if (realClientWidth) Object.defineProperty(Element.prototype, "clientWidth", realClientWidth)
		vi.unstubAllGlobals()
	})

	it("still accepts a plain number", () => {
		mockCarouselWidth(1400)
		expect(visibleSlides(2)).toBe(2)
	})

	it("uses base below the first breakpoint", () => {
		mockCarouselWidth(500)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(1)
	})

	it("picks the largest matching breakpoint", () => {
		mockCarouselWidth(1100)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(3)
	})

	it("inherits a missing key from the next smaller defined one", () => {
		// md (768) is undefined, so 800px falls back to sm's value.
		mockCarouselWidth(800)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(2)
	})

	it("defaults base to 1 when only larger keys are given", () => {
		mockCarouselWidth(500)
		expect(visibleSlides({ md: 4 })).toBe(1)
	})

	it("reads its own width, not the viewport's: a narrow column on a wide screen stays at base", () => {
		// A viewport query would say lg here; the carousel is 500px wide.
		vi.stubGlobal("matchMedia", (query: string) => ({ matches: /min-width/.test(query), media: query, addEventListener() {}, removeEventListener() {} }))
		mockCarouselWidth(500)
		expect(visibleSlides({ base: 1, sm: 2, lg: 3 })).toBe(1)
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

describe("Carousel motion", () => {
	const slides = ["A", "B", "C"].map((s) => <div key={s}>{s}</div>)

	it("eases the active dot's width instead of snapping it", () => {
		// The dot grew w-1.5 → w-4 under motion-interactive, which does not list
		// width: the bar jumped while the slides beside it glided.
		renderWithProviders(<Carousel label="Gallery">{slides}</Carousel>)
		const dot = screen.getByRole("button", { name: "Go to slide 1" }).querySelector("span")
		expect(dot).toHaveClass("motion-glide", "w-4")
	})

	it("turns motion down on its own root with the motion prop", () => {
		const { container, rerender } = renderWithProviders(<Carousel label="Gallery">{slides}</Carousel>)
		const root = () => container.querySelector('[aria-roledescription="carousel"]')!
		expect(root()).not.toHaveAttribute("data-motion")
		rerender(
			<Carousel label="Gallery" motion="subtle">
				{slides}
			</Carousel>,
		)
		expect(root()).toHaveAttribute("data-motion", "subtle")
	})
})

describe("Carousel arrows", () => {
	it("grow to the 44px touch target while staying positioned at the slide edge", () => {
		const slides = ["A", "B"].map((s) => <div key={s}>{s}</div>)
		renderWithProviders(<Carousel loop>{slides}</Carousel>)
		for (const name of ["Previous slide", "Next slide"]) {
			const arrow = screen.getByRole("button", { name })
			expect(arrow.className).toContain("pointer-coarse:before:size-[44px]")
			expect(arrow.className).toContain("absolute")
			expect(arrow.className.split(/\s+/)).not.toContain("relative")
		}
	})
})

describe("Carousel labels", () => {
	it("speaks English by default and takes every word as a prop", () => {
		const slides = ["A", "B"].map((s) => <div key={s}>{s}</div>)
		const { container, rerender } = renderWithProviders(<Carousel autoplay={3000}>{slides}</Carousel>)
		expect(screen.getByRole("region", { name: "Slides" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Pause autoplay" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: "1 of 2" })).toBeInTheDocument()
		expect(container.querySelector("[aria-live]")).toHaveTextContent("Slide 1 of 2")
		rerender(
			<Carousel
				autoplay={3000}
				label="Galerie"
				previousLabel="Précédente"
				nextLabel="Suivante"
				slideLabel={(i, n) => `${i} sur ${n}`}
				positionLabel={(i, n) => `Diapositive ${i} sur ${n}`}
				dotsLabel="Choisir une diapositive"
				dotLabel={(i) => `Aller à la diapositive ${i}`}
				pauseLabel="Mettre en pause"
				playLabel="Lancer"
			>
				{slides}
			</Carousel>,
		)
		expect(screen.getByRole("region", { name: "Galerie" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Précédente" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Suivante" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: "1 sur 2" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: "Choisir une diapositive" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Aller à la diapositive 2" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Mettre en pause" })).toBeInTheDocument()
		expect(container.querySelector("[aria-live]")).toHaveTextContent("Diapositive 1 sur 2")
	})

	it("draws inactive dots dark enough to clear 3:1", () => {
		renderWithProviders(<ThreeSlides />)
		const inactive = screen.getByRole("button", { name: "Go to slide 2" }).querySelector("span")
		expect(inactive).toHaveClass("bg-muted-foreground/70")
		expect(inactive?.className).not.toContain("/40")
	})
})
