import { renderWithProviders as render, screen } from "../../test/render"
import { describe, expect, it } from "vitest"
import { IconTile } from "./icon-tile"

describe("IconTile", () => {
	it("is decorative unless labelled", () => {
		const { container } = render(<IconTile icon="file" />)
		const tile = container.querySelector("[data-slot=icon-tile]") as HTMLElement
		expect(tile).toHaveAttribute("aria-hidden", "true")
		expect(tile).not.toHaveAttribute("role")
	})

	it("takes a name when it stands alone", () => {
		render(<IconTile icon="file" label="Document" />)
		expect(screen.getByRole("img", { name: "Document" })).toBeInTheDocument()
	})

	it("reads the Avatar ladder for size and corner, and scales the icon with it", () => {
		const { container } = render(<IconTile icon="file" size="sm" />)
		const tile = container.querySelector("[data-slot=icon-tile]") as HTMLElement
		expect(tile.className).toContain("size-8")
		expect(tile.className).toContain("rounded-sm")
		expect(tile.className).toContain("text-base")
	})

	it("fills from the surface's well by default, or the muted surface", () => {
		const well = render(<IconTile icon="file" />).container.querySelector("[data-slot=icon-tile]") as HTMLElement
		expect(well.className).toContain("sable-well")
		const muted = render(<IconTile icon="file" appearance="muted" />).container.querySelector("[data-slot=icon-tile]:last-of-type") as HTMLElement
		expect(muted.className).toContain("bg-muted")
		expect(muted.className).not.toContain("sable-well")
	})

	it("replaces the fill with a palette family's wash and ink", () => {
		const { container } = render(<IconTile icon="tag" tone="teal" />)
		const tile = container.querySelector("[data-slot=icon-tile]") as HTMLElement
		expect(tile).toHaveAttribute("data-palette", "teal")
		expect(tile.className).toContain("bg-palette-wash")
		expect(tile.className).not.toContain("sable-well")
	})
})
