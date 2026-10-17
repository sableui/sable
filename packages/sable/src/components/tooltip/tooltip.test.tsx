import { act, fireEvent, render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SimpleTooltip, TooltipGroup } from "./tooltip"

/**
 * TooltipGroup's contract: every SimpleTooltip inside it is a trigger of ONE
 * shared tooltip, so moving between triggers changes what the open tooltip
 * says rather than opening a second one. The glide itself is CSS and is not
 * observable in jsdom; what is testable is that there is only ever one popup.
 */
describe("TooltipGroup", () => {
	function Toolbar() {
		return (
			<TooltipGroup motion="subtle">
				<SimpleTooltip content="Bold">
					<button type="button">B</button>
				</SimpleTooltip>
				<SimpleTooltip content="Italic">
					<button type="button">I</button>
				</SimpleTooltip>
			</TooltipGroup>
		)
	}

	it("opens one shared tooltip and moves it to the next trigger", async () => {
		const user = userEvent.setup()
		render(<Toolbar />)
		await user.hover(screen.getByRole("button", { name: "B" }))
		expect(await screen.findByText("Bold", {}, { timeout: 2000 })).toBeInTheDocument()

		// Straight onto the neighbour: the open tooltip takes the new label.
		await user.hover(screen.getByRole("button", { name: "I" }))
		expect(await screen.findByText("Italic", {}, { timeout: 2000 })).toBeInTheDocument()
		// One popup — the same tooltip, now describing the other trigger.
		expect(document.querySelectorAll("[data-current]")).toHaveLength(1)
		expect(screen.queryByText("Bold")?.closest("[data-current]") ?? null).toBeNull()
	})

	it("puts the motion level on the portalled positioner, outside the group's subtree", async () => {
		render(<Toolbar />)
		await act(async () => {
			fireEvent.focus(screen.getByRole("button", { name: "B" }))
		})
		const label = await screen.findByText("Bold")
		expect(label.closest("[data-motion]")).toHaveAttribute("data-motion", "subtle")
	})

	it("leaves a SimpleTooltip outside a group as its own tooltip", async () => {
		render(
			<SimpleTooltip content="Alone">
				<button type="button">A</button>
			</SimpleTooltip>,
		)
		await act(async () => {
			fireEvent.focus(screen.getByRole("button", { name: "A" }))
		})
		expect(await screen.findByText("Alone")).toBeInTheDocument()
	})
})
