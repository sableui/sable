import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { NumberField } from "./number-field"

describe("NumberField", () => {
	it("increments and decrements via the labelled stepper buttons", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<NumberField
				defaultValue={5}
				onValueChange={onValueChange}
				aria-label="Qty"
			/>,
		)
		await user.click(screen.getByRole("button", { name: "Increase" }))
		expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(6)

		await user.click(screen.getByRole("button", { name: "Decrease" }))
		await user.click(screen.getByRole("button", { name: "Decrease" }))
		expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(4)
	})

	it("labels the input via aria-label (so getByLabelText resolves it)", () => {
		renderWithProviders(<NumberField defaultValue={1} aria-label="Qty" />)
		expect(screen.getByLabelText("Qty")).toBeInTheDocument()
	})
})
