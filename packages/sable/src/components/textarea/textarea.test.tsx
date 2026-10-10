import { describe, expect, it } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders, screen } from "../../test/render"
import { Textarea } from "./index"

/**
 * Same floor as Input: iOS Safari zooms the page when a focused field computes
 * under 16px, and the page body tier is 15px. See components/input/input.tsx.
 */
describe("Textarea — mobile type floor", () => {
	it("renders a >=16px paired tier below sm and the designed tier at sm and up", () => {
		renderWithProviders(<Textarea placeholder="Notes" />)
		const textarea = screen.getByPlaceholderText("Notes")
		expect(textarea.className).toContain("max-sm:text-body-lg")
		expect(textarea.className).toContain("text-body-md")
	})

	it("leaves the compact register alone", () => {
		renderWithProviders(
			<Density value="compact">
				<Textarea placeholder="Notes" />
			</Density>,
		)
		const textarea = screen.getByPlaceholderText("Notes")
		expect(textarea.className).toContain("text-ui-md")
		expect(textarea.className).not.toContain("max-sm:")
	})
})
