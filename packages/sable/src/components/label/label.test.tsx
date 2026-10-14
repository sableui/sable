import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Label } from "./label"

describe("Label", () => {
	it("renders a plain, non-focusable label by default", () => {
		renderWithProviders(<Label>Email</Label>)
		const label = screen.getByText("Email")
		expect(label.tagName).toBe("LABEL")
		expect(label).not.toHaveAttribute("tabindex")
	})

	it("applies the paired size step", () => {
		renderWithProviders(<Label size="xs">Small label</Label>)
		expect(screen.getByText("Small label").className).toContain("text-label-xs")
	})

	it("opts into the uppercase eyebrow tier only when asked", () => {
		renderWithProviders(<Label eyebrow>Latest</Label>)
		expect(screen.getByText("Latest").className).toContain("text-overline")
	})

	it("adds a focusable dotted-underline affordance when hint is set", () => {
		renderWithProviders(<Label hint="Taken off every order.">Discount</Label>)
		const label = screen.getByText("Discount")
		expect(label).toHaveAttribute("tabindex", "0")
		expect(label.className).toContain("border-dotted")
		expect(label.className).toContain("cursor-help")
	})
})
