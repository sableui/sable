import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { renderWithProviders, screen } from "../../test/render"
import { Field } from "../form"
import { DatePicker } from "./date-picker"

async function pickFirstEnabledDay(user: ReturnType<typeof userEvent.setup>) {
	const cells = await screen.findAllByRole("gridcell")
	const button = cells
		.map((cell) => cell.querySelector("button:not(:disabled)"))
		.find((b): b is HTMLButtonElement => b != null)
	expect(button).toBeTruthy()
	if (button) await user.click(button)
}

describe("DatePicker", () => {
	it("shows the placeholder when empty", () => {
		renderWithProviders(<DatePicker />)
		expect(screen.getByText("Pick a date")).toBeInTheDocument()
	})

	it("renders Sable's Calendar inside the popover", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DatePicker />)
		await user.click(screen.getByRole("button", { name: /pick a date/i }))
		const grid = await screen.findByRole("grid")
		expect(grid.closest('[data-slot="calendar"]')).not.toBeNull()
	})

	it("selects a day, fires onValueChange and the deprecated onChange, and closes", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		const onChange = vi.fn()
		renderWithProviders(
			<DatePicker onValueChange={onValueChange} onChange={onChange} />,
		)
		await user.click(screen.getByRole("button", { name: /pick a date/i }))
		await pickFirstEnabledDay(user)
		expect(onValueChange).toHaveBeenCalledTimes(1)
		expect(onChange).toHaveBeenCalledTimes(1)
		expect(onValueChange.mock.calls[0][0]).toBeInstanceOf(Date)
		// Uncontrolled: the trigger now shows the formatted day.
		expect(screen.queryByText("Pick a date")).not.toBeInTheDocument()
	})

	it("formats date and time in the trigger with granularity=minute", () => {
		renderWithProviders(
			<DatePicker granularity="minute" value={new Date(2026, 5, 18, 14, 30)} />,
		)
		expect(screen.getByText("Jun 18, 2026 at 14:30")).toBeInTheDocument()
	})

	it("applies defaultTime to the first day pick with granularity=minute", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<DatePicker
				granularity="minute"
				onValueChange={onValueChange}
				defaultTime="12:00"
			/>,
		)
		await user.click(screen.getByRole("button", { name: /pick date & time/i }))
		await pickFirstEnabledDay(user)
		const picked = onValueChange.mock.calls[0][0] as Date
		expect(picked.getHours()).toBe(12)
		expect(picked.getMinutes()).toBe(0)
		// The popover stays open so the time can still be set.
		expect(screen.getByRole("combobox", { name: "Hour" })).toBeInTheDocument()
	})

	it("changes the minute from the time row with granularity=minute", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<DatePicker
				granularity="minute"
				value={new Date(2026, 5, 18, 14, 30)}
				onValueChange={onValueChange}
				minuteStep={15}
			/>,
		)
		await user.click(screen.getByRole("button", { name: /jun 18, 2026/i }))
		await user.click(screen.getByRole("combobox", { name: "Minute" }))
		await user.click(await screen.findByRole("option", { name: "45" }))
		expect(onValueChange).toHaveBeenCalledTimes(1)
		const picked = onValueChange.mock.calls[0][0] as Date
		expect(picked.getDate()).toBe(18)
		expect(picked.getHours()).toBe(14)
		expect(picked.getMinutes()).toBe(45)
		expect(picked.getSeconds()).toBe(0)
	})

	it("renders no time row with the default day granularity", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DatePicker />)
		await user.click(screen.getByRole("button", { name: /pick a date/i }))
		await screen.findByRole("grid")
		expect(screen.queryByRole("combobox", { name: "Hour" })).toBeNull()
	})

	it("takes its name and description from a wrapping Field", () => {
		renderWithProviders(
			<Field label="Publish at" description="Times are in UTC.">
				<DatePicker />
			</Field>,
		)
		const trigger = screen.getByRole("button", { name: /publish at/i })
		expect(trigger).toHaveAccessibleDescription("Times are in UTC.")
	})

	it("wears the field shell, not a pill button", () => {
		renderWithProviders(<DatePicker />)
		const trigger = screen.getByRole("button", { name: /pick a date/i })
		expect(trigger.className).toContain("rounded-sm")
		expect(trigger.className).toContain("border-field-border")
	})

	it("sits on the property-grid rung at size xs, the same well as SelectTrigger xs", () => {
		renderWithProviders(<DatePicker size="xs" aria-label="Due date" />)
		const trigger = screen.getByRole("button", { name: "Due date" })
		expect(trigger.className).toContain("h-(--control-xs)")
		expect(trigger.className).toContain("bg-panel-field")
		expect(trigger.className).toContain("border-transparent")
		expect(trigger.className).not.toContain("border-field-border")
		expect(trigger.className).not.toContain("max-sm:text-body-lg")
	})

	it("writes the date with formatOptions when given", () => {
		const date = new Date(2026, 9, 23)
		renderWithProviders(<DatePicker value={date} formatOptions={{ month: "short", day: "numeric" }} aria-label="Due date" />)
		const expected = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date)
		expect(screen.getByRole("button", { name: "Due date" })).toHaveTextContent(expected)
		expect(screen.getByRole("button", { name: "Due date" })).not.toHaveTextContent("2026")
	})
})
