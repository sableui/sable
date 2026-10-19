import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SearchInput } from "./search-input"

describe("SearchInput", () => {
	it("puts className on the field wrapper so the clear button moves with a width cap", () => {
		const { container, getByRole } = render(
			<SearchInput value="q" onValueChange={() => {}} className="max-w-80" inputClassName="tracking-wide" />,
		)
		const wrapper = container.firstElementChild as HTMLElement
		expect(wrapper).toHaveClass("max-w-80")
		const input = getByRole("searchbox")
		expect(input).not.toHaveClass("max-w-80")
		expect(input).toHaveClass("tracking-wide")
		// The clear button lives inside the same wrapper the cap applies to.
		expect(wrapper).toContainElement(getByRole("button", { name: "Clear search" }))
	})

	it("shows and clears an uncontrolled defaultValue", () => {
		const onValueChange = vi.fn()
		const { getByRole, queryByRole } = render(
			<SearchInput defaultValue="roadmap" onValueChange={onValueChange} />,
		)
		const input = getByRole("searchbox") as HTMLInputElement
		expect(input.value).toBe("roadmap")
		fireEvent.click(getByRole("button", { name: "Clear search" }))
		expect(input.value).toBe("")
		expect(onValueChange).toHaveBeenCalledWith("")
		expect(queryByRole("button", { name: "Clear search" })).toBeNull()
	})

	it("hides the clear button while disabled", () => {
		const { queryByRole } = render(
			<SearchInput value="q" onValueChange={() => {}} disabled />,
		)
		expect(queryByRole("button", { name: "Clear search" })).toBeNull()
	})
})

describe("SearchInput clear button motion", () => {
	it("mounts the clear button inside a motion-appear wrapper, keeping the Button's own response", () => {
		const { getByRole } = render(<SearchInput value="q" onValueChange={() => {}} />)
		const button = getByRole("button", { name: "Clear search" })
		expect(button.parentElement).toHaveClass("motion-appear")
		expect(button).not.toHaveClass("motion-appear")
	})
})

/** Every height class on an element: `h-*` and `size-*`, the two ways a box gets one. */
function heightClasses(element: Element) {
	return [...element.classList].filter((name) => /^(h|size)-/.test(name))
}

describe("SearchInput size ladder", () => {
	it.each([
		["md", "h-(--control-md)"],
		["sm", "h-(--control-sm)"],
		["xs", "h-(--control-xs)"],
	] as const)("%s reads the control ladder for its height, never a literal", (size, ladder) => {
		const { getByRole } = render(<SearchInput size={size} value="q" onValueChange={() => {}} />)
		const input = getByRole("searchbox")
		expect(heightClasses(input)).toEqual([ladder])
	})

	it("defaults to md, the form field", () => {
		const { getByRole } = render(<SearchInput />)
		expect(getByRole("searchbox")).toHaveClass("h-(--control-md)")
	})

	it("sm lands on the rung a toolbar of Pill lg and Button sm stands on", () => {
		const { getByRole } = render(<SearchInput size="sm" />)
		const input = getByRole("searchbox")
		// The outlined page field, not the tool-panel inset.
		expect(input).toHaveClass("h-(--control-sm)", "border-field-border", "bg-field")
		expect(input).not.toHaveClass("bg-panel-field")
	})

	it("xs wears Input xs's inset tool-panel surface", () => {
		const { getByRole } = render(<SearchInput size="xs" />)
		expect(getByRole("searchbox")).toHaveClass("bg-panel-field", "border-transparent")
	})

	it.each([
		["sm", "size-[calc(var(--control-sm)-var(--spacing)*2)]"],
		["xs", "size-[calc(var(--control-xs)-var(--spacing))]"],
	] as const)("%s scales the clear button from the ladder and keeps a full pointer target", (size, box) => {
		const { getByRole } = render(<SearchInput size={size} value="q" onValueChange={() => {}} />)
		const clear = getByRole("button", { name: "Clear search" })
		// One height source: the ladder-derived box replaces Button's own icon-xs h/w.
		expect(heightClasses(clear)).toEqual([box])
		expect(clear).toHaveClass("before:size-(--control-xs)")
	})

	it("md keeps the icon-xs clear button", () => {
		const { getByRole } = render(<SearchInput value="q" onValueChange={() => {}} />)
		expect(heightClasses(getByRole("button", { name: "Clear search" }))).toEqual(["h-(--control-xs)"])
	})

	it("centres the magnifier and the clear button vertically at every rung", () => {
		for (const size of ["md", "sm", "xs"] as const) {
			const { container, getByRole, unmount } = render(<SearchInput size={size} value="q" onValueChange={() => {}} />)
			const wrapper = container.firstElementChild as HTMLElement
			// Absolutely placed children of an items-center flex row centre on the
			// cross axis; a top/bottom offset on either would break that.
			expect(wrapper).toHaveClass("inline-flex", "items-center")
			const clearSlot = getByRole("button", { name: "Clear search" }).parentElement as HTMLElement
			const glyph = wrapper.firstElementChild as HTMLElement
			for (const part of [clearSlot, glyph]) {
				expect([...part.classList].some((name) => /^(top|bottom|inset)-/.test(name))).toBe(false)
			}
			unmount()
		}
	})
})
