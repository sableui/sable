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
	it("takes translated stepper labels", () => {
		renderWithProviders(
			<NumberField defaultValue={1} aria-label="Menge" decrementLabel="Verringern" incrementLabel="Erhöhen" />,
		)
		expect(screen.getByRole("button", { name: "Verringern" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Erhöhen" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Increase" })).toBeNull()
	})

	it("stands on each rung of the field ladder, steppers stepping down with it", () => {
		const { container } = renderWithProviders(
			<>
				<NumberField aria-label="md" />
				<NumberField aria-label="sm" size="sm" />
				<NumberField aria-label="xs" size="xs" />
			</>,
		)
		const groups = container.querySelectorAll<HTMLElement>("[role=group]")
		expect(groups[0].className).toContain("h-(--control-md)")
		expect(groups[1].className).toContain("h-(--control-sm)")
		expect(groups[2].className).toContain("h-(--control-xs)")
		expect(groups[2].className).toContain("bg-panel-field")
		const inc = screen.getAllByRole("button", { name: "Increase" })
		expect(inc[0].className).toContain("w-(--control-sm)")
		expect(inc[1].className).toContain("w-(--control-xs)")
	})

	it("submits under its name", () => {
		const { container } = renderWithProviders(
			<form>
				<NumberField name="qty" defaultValue={3} aria-label="Qty" />
			</form>,
		)
		const data = new FormData(container.querySelector("form") as HTMLFormElement)
		expect(data.get("qty")).toBe("3")
	})
})
