import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { InlineStatus } from "./inline-status"

describe("InlineStatus", () => {
	it("renders the tone's icon and the message", () => {
		renderWithProviders(<InlineStatus tone="success">Saved</InlineStatus>)
		expect(screen.getByText("Saved")).toBeInTheDocument()
		// The success tone maps to the circle-check glyph (same as Note).
		expect(
			document.querySelector('[data-icon="circle-check"]'),
		).toBeInTheDocument()
	})

	it("uses a custom icon and suppresses the tone glyph", () => {
		renderWithProviders(
			<InlineStatus tone="neutral" icon={<span data-testid="custom" />}>
				Working…
			</InlineStatus>,
		)
		expect(screen.getByTestId("custom")).toBeInTheDocument()
		expect(document.querySelector("[data-icon]")).toBeNull()
	})

	it("colors the whole line with the tone (error → destructive)", () => {
		const { container } = renderWithProviders(
			<InlineStatus tone="destructive">Failed</InlineStatus>,
		)
		expect((container.firstChild as HTMLElement).className).toContain(
			"text-destructive",
		)
	})

	it("centres the glyph on the first line instead of nudging it by a fixed offset", () => {
		renderWithProviders(<InlineStatus tone="success" size="md">Saved</InlineStatus>)
		const glyph = document.querySelector('[data-icon="circle-check"]') as HTMLElement
		const box = glyph.parentElement as HTMLElement
		expect(box.className).toContain("h-[1lh]")
		expect(box.className).toContain("items-center")
		expect(glyph.getAttribute("class") ?? "").not.toContain("mt-px")
	})
})
