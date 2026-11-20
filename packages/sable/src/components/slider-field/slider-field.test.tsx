import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, renderWithProviders, screen } from "../../test/render"
import { SliderField } from "./slider-field"

/**
 * The drag is Base UI's and is tested there. This pins what SliderField adds:
 * the typed value (three ways in, Enter / Escape / blur out), the readout's
 * precision, the spoken unit and the form value.
 */

function Controlled(
	props: Partial<Parameters<typeof SliderField>[0]> & {
		initial?: number
		onChange?: (n: number) => void
	},
) {
	const { initial = 50, onChange, ...rest } = props
	const [value, setValue] = useState(initial)
	return (
		<SliderField
			label="Opacity"
			{...rest}
			value={value}
			onValueChange={(next) => {
				setValue(next)
				onChange?.(next)
			}}
		/>
	)
}

const slider = () => screen.getByRole("slider", { name: "Opacity" })

describe("SliderField — slider", () => {
	it("is a named slider that steps with the arrow keys", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} />)
		slider().focus()
		await user.keyboard("{ArrowRight}")
		expect(onChange).toHaveBeenLastCalledWith(51)
		expect(slider()).toHaveAttribute("aria-valuenow", "51")
	})

	it("speaks a string suffix with the value, at the step's precision", () => {
		renderWithProviders(
			<>
				<SliderField label="Opacity" suffix="%" value={60} />
				<SliderField label="Falloff" value={0.5} max={2} step={0.1} suffix="x" />
			</>,
		)
		expect(slider()).toHaveAttribute("aria-valuetext", "60%")
		expect(screen.getByRole("slider", { name: "Falloff" })).toHaveAttribute("aria-valuetext", "0.5x")
	})

	it("works uncontrolled from defaultValue", async () => {
		const user = userEvent.setup()
		renderWithProviders(<SliderField label="Opacity" defaultValue={20} />)
		slider().focus()
		await user.keyboard("{ArrowRight}")
		expect(slider()).toHaveAttribute("aria-valuenow", "21")
	})
})

describe("SliderField — typing a value", () => {
	it("opens on Enter with the value selected, and commits a clamped number", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		const onCommitted = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} onValueCommitted={onCommitted} />)
		slider().focus()
		await user.keyboard("{Enter}")
		const input = screen.getByRole("textbox", { name: "Opacity" })
		expect(input).toHaveFocus()
		expect(input).toHaveValue("50")
		// The value was selected, so typing replaces it.
		await user.keyboard("250{Enter}")
		expect(onChange).toHaveBeenCalledTimes(1)
		expect(onChange).toHaveBeenLastCalledWith(100)
		expect(onCommitted).toHaveBeenLastCalledWith(100)
		// The input is gone and the keyboard is back on the slider.
		expect(screen.queryByRole("textbox")).toBeNull()
		expect(slider()).toHaveFocus()
	})

	it("opens on a typed digit and keeps it as the first character", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled initial={5} onChange={onChange} />)
		slider().focus()
		// "5" equals the current value: it must still be a first digit, not a selection.
		await user.keyboard("5")
		expect(screen.getByRole("textbox", { name: "Opacity" })).toHaveValue("5")
		await user.keyboard("0{Enter}")
		expect(onChange).toHaveBeenLastCalledWith(50)
	})

	it("reverts on Escape without reporting a change", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} />)
		slider().focus()
		await user.keyboard("{Enter}7{Escape}")
		expect(onChange).not.toHaveBeenCalled()
		expect(screen.queryByRole("textbox")).toBeNull()
		expect(slider()).toHaveAttribute("aria-valuenow", "50")
		expect(slider()).toHaveFocus()
	})

	it("commits on blur", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(
			<>
				<Controlled onChange={onChange} />
				<button type="button">Elsewhere</button>
			</>,
		)
		slider().focus()
		await user.keyboard("{Enter}12")
		await user.click(screen.getByRole("button", { name: "Elsewhere" }))
		expect(onChange).toHaveBeenLastCalledWith(12)
		expect(screen.queryByRole("textbox")).toBeNull()
	})

	it("ignores text that is not a number", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled onChange={onChange} />)
		slider().focus()
		await user.keyboard("{Enter}abc{Enter}")
		expect(onChange).not.toHaveBeenCalled()
		expect(slider()).toHaveAttribute("aria-valuenow", "50")
	})

	it("rounds a typed value to the step's precision", async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderWithProviders(<Controlled initial={1} max={2} step={0.1} onChange={onChange} />)
		slider().focus()
		await user.keyboard("{Enter}1.26{Enter}")
		expect(onChange).toHaveBeenLastCalledWith(1.3)
	})

	it("opens on double-click, and Escape restores the value from before the press", () => {
		const onChange = vi.fn()
		const { container } = renderWithProviders(<Controlled onChange={onChange} />)
		const root = container.firstElementChild as HTMLElement
		// The first press of a double-click lands on the track and moves the value.
		fireEvent.pointerDown(root, { timeStamp: 1000 })
		slider().focus()
		fireEvent.keyDown(slider(), { key: "ArrowRight" })
		expect(onChange).toHaveBeenLastCalledWith(51)
		fireEvent.pointerDown(root, { timeStamp: 1100 })
		fireEvent.doubleClick(root)
		const input = screen.getByRole("textbox", { name: "Opacity" })
		expect(input).toHaveValue("51")
		fireEvent.keyDown(input, { key: "Escape" })
		expect(onChange).toHaveBeenLastCalledWith(50)
	})

	it("does not open while disabled", async () => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(<SliderField label="Opacity" value={50} disabled />)
		await user.dblClick(container.firstElementChild as HTMLElement).catch(() => {})
		fireEvent.doubleClick(container.firstElementChild as HTMLElement)
		expect(screen.queryByRole("textbox")).toBeNull()
	})
})

describe("SliderField — readout and form", () => {
	it("shows the step's precision and the unit", () => {
		const { container } = renderWithProviders(<SliderField label="Falloff" value={1} max={2} step={0.1} suffix="x" />)
		expect(container).toHaveTextContent("1.0x")
	})

	it("submits the value under its name, and nothing from the edit input", async () => {
		const user = userEvent.setup()
		const { container } = renderWithProviders(
			<form>
				<Controlled name="opacity" initial={60} />
			</form>,
		)
		const form = container.querySelector("form") as HTMLFormElement
		expect(new FormData(form).get("opacity")).toBe("60")
		slider().focus()
		await user.keyboard("{Enter}12")
		expect([...new FormData(form).keys()]).toEqual(["opacity"])
		expect(new FormData(form).get("opacity")).toBe("60")
		await user.keyboard("{Enter}")
		expect(new FormData(form).get("opacity")).toBe("12")
	})

	it("sits on the rung it is given", () => {
		const { container } = renderWithProviders(
			<>
				<SliderField label="A" value={1} />
				<SliderField label="B" value={1} size="xs" />
			</>,
		)
		const [md, xs] = Array.from(container.children) as HTMLElement[]
		expect(md).toHaveClass("h-(--control-md)", "bg-field")
		expect(xs).toHaveClass("h-(--control-xs)", "bg-panel-field")
		expect(xs).not.toHaveClass("bg-field")
	})
})
