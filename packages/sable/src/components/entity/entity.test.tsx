import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Entity } from "./entity"

describe("Entity", () => {
	it("renders a presentational row (no button role) by default", () => {
		renderWithProviders(<Entity title="Alex" subtitle="@alex" />)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.getByText("Alex")).toBeInTheDocument()
	})

	it("activates an interactive row on click and Enter/Space", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(
			<Entity interactive onSelect={onSelect} title="Alex" />,
		)
		const row = screen.getByRole("button", { name: /Alex/ })
		// A real <button> — natively focusable and Enter/Space-operable.
		expect(row.tagName).toBe("BUTTON")

		await user.click(row)
		expect(onSelect).toHaveBeenCalledTimes(1)

		row.focus()
		await user.keyboard("{Enter}")
		expect(onSelect).toHaveBeenCalledTimes(2)

		await user.keyboard(" ")
		expect(onSelect).toHaveBeenCalledTimes(3)
	})

	it("chains a consumer onClick alongside onSelect on an interactive row", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		const onClick = vi.fn()
		renderWithProviders(
			<Entity
				interactive
				onSelect={onSelect}
				onClick={onClick}
				title="Alex"
			/>,
		)
		await user.click(screen.getByRole("button", { name: /Alex/ }))
		expect(onSelect).toHaveBeenCalledTimes(1)
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it("applies the comfortable density padding", () => {
		const { container } = renderWithProviders(
			<Entity density="comfortable" title="Alex" />,
		)
		expect((container.firstChild as HTMLElement).className).toContain("px-[var(--entity-px,--spacing(4))]")
	})

	it("defaults to compact padding (the legacy 12px / 10px unless a CardList sets --entity-px)", () => {
		const { container } = renderWithProviders(<Entity title="Alex" />)
		expect((container.firstChild as HTMLElement).className).toContain("px-[var(--entity-px,--spacing(3))]")
	})

	it("reads the hover and focus radius from --entity-radius so a container can square it", () => {
		const { container } = renderWithProviders(
			<Entity interactive onSelect={() => {}} title="Alex" />,
		)
		const radius = "rounded-[var(--entity-radius,var(--radius-md))]"
		expect((container.firstChild as HTMLElement).className).toContain(radius)
		expect(screen.getByRole("button").className).toContain(`after:${radius}`)
	})

	it("marks the current row of a selectable list for sight and for screen readers", () => {
		const { container, rerender } = renderWithProviders(
			<Entity interactive selected onSelect={() => {}} title="Alex" />,
		)
		const row = container.firstChild as HTMLElement
		expect(row).toHaveAttribute("data-selected")
		expect(row.className).toContain("sable-surface-interactive")
		expect(screen.getByRole("button")).toHaveAttribute("aria-current", "true")
		rerender(<Entity interactive onSelect={() => {}} title="Alex" />)
		expect(container.firstChild).not.toHaveAttribute("data-selected")
		expect(screen.getByRole("button")).not.toHaveAttribute("aria-current")
	})
})
