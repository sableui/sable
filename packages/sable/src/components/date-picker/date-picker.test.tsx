import { de } from "date-fns/locale"
import { createRef } from "react"
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

	it("writes formatOptions in its locale, en-US without one, never the reader's", () => {
		const date = new Date(2026, 9, 23)
		const { rerender } = renderWithProviders(
			<DatePicker value={date} formatOptions={{ month: "long", day: "numeric" }} aria-label="Due date" />,
		)
		expect(screen.getByRole("button", { name: "Due date" })).toHaveTextContent("October 23")
		rerender(<DatePicker value={date} locale={de} formatOptions={{ month: "long", day: "numeric" }} aria-label="Due date" />)
		expect(screen.getByRole("button", { name: "Due date" })).toHaveTextContent("23. Oktober")
	})
})

describe("DatePicker locale", () => {
	it("writes the default label in the locale and localises the calendar", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DatePicker value={new Date(2026, 9, 23)} locale={de} aria-label="Termin" />)
		const trigger = screen.getByRole("button", { name: "Termin" })
		expect(trigger).toHaveTextContent("23. Okt. 2026")
		await user.click(trigger)
		const calendar = (await screen.findByRole("grid")).closest('[data-slot="calendar"]') as HTMLElement
		expect(calendar).toHaveTextContent("Oktober 2026")
	})

	it("keeps the English default without a locale", () => {
		renderWithProviders(<DatePicker value={new Date(2026, 9, 23)} aria-label="Due" />)
		expect(screen.getByRole("button", { name: "Due" })).toHaveTextContent("Oct 23, 2026")
	})
})

describe("DatePicker labels", () => {
	it("names the time row and its Selects from props", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<DatePicker
				granularity="minute"
				value={new Date(2026, 5, 18, 14, 30)}
				timeLabel="Uhrzeit"
				hourLabel="Stunde"
				minuteLabel="Minute (min)"
				aria-label="Start"
			/>,
		)
		await user.click(screen.getByRole("button", { name: "Start" }))
		expect(screen.getByRole("group", { name: "Uhrzeit" })).toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Stunde" })).toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Minute (min)" })).toBeInTheDocument()
	})
})

describe("DatePicker in a form", () => {
	function submitted(form: HTMLFormElement) {
		return new FormData(form)
	}

	it("submits the day as yyyy-MM-dd under its name", () => {
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="due" defaultValue={new Date(2026, 9, 3)} aria-label="Due" />
			</form>,
		)
		expect(submitted(container.querySelector("form") as HTMLFormElement).get("due")).toBe("2026-10-03")
	})

	it("submits a minute as a local datetime and a time as HH:mm", () => {
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="at" granularity="minute" value={new Date(2026, 9, 3, 9, 5)} aria-label="At" />
				<DatePicker name="opens" granularity="time" value={new Date(2026, 9, 3, 7, 45)} aria-label="Opens" />
			</form>,
		)
		const data = submitted(container.querySelector("form") as HTMLFormElement)
		expect(data.get("at")).toBe("2026-10-03T09:05")
		expect(data.get("opens")).toBe("07:45")
	})

	it("submits an empty string when nothing is picked, and follows a pick", async () => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="due" aria-label="Due" />
			</form>,
		)
		const form = container.querySelector("form") as HTMLFormElement
		expect(submitted(form).get("due")).toBe("")
		await user.click(screen.getByRole("button", { name: "Due" }))
		await pickFirstEnabledDay(user)
		expect(submitted(form).get("due")).toMatch(/^\d{4}-\d{2}-\d{2}$/)
	})

	it("belongs to the form its `form` attribute names", () => {
		renderWithProviders(
			<>
				<form id="booking" />
				<DatePicker name="due" form="booking" defaultValue={new Date(2026, 0, 2)} aria-label="Due" />
			</>,
		)
		expect(new FormData(document.getElementById("booking") as HTMLFormElement).get("due")).toBe("2026-01-02")
	})

	it("blocks submit while required and empty, and hands focus to the trigger", () => {
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="due" required aria-label="Due" />
			</form>,
		)
		const form = container.querySelector("form") as HTMLFormElement
		const trigger = screen.getByRole("button", { name: "Due" })
		expect(trigger).toHaveAttribute("aria-required", "true")
		expect(form.checkValidity()).toBe(false)
		const input = container.querySelector('input[name="due"]') as HTMLInputElement
		expect(input.type).not.toBe("hidden")
		expect(input).toHaveAttribute("aria-hidden", "true")
		expect(input.tabIndex).toBe(-1)
		input.focus()
		expect(trigger).toHaveFocus()
	})

	it("passes validity once a value is set", () => {
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="due" required defaultValue={new Date(2026, 0, 2)} aria-label="Due" />
			</form>,
		)
		expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true)
	})

	it("takes `required` from a wrapping Field", () => {
		const { container } = renderWithProviders(
			<form>
				<Field label="Check-in" required>
					<DatePicker name="checkin" />
				</Field>
			</form>,
		)
		expect(screen.getByRole("button", { name: /check-in/i })).toHaveAttribute("aria-required", "true")
		expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false)
	})

	it("does not open, and is not validated, when readOnly", async () => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(
			<form>
				<DatePicker name="due" required readOnly aria-label="Due" />
			</form>,
		)
		await user.click(screen.getByRole("button", { name: "Due" }))
		expect(screen.queryByRole("grid")).toBeNull()
		expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true)
	})

	it("renders no input without a name or required", () => {
		const { container } = renderWithProviders(<DatePicker aria-label="Due" />)
		expect(container.querySelector("input")).toBeNull()
	})
})

describe("DatePicker trigger", () => {
	it("forwards ref and the remaining button props to the trigger", () => {
		const ref = createRef<HTMLButtonElement>()
		renderWithProviders(<DatePicker ref={ref} aria-label="Due" data-testid="due" title="Due date" />)
		const trigger = screen.getByRole("button", { name: "Due" })
		expect(ref.current).toBe(trigger)
		expect(trigger).toHaveAttribute("data-testid", "due")
		expect(trigger).toHaveAttribute("title", "Due date")
	})

	it("takes the sm rung, SelectTrigger's toolbar size", () => {
		renderWithProviders(<DatePicker size="sm" aria-label="From" />)
		const trigger = screen.getByRole("button", { name: "From" })
		expect(trigger.className).toContain("h-(--control-sm)")
		expect(trigger.className).toContain("border-field-border")
		expect(trigger.className).not.toContain("max-sm:text-body-lg")
	})
})

describe("DatePicker time", () => {
	it("shows only the time row, with no calendar", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<DatePicker granularity="time" value={new Date(2026, 5, 18, 9, 0)} minuteStep={15} onValueChange={onValueChange} aria-label="Opens" />,
		)
		const trigger = screen.getByRole("button", { name: "Opens" })
		expect(trigger).toHaveTextContent("09:00")
		await user.click(trigger)
		await user.click(await screen.findByRole("combobox", { name: "Minute" }))
		await user.click(await screen.findByRole("option", { name: "30" }))
		expect(screen.queryByRole("grid")).toBeNull()
		const picked = onValueChange.mock.calls[0][0] as Date
		expect([picked.getHours(), picked.getMinutes()]).toEqual([9, 30])
	})

	it("says what it picks when empty", () => {
		renderWithProviders(<DatePicker granularity="time" />)
		expect(screen.getByRole("button", { name: /pick a time/i })).toBeInTheDocument()
	})
})

describe("DatePicker range", () => {
	async function dayButton(n: number) {
		const cells = await screen.findAllByRole("gridcell")
		return cells
			.map((cell) => cell.querySelector("button"))
			.find((b): b is HTMLButtonElement => b != null && b.textContent === String(n) && !b.closest("[data-outside]"))!
	}

	it("picks a start, then an end, then closes", async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()
		renderWithProviders(
			<form>
				<DatePicker mode="range" name="stay" defaultValue={undefined} onValueChange={onValueChange} minDate={new Date(2026, 9, 1)} maxDate={new Date(2026, 9, 31)} />
			</form>,
		)
		await user.click(screen.getByRole("button", { name: /pick a date range/i }))
		await user.click(await dayButton(12))
		// The start is held in the picker: nothing is committed until the end.
		expect(onValueChange).not.toHaveBeenCalled()
		// Still open for the end.
		expect(screen.getByRole("grid")).toBeInTheDocument()
		await user.click(await dayButton(8))
		// Picked out of order: the range still runs forward.
		expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 8), to: new Date(2026, 9, 12) })
		const trigger = screen.getByRole("button", { name: /oct 8, 2026/i })
		expect(trigger).toHaveTextContent("Oct 8, 2026 – Oct 12, 2026")
		expect(new FormData(trigger.closest("form") as HTMLFormElement).get("stay")).toBe("2026-10-08/2026-10-12")
	})

	it("submits nothing until both ends are picked", () => {
		const { container } = renderWithProviders(
			<form>
				<DatePicker mode="range" name="stay" value={{ from: new Date(2026, 9, 8), to: undefined }} aria-label="Stay" />
			</form>,
		)
		expect(new FormData(container.querySelector("form") as HTMLFormElement).get("stay")).toBe("")
		expect(screen.getByRole("button", { name: "Stay" })).toHaveTextContent("Oct 8, 2026 –")
	})
})
