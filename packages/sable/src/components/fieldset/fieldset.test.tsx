import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Input } from "../input/input"
import { Fieldset, FieldsetContent, FieldsetDescription, FieldsetLegend } from "./fieldset"

describe("Fieldset", () => {
	it("is a native fieldset named by its legend", () => {
		renderWithProviders(
			<Fieldset>
				<FieldsetLegend>Billing address</FieldsetLegend>
				<FieldsetDescription>Where invoices are sent.</FieldsetDescription>
				<FieldsetContent>
					<input aria-label="Street" />
				</FieldsetContent>
			</Fieldset>,
		)
		const group = screen.getByRole("group", { name: "Billing address" })
		expect(group.tagName).toBe("FIELDSET")
		expect(group).toHaveAttribute("data-variant", "card")
	})

	it("marks itself disabled without dimming itself (its controls already dim)", () => {
		renderWithProviders(
			<Fieldset disabled>
				<FieldsetLegend>Plan</FieldsetLegend>
				<Input aria-label="Seats" />
			</Fieldset>,
		)
		expect(screen.getByRole("group")).toHaveAttribute("data-disabled")
		expect(screen.getByRole("group").className).not.toMatch(/opacity-/)
	})

	it("drops the card chrome and sets the legend as a label when plain", () => {
		renderWithProviders(
			<Fieldset variant="plain">
				<FieldsetLegend>Notifications</FieldsetLegend>
			</Fieldset>,
		)
		const group = screen.getByRole("group", { name: "Notifications" })
		expect(group).toHaveAttribute("data-variant", "plain")
		expect(group.className).not.toContain("border")
		expect(screen.getByText("Notifications").className).toContain("text-label-lg")
	})
})
