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
