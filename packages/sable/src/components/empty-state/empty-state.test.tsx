import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { EmptyState } from "./empty-state"

describe("EmptyState", () => {
	it("titles a panel state with text and a page state with a heading", () => {
		const { rerender } = renderWithProviders(<EmptyState title="No projects yet" description="Create one to start." />)
		expect(screen.queryByRole("heading")).toBeNull()
		expect(screen.getByText("No projects yet").tagName).toBe("P")
		rerender(<EmptyState size="lg" title="Page not found" />)
		expect(screen.getByRole("heading", { level: 2, name: "Page not found" })).toBeInTheDocument()
	})

	it("announces a destructive state and gives it a warning glyph", () => {
		const { container } = renderWithProviders(<EmptyState tone="destructive" title="Couldn't load projects" />)
		expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load projects")
		expect(container.querySelector('[data-icon="warning"]')).not.toBeNull()
	})

	it("shows a code in place of the default glyph, and renders the action", () => {
		const { container } = renderWithProviders(
			<EmptyState tone="destructive" code="404" title="Page not found" action={<button type="button">Go home</button>} />,
		)
		expect(screen.getByText("404")).toBeInTheDocument()
		expect(container.querySelector('[data-icon="warning"]')).toBeNull()
		expect(screen.getByRole("button", { name: "Go home" })).toBeInTheDocument()
	})
})
