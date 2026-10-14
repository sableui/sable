import { act, fireEvent, render, waitFor } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import {
	DisclosurePicker,
	DisclosurePickerEmpty,
	DisclosurePickerList,
	DisclosurePickerOption,
	DisclosurePickerPanel,
	DisclosurePickerTrigger,
	useDisclosurePicker,
} from "./disclosure-picker"

const SIZES = ["Small", "Medium", "Large", "Larger", "Maximum"]

function Picker({
	searchable = false,
	size,
	onValueChange,
	defaultOpen,
	disabled = [],
}: {
	searchable?: boolean
	size?: "md" | "xs"
	onValueChange?: (value: string) => void
	defaultOpen?: boolean
	disabled?: string[]
}) {
	const [value, setValue] = useState("Medium")
	const [query, setQuery] = useState("")
	const shown = SIZES.filter((name) => name.toLowerCase().includes(query.toLowerCase()))
	return (
		<DisclosurePicker size={size} defaultOpen={defaultOpen}>
			<DisclosurePickerTrigger label="Size">{value}</DisclosurePickerTrigger>
			<DisclosurePickerPanel search={searchable ? { value: query, onValueChange: setQuery, placeholder: "Search sizes" } : undefined}>
				{shown.length > 0 ? (
					<DisclosurePickerList
						aria-label="Size"
						value={value}
						onValueChange={(next) => {
							setValue(next)
							onValueChange?.(next)
						}}
					>
						{shown.map((name) => (
							<DisclosurePickerOption key={name} value={name} note={name === "Large" ? "L" : undefined} disabled={disabled.includes(name)}>
								{name}
							</DisclosurePickerOption>
						))}
					</DisclosurePickerList>
				) : (
					<DisclosurePickerEmpty>No sizes match.</DisclosurePickerEmpty>
				)}
			</DisclosurePickerPanel>
		</DisclosurePicker>
	)
}

const trigger = (getByRole: (role: string, options?: object) => HTMLElement) => getByRole("button", { name: /Size/ })
const nextFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))

describe("DisclosurePicker", () => {
	it("is a disclosure: a button with aria-expanded that controls the panel", () => {
		const { getByRole, queryByRole } = render(<Picker />)
		const button = trigger(getByRole)
		expect(button).toHaveAttribute("aria-expanded", "false")
		expect(queryByRole("listbox")).toBeNull()
		fireEvent.click(button)
		expect(button).toHaveAttribute("aria-expanded", "true")
		const panelId = button.getAttribute("aria-controls")
		expect(panelId).toBeTruthy()
		expect(document.getElementById(panelId as string)).toContainElement(getByRole("listbox", { name: "Size" }))
	})

	it("is a listbox: options marked aria-selected for the committed value, one tab stop", () => {
		const { getByRole, getAllByRole } = render(<Picker defaultOpen />)
		expect(getByRole("listbox", { name: "Size" })).toBeInTheDocument()
		const options = getAllByRole("option")
		expect(options.map((option) => option.getAttribute("aria-selected"))).toEqual(["false", "true", "false", "false", "false"])
		// Roving tabindex: Tab enters on the choice and leaves in one step.
		expect(options.map((option) => option.tabIndex)).toEqual([-1, 0, -1, -1, -1])
	})

	it("renders no search field unless opted in — no empty row, no gap", () => {
		const { getByRole, queryByRole } = render(<Picker defaultOpen />)
		expect(queryByRole("searchbox")).toBeNull()
		// The list is the panel's only child, so the grid gap never opens.
		const panel = getByRole("listbox").parentElement as HTMLElement
		expect(panel.children).toHaveLength(1)
	})

	it("renders a search field when opted in, and filters through the consumer", () => {
		const { getByRole, getAllByRole, getByText } = render(<Picker searchable defaultOpen />)
		const search = getByRole("searchbox", { name: "Search sizes" })
		fireEvent.change(search, { target: { value: "larg" } })
		expect(getAllByRole("option").map((option) => option.textContent)).toEqual(["LargeL", "Larger"])
		fireEvent.change(search, { target: { value: "zzz" } })
		expect(getByText("No sizes match.")).toBeInTheDocument()
	})

	it("moves focus with the arrow keys and applies nothing", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} defaultOpen />)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: "LargeL" }))
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Larger" }))
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowUp" })
		expect(document.activeElement).toBe(getByRole("option", { name: "LargeL" }))
		expect(onValueChange).not.toHaveBeenCalled()
		expect(getByRole("option", { name: "Medium" })).toHaveAttribute("aria-selected", "true")
		expect(trigger(getByRole)).toHaveAttribute("aria-expanded", "true")
		// The focused option becomes the tab stop.
		expect(getByRole("option", { name: "LargeL" }).tabIndex).toBe(0)
		expect(getByRole("option", { name: "Medium" }).tabIndex).toBe(-1)
	})

	it("stops at the ends rather than wrapping", () => {
		const { getByRole } = render(<Picker defaultOpen />)
		const maximum = getByRole("option", { name: "Maximum" })
		maximum.focus()
		fireEvent.keyDown(maximum, { key: "ArrowDown" })
		expect(document.activeElement).toBe(maximum)
		const small = getByRole("option", { name: "Small" })
		small.focus()
		fireEvent.keyDown(small, { key: "ArrowUp" })
		expect(document.activeElement).toBe(small)
	})

	it("goes to the first and last options on Home and End", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} defaultOpen />)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "End" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Maximum" }))
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Home" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Small" }))
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it("jumps by type-ahead, cycles a repeated letter, and applies nothing", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} defaultOpen />)
		const small = getByRole("option", { name: "Small" })
		small.focus()
		fireEvent.keyDown(small, { key: "m" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Medium" }))
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "m" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Maximum" }))
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it("matches a typed prefix across keys, then starts over after a pause", () => {
		vi.useFakeTimers()
		try {
			const { getByRole } = render(<Picker defaultOpen />)
			const small = getByRole("option", { name: "Small" })
			small.focus()
			for (const key of "larger") fireEvent.keyDown(document.activeElement as HTMLElement, { key })
			expect(document.activeElement).toBe(getByRole("option", { name: "Larger" }))
			vi.advanceTimersByTime(600)
			fireEvent.keyDown(document.activeElement as HTMLElement, { key: "s" })
			expect(document.activeElement).toBe(getByRole("option", { name: "Small" }))
		} finally {
			vi.useRealTimers()
		}
	})

	it("skips disabled options and will not pick one", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} disabled={["Large"]} defaultOpen />)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Larger" }))
		const large = getByRole("option", { name: "LargeL" })
		expect(large).toHaveAttribute("aria-disabled", "true")
		fireEvent.click(large)
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it("picks on click, closes, and returns focus to the row", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} />)
		const button = trigger(getByRole)
		fireEvent.click(button)
		const large = getByRole("option", { name: "LargeL" })
		large.focus()
		fireEvent.click(large)
		expect(onValueChange).toHaveBeenCalledTimes(1)
		expect(onValueChange).toHaveBeenCalledWith("Large")
		expect(button).toHaveAttribute("aria-expanded", "false")
		expect(button).toHaveTextContent("Large")
		expect(document.activeElement).toBe(button)
	})

	it("picks the focused option on Enter, after the arrows moved to it", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} />)
		const button = trigger(getByRole)
		fireEvent.click(button)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "ArrowDown" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowDown" })
		expect(onValueChange).not.toHaveBeenCalled()
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" })
		expect(onValueChange).toHaveBeenCalledTimes(1)
		expect(onValueChange).toHaveBeenCalledWith("Larger")
		expect(button).toHaveAttribute("aria-expanded", "false")
		expect(button).toHaveTextContent("Larger")
		expect(document.activeElement).toBe(button)
	})

	it("picks on Space", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} defaultOpen />)
		const small = getByRole("option", { name: "Small" })
		small.focus()
		fireEvent.keyDown(small, { key: " " })
		expect(onValueChange).toHaveBeenCalledWith("Small")
		expect(trigger(getByRole)).toHaveAttribute("aria-expanded", "false")
	})

	it("closes without a call when the pick is the current value", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} defaultOpen />)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "Enter" })
		expect(onValueChange).not.toHaveBeenCalled()
		expect(trigger(getByRole)).toHaveAttribute("aria-expanded", "false")
	})

	it("closes on Escape without changing the value, wherever focus has moved to", () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker onValueChange={onValueChange} />)
		const button = trigger(getByRole)
		fireEvent.click(button)
		const medium = getByRole("option", { name: "Medium" })
		medium.focus()
		fireEvent.keyDown(medium, { key: "ArrowDown" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" })
		expect(onValueChange).not.toHaveBeenCalled()
		expect(button).toHaveAttribute("aria-expanded", "false")
		expect(button).toHaveTextContent("Medium")
		expect(document.activeElement).toBe(button)
	})

	it("moves keyboard focus to the chosen option when there is no search field", async () => {
		const { getByRole } = render(<Picker />)
		const button = trigger(getByRole)
		button.focus()
		fireEvent.keyDown(button, { key: "ArrowDown" })
		expect(button).toHaveAttribute("aria-expanded", "true")
		await waitFor(() => expect(document.activeElement).toBe(getByRole("option", { name: "Medium" })))
	})

	it("moves keyboard focus to the search field when there is one; ArrowDown enters the list, ArrowUp leaves it", async () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker searchable onValueChange={onValueChange} />)
		const button = trigger(getByRole)
		button.focus()
		fireEvent.keyDown(button, { key: "Enter" })
		fireEvent.click(button)
		await waitFor(() => expect(document.activeElement).toBe(getByRole("searchbox")))
		// ArrowDown from the field steps into the list, onto the chosen option.
		fireEvent.keyDown(getByRole("searchbox"), { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: "Medium" }))
		// From the first option, ArrowUp goes back to the field.
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Home" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowUp" })
		expect(document.activeElement).toBe(getByRole("searchbox"))
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it("filters, steps from the field into the matches and picks one with Enter", async () => {
		const onValueChange = vi.fn()
		const { getByRole } = render(<Picker searchable onValueChange={onValueChange} defaultOpen />)
		const search = getByRole("searchbox") as HTMLInputElement
		search.focus()
		fireEvent.change(search, { target: { value: "larg" } })
		// The chosen option is filtered out: the field steps onto the first match.
		fireEvent.keyDown(search, { key: "ArrowDown" })
		expect(document.activeElement).toBe(getByRole("option", { name: "LargeL" }))
		expect(getByRole("option", { name: "LargeL" }).tabIndex).toBe(0)
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "ArrowDown" })
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" })
		expect(onValueChange).toHaveBeenCalledWith("Larger")
	})

	it("does not steal focus when opened by its parent", async () => {
		const { getByRole } = render(<Picker defaultOpen />)
		await nextFrame()
		expect(getByRole("listbox")).not.toContainElement(document.activeElement as HTMLElement)
	})

	it("clears a query on the first Escape, closes on the second, and forgets the query", () => {
		const { getByRole } = render(<Picker searchable />)
		const button = trigger(getByRole)
		fireEvent.click(button)
		const search = getByRole("searchbox") as HTMLInputElement
		search.focus()
		fireEvent.change(search, { target: { value: "sm" } })
		fireEvent.keyDown(search, { key: "Escape" })
		expect(search.value).toBe("")
		expect(button).toHaveAttribute("aria-expanded", "true")
		fireEvent.change(search, { target: { value: "sm" } })
		fireEvent.keyDown(getByRole("option", { name: "Small" }), { key: "Escape" })
		expect(button).toHaveAttribute("aria-expanded", "false")
		expect(document.activeElement).toBe(button)
		fireEvent.click(button)
		expect((getByRole("searchbox") as HTMLInputElement).value).toBe("")
	})

	it("sits on the property-grid rung at size xs", () => {
		const { getByRole } = render(<Picker size="xs" />)
		const button = trigger(getByRole)
		expect(button).toHaveClass("h-(--control-xs)", "bg-panel-field")
		expect(button).not.toHaveClass("sable-well")
	})

	it("shows an option's media before its name, and type-ahead reads the name", () => {
		const { getByRole } = render(
			<DisclosurePicker defaultOpen>
				<DisclosurePickerTrigger>Theme</DisclosurePickerTrigger>
				<DisclosurePickerPanel>
					<DisclosurePickerList aria-label="Theme" value="sable" onValueChange={() => {}}>
						<DisclosurePickerOption value="sable" media={<span data-testid="tile">Aa</span>}>
							Sable
						</DisclosurePickerOption>
						<DisclosurePickerOption value="poppy" media={<span>Aa</span>}>
							Poppy
						</DisclosurePickerOption>
					</DisclosurePickerList>
				</DisclosurePickerPanel>
			</DisclosurePicker>,
		)
		const sable = getByRole("option", { name: /Sable/ })
		expect(sable.firstElementChild?.firstElementChild).toContainElement(document.querySelector('[data-testid="tile"]') as HTMLElement)
		sable.focus()
		// Read whole, the row would be "AaPoppy" and "p" would miss it.
		fireEvent.keyDown(sable, { key: "p" })
		expect(document.activeElement).toBe(getByRole("option", { name: /Poppy/ }))
	})

	it("removes an option from its glyph or with Delete, without picking it, and keeps focus in the list", () => {
		function Removable({ onValueChange }: { onValueChange: (value: string) => void }) {
			const [items, setItems] = useState(["Sable", "Kraken", "Ember"])
			return (
				<DisclosurePicker defaultOpen>
					<DisclosurePickerTrigger>Preset</DisclosurePickerTrigger>
					<DisclosurePickerPanel>
						<DisclosurePickerList aria-label="Preset" value="Sable" onValueChange={onValueChange}>
							{items.map((name) => (
								<DisclosurePickerOption
									key={name}
									value={name}
									removeLabel={`Remove ${name}`}
									onRemove={name === "Sable" ? undefined : () => setItems((all) => all.filter((item) => item !== name))}
								>
									{name}
								</DisclosurePickerOption>
							))}
						</DisclosurePickerList>
					</DisclosurePickerPanel>
				</DisclosurePicker>
			)
		}
		const onValueChange = vi.fn()
		const { getByRole, queryByRole, getByTitle, queryByTitle } = render(<Removable onValueChange={onValueChange} />)
		// Only removable options announce the shortcut and draw the glyph.
		expect(getByRole("option", { name: /Sable/ })).not.toHaveAttribute("aria-keyshortcuts")
		expect(queryByTitle("Remove Sable")).toBeNull()
		expect(getByRole("option", { name: "Kraken" })).toHaveAttribute("aria-keyshortcuts", "Delete")

		fireEvent.click(getByTitle("Remove Ember"))
		expect(queryByRole("option", { name: "Ember" })).toBeNull()
		expect(onValueChange).not.toHaveBeenCalled()

		const kraken = getByRole("option", { name: "Kraken" })
		kraken.focus()
		fireEvent.keyDown(kraken, { key: "Delete" })
		expect(queryByRole("option", { name: "Kraken" })).toBeNull()
		expect(onValueChange).not.toHaveBeenCalled()
		expect(document.activeElement).toBe(getByRole("option", { name: /Sable/ }))
		expect(getByRole("button", { name: "Preset" })).toHaveAttribute("aria-expanded", "true")
	})

	it("lets a list it does not own close the row", () => {
		function Foreign() {
			const { close } = useDisclosurePicker()
			return (
				<button type="button" onClick={close}>
					Pick
				</button>
			)
		}
		const { getByRole } = render(
			<DisclosurePicker defaultOpen>
				<DisclosurePickerTrigger>Value</DisclosurePickerTrigger>
				<DisclosurePickerPanel>
					<Foreign />
				</DisclosurePickerPanel>
			</DisclosurePicker>,
		)
		fireEvent.click(getByRole("button", { name: "Pick" }))
		expect(getByRole("button", { name: "Value" })).toHaveAttribute("aria-expanded", "false")
	})
})
