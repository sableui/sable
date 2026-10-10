import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
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

	it("wraps the title instead of truncating it", () => {
		renderWithProviders(<PageHeader title="A long page title" actions={<button type="button">Save</button>} />)
		const heading = screen.getByRole("heading", { level: 1 })
		expect(heading).not.toHaveClass("truncate")
		expect(heading).toHaveClass("min-h-(--control-md)")
	})
})
