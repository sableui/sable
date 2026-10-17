import { describe, expect, it } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { ToolCall } from "./tool-call"

describe("ToolCall", () => {
	it("leads with the title, keeps the tool name, and says the status", () => {
		renderWithProviders(<ToolCall name="search_docs" title="Searched the docs" status="complete" />)
		expect(screen.getByText("Searched the docs")).toBeInTheDocument()
		expect(screen.getByText("search_docs")).toBeInTheDocument()
		expect(screen.getByText("Done")).toBeInTheDocument()
	})

	it("is a plain row with nothing to disclose, and a disclosure with details", () => {
		const { rerender } = renderWithProviders(<ToolCall name="ping" status="complete" />)
		expect(screen.queryByRole("button")).toBeNull()
		rerender(<ToolCall name="ping" status="complete" input={{ host: "sableui.com" }} />)
		const trigger = screen.getByRole("button")
		expect(trigger).toHaveAttribute("aria-expanded", "false")
		fireEvent.click(trigger)
		expect(trigger).toHaveAttribute("aria-expanded", "true")
		expect(screen.getByText(/"host": "sableui.com"/)).toBeInTheDocument()
	})

	it("shows the error without opening anything", () => {
		renderWithProviders(<ToolCall name="run_tests" status="error" error="3 tests failed." input={{}} />)
		expect(screen.getByText("3 tests failed.")).toBeVisible()
		expect(screen.getByText("Failed")).toBeInTheDocument()
	})

	it("announces a status change, never the status it mounted with", () => {
		const { rerender } = renderWithProviders(<ToolCall name="read_file" title="Reading the file" status="running" />)
		const live = screen.getByRole("status")
		expect(live).toHaveTextContent("")
		rerender(<ToolCall name="read_file" title="Reading the file" status="complete" />)
		expect(live).toHaveTextContent("Reading the file: Done")
	})

	it("keeps one live glyph: the spinner hands over to the outcome", () => {
		const { container, rerender } = renderWithProviders(<ToolCall name="x" status="running" />)
		const active = () => container.querySelectorAll('[data-active="true"]')
		expect(active()).toHaveLength(1)
		rerender(<ToolCall name="x" status="error" />)
		expect(active()).toHaveLength(1)
		expect(active()[0].querySelector('[data-icon="warning"]')).toBeInTheDocument()
	})
})
