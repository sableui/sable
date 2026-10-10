import { describe, expect, it } from "vitest"
import { renderWithProviders, screen, within } from "../../test/render"
import { MiddleTruncate } from "./middle-truncate"

describe("MiddleTruncate", () => {
	it("exposes the full value to assistive tech when truncated", () => {
		const full = "0x1234567890abcdef1234567890"
		renderWithProviders(<MiddleTruncate text={full} data-testid="mt" />)
		const el = screen.getByTestId("mt")
		// The whole value is present (visually hidden) for screen readers …
		expect(within(el).getByText(full)).toBeInTheDocument()
		// … the visible, abbreviated text is hidden from AT …
		expect(el.querySelector('[aria-hidden="true"]')).toHaveTextContent("…")
		// … and the tooltip carries the full value for pointer users.
		expect(el).toHaveAttribute("title", full)
	})

	it("renders short strings verbatim with no tooltip", () => {
		renderWithProviders(<MiddleTruncate text="abc" data-testid="mt" />)
		const el = screen.getByTestId("mt")
		expect(el).toHaveTextContent("abc")
		expect(el).not.toHaveAttribute("title")
		expect(el.querySelector('[aria-hidden="true"]')).toBeNull()
	})
})
