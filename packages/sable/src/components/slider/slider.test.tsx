import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Slider } from "./slider"

/**
 * The thumb is two elements on purpose: a fixed-size hit target and a
 * decorative dot that is the only thing allowed to change size. These tests
 * pin that split, because the failure mode — someone "simplifying" it back to
 * one element with a hover size — is invisible in review and breaks WCAG 2.5.8
 * (target size is measured at rest) plus Base UI's inset thumb measurement.
 */

function thumbs() {
	// Base UI's focusable element is the nested input[type=range]; the hit
	// target is its parent div.
	return screen
		.getAllByRole("slider")
		.map((input) => input.parentElement as HTMLElement)
}

describe("Slider thumb", () => {
	it("keeps a fixed-size hit target and carries no paint on it", () => {
		renderWithProviders(<Slider defaultValue={50} aria-label="Volume" />)
		const [thumb] = thumbs()
		// The box never changes: no hover/focus/drag variant may touch size.
		expect(thumb).toHaveClass("size-4")
		expect(thumb.className).not.toMatch(/(hover|focus|dragging).*:size-/)
		expect(thumb.className).not.toMatch(/:?scale-/)
		// Paint lives on the child, not the target.
		expect(thumb.className).not.toMatch(/\bbg-background\b|\bborder-primary\b/)
	})

	it("scales only the decorative inner dot, and only at rest", () => {
		renderWithProviders(<Slider defaultValue={50} aria-label="Volume" />)
		const dot = thumbs()[0].querySelector('[aria-hidden="true"]')
		expect(dot).not.toBeNull()
		const cls = (dot as HTMLElement).className
		// Quiet at rest …
		expect(cls).toContain("scale-75")
		// … full size on hover, keyboard focus, and drag.
		expect(cls).toContain("group-hover/thumb:scale-100")
		expect(cls).toContain("group-has-[:focus-visible]/thumb:scale-100")
		expect(cls).toContain("group-data-[dragging]/thumb:scale-110")
		// Decorative: it must never intercept the gesture.
		expect(cls).toContain("pointer-events-none")
	})

	it("hangs the focus ring off has-[:focus-visible], not focus-visible", () => {
		// The thumb div is not focusable — Base UI focuses a nested
		// input[type=range] — so a bare `focus-visible:` on it never fires and
		// keyboard users get no ring at all.
		renderWithProviders(<Slider defaultValue={50} aria-label="Volume" />)
		const [thumb] = thumbs()
		expect(thumb).toHaveClass("has-[:focus-visible]:ring-2")
		expect(thumb.className).not.toMatch(/(^|\s)focus-visible:ring/)
		expect(thumb.querySelector("input[type=range]")).not.toBeNull()
	})

	it("gives every thumb of a range slider the same treatment", () => {
		renderWithProviders(<Slider defaultValue={[20, 60]} />)
		const all = thumbs()
		expect(all).toHaveLength(2)
		for (const thumb of all) {
			expect(thumb).toHaveClass("size-4")
			const dot = thumb.querySelector('[aria-hidden="true"]') as HTMLElement
			expect(dot.className).toContain("scale-75")
			expect(dot.className).toContain("group-hover/thumb:scale-100")
		}
	})

	it("lays the lane, track and fill out vertically when orientation is vertical", () => {
		const { container } = renderWithProviders(
			<div className="h-40">
				<Slider orientation="vertical" defaultValue={40} aria-label="Level" />
			</div>,
		)
		const vertical = container.querySelectorAll('[data-orientation="vertical"]')
		// Root, Control, Track and Indicator each publish the axis.
		expect(vertical.length).toBeGreaterThanOrEqual(4)
		const classes = Array.from(vertical, (el) => el.getAttribute("class") ?? "").join(" ")
		expect(classes).toContain("data-[orientation=vertical]:w-5")
		expect(classes).toContain("data-[orientation=vertical]:w-1.5")
		expect(classes).toContain("data-[orientation=vertical]:w-full")
	})
})

describe("Slider naming", () => {
	// Base UI puts a Root aria-label on the role=group wrapper; only a label id
	// reaches the thumb. Without the routing, getByRole("slider", { name }) fails.
	it("names the slider input, not just the group", () => {
		renderWithProviders(<Slider defaultValue={50} aria-label="Volume" />)
		expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument()
		expect(screen.queryByRole("group", { name: "Volume" })).toBeNull()
	})

	it("names a range's group and each thumb, per thumb with getAriaLabel", () => {
		renderWithProviders(
			<Slider
				defaultValue={[20, 60]}
				aria-label="Price range"
				getAriaLabel={(i) => (i ? "Maximum price" : "Minimum price")}
			/>,
		)
		expect(screen.getByRole("group", { name: "Price range" })).toBeInTheDocument()
		expect(screen.getByRole("slider", { name: "Minimum price" })).toBeInTheDocument()
		expect(screen.getByRole("slider", { name: "Maximum price" })).toBeInTheDocument()
	})

	it("announces getAriaValueText instead of the bare number", () => {
		renderWithProviders(
			<Slider
				defaultValue={83}
				max={225}
				aria-label="Seek"
				getAriaValueText={(_, v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")} of 3:45`}
			/>,
		)
		expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute("aria-valuetext", "1:23 of 3:45")
	})
})
