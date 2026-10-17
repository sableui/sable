import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HighlightGlide } from "./highlight-glide"

const glideOf = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-highlight-glide]")!

describe("HighlightGlide timing", () => {
	it("keeps the show/hide fade essential and makes the travel expressive", () => {
		// The durations are listed in "opacity, transform, width, height" order.
		// Opacity is first on purpose: while only opacity is listed (the arrival
		// frame), it takes the first entry, which must not vanish under "subtle".
		const { container } = render(
			<div>
				<HighlightGlide />
				<div data-highlighted="">Row</div>
			</div>,
		)
		const durations = glideOf(container).style.transitionDuration.split(/,\s*(?![^()]*\))/)
		expect(durations[0]).toBe("var(--motion-duration-instant)")
		for (const d of durations.slice(1)) expect(d).toContain("var(--motion-expressive, 1)")
	})

	it("under selection timing, leaves the timing to the recipe and follows another attribute", () => {
		const { container } = render(
			<div>
				<HighlightGlide follow="data-pressed" timing="selection" className="motion-glide" />
				<button type="button">Day</button>
				<button type="button" data-pressed="">
					Week
				</button>
			</div>,
		)
		const glide = glideOf(container)
		expect(glide.style.transitionDuration).toBe("")
		expect(glide).toHaveClass("motion-glide")
		// Placed on first paint: shown, with transitions restored for the next move.
		expect(glide).toHaveStyle({ opacity: "1" })
		expect(glide.style.transitionProperty).toBe("")
	})
})
