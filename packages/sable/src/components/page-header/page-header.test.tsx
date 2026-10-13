import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { PageHeader } from "./page-header"

describe("PageHeader", () => {
	it("renders the route's h1 by default", () => {
		renderWithProviders(<PageHeader title="Invoices" />)
		expect(screen.getByRole("heading", { level: 1, name: "Invoices" })).toBeInTheDocument()
	})

	it("renders an h2 when the h1 is owned elsewhere", () => {
		renderWithProviders(<PageHeader title="Invoices" titleAs="h2" />)
		expect(screen.queryByRole("heading", { level: 1 })).toBeNull()
		expect(screen.getByRole("heading", { level: 2, name: "Invoices" })).toBeInTheDocument()
	})

	it("holds 20rem for the title before its actions share the row, so a phone title isn't one word a line", () => {
		renderWithProviders(<PageHeader title="Refund for a damaged order" actions={<button type="button">Reply</button>} />)
		const column = screen.getByRole("heading", { level: 1 }).parentElement as HTMLElement
		expect(column).toHaveClass("basis-[min(100%,20rem)]")
		expect(column).not.toHaveClass("basis-48")
	})

	it("wraps the title instead of truncating it", () => {
		renderWithProviders(<PageHeader title="A long page title" actions={<button type="button">Save</button>} />)
		const heading = screen.getByRole("heading", { level: 1 })
		expect(heading).not.toHaveClass("truncate")
		expect(heading).toHaveClass("min-h-(--control-md)")
	})

	it("aligns a ghost back control's glyph with the start edge and a ghost action's with the end", () => {
		renderWithProviders(
			<PageHeader
				title="Invoices"
				back={<Button variant="ghost" size="icon" aria-label="Back" />}
				actions={<Button variant="ghost" size="sm">Export</Button>}
			/>,
		)
		const back = screen.getByRole("button", { name: "Back" })
		expect(back).toHaveAttribute("data-bleed", "auto")
		expect(back.parentElement).toHaveClass("*:first:data-[bleed=auto]:-ms-(--button-ps,var(--button-px))")
		const exportButton = screen.getByRole("button", { name: "Export" })
		expect(exportButton.parentElement).toHaveClass("*:last:data-[bleed=auto]:-me-(--button-pe,var(--button-px))")
	})
})
