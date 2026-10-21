import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Collapsible, CollapsibleIndicator, CollapsiblePanel, CollapsibleTrigger } from "./collapsible"
import { IconProvider } from "../../icon"
import type { IconSet } from "../../icon"

const set: IconSet = ({ name, className }) => <svg data-testid={`icon-${name}`} className={className} />

function Group({ direction }: { direction?: "down" | "end" }) {
	return (
		<IconProvider set={set}>
			<Collapsible>
				{/* No group class on the trigger: the indicator finds the open state itself. */}
				<CollapsibleTrigger>
					<CollapsibleIndicator direction={direction} />
					In progress
				</CollapsibleTrigger>
				<CollapsiblePanel>Rows</CollapsiblePanel>
			</Collapsible>
		</IconProvider>
	)
}

describe("CollapsibleIndicator", () => {
	it("reads the open state from the trigger above it, with no class to add", async () => {
		render(<Group />)
		const glyph = screen.getByTestId("icon-chevron-down")
		expect(glyph.getAttribute("class")).toContain("[[data-panel-open]_&]:rotate-180")
		expect(glyph.getAttribute("class")).toContain("motion-interactive")
		const trigger = screen.getByRole("button", { name: "In progress" })
		expect(glyph.closest("[data-panel-open]")).toBeNull()
		await userEvent.setup().click(trigger)
		expect(glyph.closest("[data-panel-open]")).toBe(trigger)
	})

	it("points to the inline end while closed with direction end, and turns down on open", () => {
		render(<Group direction="end" />)
		const classes = screen.getByTestId("icon-chevron-down").getAttribute("class") ?? ""
		expect(classes).toContain("-rotate-90")
		expect(classes).toContain("rtl:rotate-90")
		expect(classes).toContain("[[data-panel-open]_&]:rotate-0")
		expect(classes).not.toContain("rotate-180")
	})
})
