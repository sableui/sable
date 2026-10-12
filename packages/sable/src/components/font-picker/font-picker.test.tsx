import { fireEvent, render } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { FontPicker, type FontPickerFont } from "./font-picker"

const FONTS: FontPickerFont[] = [
	{ family: "Inter", note: "Neutral, dense UI" },
	{ family: "Fraunces", note: "Soft, wonky serif", stack: '"Fraunces", serif' },
	{ family: "Geist", note: "Crisp, technical" },
]

function Controlled(props: Partial<Parameters<typeof FontPicker>[0]>) {
	const [value, setValue] = useState("theme")
	return (
		<FontPicker
			label="Body"
			listLabel="Body font"
			value={value}
			onValueChange={setValue}
			fonts={FONTS}
			options={[{ value: "theme", label: "Preset (Figtree)", valueLabel: "Figtree" }]}
			{...props}
		/>
	)
}

describe("FontPicker", () => {
	it("names the current choice: an option by its valueLabel, a family in its own face", () => {
		const { getByRole } = render(<Controlled defaultOpen />)
		const trigger = getByRole("button", { name: /Body/ })
		expect(trigger).toHaveTextContent("BodyFigtree")
		fireEvent.click(getByRole("option", { name: /Fraunces/ }))
		expect(trigger).toHaveTextContent("BodyFraunces")
		expect(trigger.querySelector("[style]")).toHaveStyle({ fontFamily: '"Fraunces", serif' })
	})

	it("draws each family in its own face, options in the app's", () => {
		const { getByRole } = render(<Controlled defaultOpen />)
		expect(getByRole("option", { name: /Inter/ }).querySelector("[style]")).toHaveStyle({ fontFamily: '"Inter"' })
		expect(getByRole("option", { name: /Preset/ }).querySelector("[style]")).toBeNull()
	})

	it("is searchable by default, by family and by note", () => {
		const { getByRole, getAllByRole, getByText } = render(<Controlled defaultOpen searchLabel="Search body fonts" />)
		const search = getByRole("searchbox", { name: "Search body fonts" })
		expect(search).toHaveAttribute("placeholder", "Search 3 fonts")
		fireEvent.change(search, { target: { value: "wonky" } })
		expect(getAllByRole("option").map((option) => option.textContent)).toEqual(["FrauncesSoft, wonky serif"])
		fireEvent.change(search, { target: { value: "zzz" } })
		expect(getByText(/No fonts match/)).toBeInTheDocument()
	})

	it("drops the search field for a short curated list", () => {
		const { queryByRole, getAllByRole } = render(<Controlled defaultOpen searchable={false} />)
		expect(queryByRole("searchbox")).toBeNull()
		expect(getAllByRole("option")).toHaveLength(4)
	})

	it("asks the app to load faces: previews when the list opens, the real face when chosen", () => {
		const loadFont = vi.fn()
		const { getByRole } = render(<Controlled loadFont={loadFont} />)
		expect(loadFont).not.toHaveBeenCalled()
		fireEvent.click(getByRole("button", { name: /Body/ }))
		expect(loadFont.mock.calls.filter(([, purpose]) => purpose === "preview").map(([font]) => font.family)).toEqual(["Inter", "Fraunces", "Geist"])
		fireEvent.click(getByRole("option", { name: /Geist/ }))
		expect(loadFont).toHaveBeenCalledWith(FONTS[2], "use")
	})

	it("walks the list without applying or loading a face; Enter picks, loads and closes", () => {
		const loadFont = vi.fn()
		const onValueChange = vi.fn()
		const { getByRole } = render(<Controlled searchable={false} loadFont={loadFont} onValueChange={onValueChange} />)
		const trigger = getByRole("button", { name: /Body/ })
		fireEvent.click(trigger)
		const preset = getByRole("option", { name: /Preset/ })
		preset.focus()
		fireEvent.keyDown(preset, { key: "ArrowDown" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: /Fraunces/ }))
		expect(onValueChange).not.toHaveBeenCalled()
		expect(loadFont.mock.calls.filter(([, purpose]) => purpose === "use")).toEqual([])
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" })
		expect(onValueChange).toHaveBeenCalledWith("Fraunces")
		expect(trigger).toHaveAttribute("aria-expanded", "false")
	})

	it("loads the real face only for the picked family", () => {
		const loadFont = vi.fn()
		const { getByRole } = render(<Controlled loadFont={loadFont} defaultOpen />)
		const preset = getByRole("option", { name: /Preset/ })
		preset.focus()
		fireEvent.keyDown(preset, { key: "End" })
		expect(loadFont.mock.calls.filter(([, purpose]) => purpose === "use")).toEqual([])
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" })
		expect(loadFont.mock.calls.filter(([, purpose]) => purpose === "use")).toEqual([[FONTS[2], "use"]])
	})

	it("closes on Escape without changing the family", () => {
		const { getByRole } = render(<Controlled searchable={false} defaultOpen />)
		const trigger = getByRole("button", { name: /Body/ })
		const preset = getByRole("option", { name: /Preset/ })
		preset.focus()
		fireEvent.keyDown(preset, { key: "ArrowDown" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" })
		expect(trigger).toHaveAttribute("aria-expanded", "false")
		expect(trigger).toHaveTextContent("BodyFigtree")
	})
})
