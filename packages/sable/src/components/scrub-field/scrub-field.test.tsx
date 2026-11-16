import userEvent from "@testing-library/user-event"
import { createRef, useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { Field } from "../form/form"
import { ScrubField } from "./scrub-field"

/**
 * The keyboard and form half of ScrubField. The drag gesture is pinned in
 * lib/scrub-gesture.test.tsx; this pins what a keyboard user and a form see:
 * Enter commits, Escape reverts, arrows step and clamp, and a named field
 * submits its committed number — never the draft being typed.
 */

function Controlled(props: Partial<Parameters<typeof ScrubField>[0]> & { initial?: number; onChange?: (n: number) => void }) {
	const { initial = 50, onChange, ...rest } = props
	const [value, setValue] = useState(initial)
	return (
		<ScrubField
			label="Opacity"
			min={0}
			max={100}
			{...rest}
			value={value}
			onValueChange={(next) => {
				setValue(next)
				onChange?.(next)
			}}
		/>
	)
}

describe("ScrubField — keyboard", () => {
	it("commits a typed value on Enter, clamped to the range", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} />)
		const input = screen.getByLabelText("Opacity")
		await user.click(input)
		await user.keyboard("{Control>}a{/Control}250{Enter}")
		expect(onChange).toHaveBeenLastCalledWith(100)
		// Once: Enter commits and blurs, and the blur must not commit again.
		expect(onChange).toHaveBeenCalledTimes(1)
		expect(input).toHaveValue("100")
	})

	it("reverts the draft on Escape without reporting it", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} />)
		const input = screen.getByLabelText("Opacity")
		await user.click(input)
		await user.keyboard("{Control>}a{/Control}7")
		expect(input).toHaveValue("7")
		await user.keyboard("{Escape}")
		expect(input).toHaveValue("50")
		expect(onChange).not.toHaveBeenCalled()
	})

	it("steps with the arrows, ten steps with Shift, and clamps at the bounds", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Controlled initial={95} />)
		const input = screen.getByLabelText("Opacity")
		await user.click(input)
		await user.keyboard("{ArrowDown}")
		expect(input).toHaveValue("94")
		await user.keyboard("{Shift>}{ArrowUp}{/Shift}")
		expect(input).toHaveValue("100")
		await user.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}")
		expect(input).toHaveValue("80")
	})

	it("shows the step's precision, never a thousands separator", () => {
		renderWithProviders(
			<>
				<ScrubField label="Seed" value={1234} />
				<ScrubField label="Threshold" value={0.25} step={0.01} />
			</>,
		)
		expect(screen.getByLabelText("Seed")).toHaveValue("1234")
		expect(screen.getByLabelText("Threshold")).toHaveValue("0.25")
	})

	it("ignores arrows and the handle when read-only", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled readOnly onChange={onChange} icon="grid" />)
		const input = screen.getByLabelText("Opacity")
		expect(input).toHaveAttribute("readonly")
		await user.click(input)
		await user.keyboard("{ArrowUp}")
		expect(onChange).not.toHaveBeenCalled()
	})
})

describe("ScrubField — forms and Field", () => {
	it("submits the committed number under its name, not the draft", async () => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(
			<form>
				<Controlled name="opacity" initial={60} step={0.5} />
			</form>,
		)
		const form = container.querySelector("form") as HTMLFormElement
		expect(new FormData(form).get("opacity")).toBe("60.0")
		const input = screen.getByLabelText("Opacity")
		await user.click(input)
		await user.keyboard("{Control>}a{/Control}12")
		// Mid-edit: the form still reads the last committed value.
		expect(new FormData(form).get("opacity")).toBe("60.0")
		await user.keyboard("{Enter}")
		expect(new FormData(form).get("opacity")).toBe("12.0")
		// The visible input never submits on its own.
		expect([...new FormData(form).keys()]).toEqual(["opacity"])
	})

	it("submits nothing while disabled, like a native control", () => {
		const { container } = renderWithProviders(
			<form>
				<ScrubField label="Opacity" name="opacity" value={60} disabled />
			</form>,
		)
		expect(new FormData(container.querySelector("form") as HTMLFormElement).get("opacity")).toBeNull()
	})

	it("keeps the description, error and required state a Field hands it", () => {
		renderWithProviders(
			<Field label="Opacity" description="0 to 100" error="Too high" required>
				<ScrubField label="Opacity" value={120} />
			</Field>,
		)
		const input = screen.getByRole("textbox", { name: "Opacity" })
		expect(input).toHaveAttribute("aria-invalid", "true")
		expect(input).toBeRequired()
		const described = input.getAttribute("aria-describedby") ?? ""
		expect(described.split(" ").length).toBeGreaterThanOrEqual(2)
		expect(document.getElementById(described.split(" ")[0])).toHaveTextContent("0 to 100")
	})

	it("forwards its ref and other DOM props to the input", () => {
		const ref = createRef<HTMLInputElement>()
		const onKeyDown = vi.fn()
		renderWithProviders(
			<ScrubField ref={ref} label="Opacity" value={5} data-testid="scrub" onKeyDown={onKeyDown} className="w-16" />,
		)
		const input = screen.getByTestId("scrub")
		expect(ref.current).toBe(input)
		fireEvent.keyDown(input, { key: "ArrowUp" })
		expect(onKeyDown).toHaveBeenCalled()
		// className sizes the shell, not the input.
		expect(input.parentElement).toHaveClass("w-16")
		expect(input).not.toHaveClass("w-16")
	})
})
