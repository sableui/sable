import { useState } from "react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders, screen } from "../../test/render"
import {
	Combobox,
	ComboboxChips,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxVirtualList,
} from "./combobox"

/**
 * What jsdom can and cannot prove about a windowed list.
 *
 * It CAN prove the part that actually broke consumers: that the rows on screen
 * are a small window of a large list, and that each one carries the flat index
 * and set size Base UI is walking by — the agreement that, when it fails, shows
 * up as clicking one row and getting a different one. It can prove that
 * filtering is still Base UI's, because the component is never handed
 * `filteredItems`, and that Base UI's bypass rule (an untouched field holding
 * the selected label shows the WHOLE list) is honoured without the consumer
 * writing a line of it. That rule is the entire reason this component exists.
 *
 * It CANNOT prove anything about scrolling. jsdom gives every element a
 * clientHeight of 0 and never fires a scroll event, so the window here is always
 * the one the component assumes before it has measured (ASSUMED_VIEWPORT), the
 * reveal-on-open and the reveal-on-highlight are no-ops, and the offsets the
 * component computes are never exercised against a real box. Those need a
 * browser; what is asserted below is the geometry-independent contract.
 */

interface District {
	value: string
	label: string
}

const GROUPS = ["North", "South", "East", "West"].map((region) => ({
	value: region,
	items: Array.from({ length: 500 }, (_, index) => ({
		value: `${region}-${index}`,
		label: `${region} district ${index + 1}`,
	})),
}))

const TOTAL = 2000

function Host({ value }: { value?: District | null }) {
	return (
		<Combobox
			virtualized
			defaultOpen
			items={GROUPS}
			value={value}
			itemToStringLabel={(item: District) => item.label}
		>
			<ComboboxInput />
			<ComboboxContent scroll={false}>
				<ComboboxEmpty>No district matches.</ComboboxEmpty>
				<ComboboxVirtualList itemHeight={32}>
					{(item: District) => item.label}
				</ComboboxVirtualList>
			</ComboboxContent>
		</Combobox>
	)
}

describe("ComboboxVirtualList — windowing", () => {
	it("renders a window, not two thousand rows", () => {
		renderWithProviders(<Host />)
		const options = screen.getAllByRole("option")
		expect(options.length).toBeGreaterThan(0)
		// The exact count is viewport-dependent and jsdom has no viewport; what
		// matters is the order of magnitude — a list that renders everything is
		// the bug this component was built for.
		expect(options.length).toBeLessThan(50)
	})

	it("tells every row how many rows there really are", () => {
		renderWithProviders(<Host />)
		for (const option of screen.getAllByRole("option")) {
			expect(option).toHaveAttribute("aria-setsize", String(TOTAL))
		}
	})

	it("numbers rows by their flat index across groups, unbroken", () => {
		renderWithProviders(<Host />)
		const positions = screen
			.getAllByRole("option")
			.map((option) => Number(option.getAttribute("aria-posinset")))
		// One run of consecutive integers from the top of the list: this is the
		// index Base UI highlights by, and an off-by-one here is the silent
		// wrong-row bug.
		expect(positions[0]).toBe(1)
		for (let at = 1; at < positions.length; at += 1) {
			expect(positions[at]).toBe(positions[at - 1] + 1)
		}
	})

	it("keeps each group's role and label", () => {
		renderWithProviders(<Host />)
		// Only the first group is inside the window, and that is the point: a
		// group with no rendered rows renders no wrapper either.
		expect(screen.getByRole("group", { name: "North" })).toBeInTheDocument()
		expect(screen.queryByRole("group", { name: "West" })).not.toBeInTheDocument()
	})
})

describe("ComboboxVirtualList — filtering stays Base UI's", () => {
	it("narrows the list from the query alone, with no filteredItems from us", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Host />)
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("South district 1")

		const options = screen.getAllByRole("option")
		expect(options.length).toBeGreaterThan(0)
		for (const option of options) {
			expect(option).toHaveTextContent(/^South district 1/)
		}
		// Every row agrees on a set size smaller than the catalogue: the plan was
		// rebuilt from Base UI's own filtered list, not from a copy of its rules.
		const setSize = Number(options[0].getAttribute("aria-setsize"))
		expect(setSize).toBeGreaterThan(0)
		expect(setSize).toBeLessThan(TOTAL)
	})

	it("shows the empty state when nothing matches", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Host />)
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("zzzznomatch")
		expect(screen.queryAllByRole("option")).toHaveLength(0)
		expect(screen.getByText("No district matches.")).toBeInTheDocument()
	})

	it("honours Base UI's bypass rule without the consumer restating it", () => {
		// The field opens holding the selected item's label and the user has not
		// typed. Base UI deliberately shows the whole list rather than the one row
		// that matches — and a consumer who had taken filtering over would render
		// one row while Base UI indexed two thousand. Nothing in this file knows
		// that rule; the set size proves it was applied anyway.
		renderWithProviders(<Host value={GROUPS[0].items[7]} />)
		// Guard against the assertion below passing for the boring reason: the
		// field really is holding the label, so the bypass is in play.
		expect(screen.getByRole("combobox")).toHaveValue("North district 8")
		const options = screen.getAllByRole("option")
		expect(options.length).toBeGreaterThan(0)
		expect(options[0]).toHaveAttribute("aria-setsize", String(TOTAL))
	})
})

const TAGS = ["design", "research", "engineering"]

function MultiHost({ defaultValue }: { defaultValue?: string[] }) {
	return (
		<Combobox multiple items={TAGS} defaultValue={defaultValue}>
			<ComboboxChips placeholder="Add tags" />
			<ComboboxContent>
				<ComboboxEmpty>No matching tags.</ComboboxEmpty>
				<ComboboxList>
					{(item: string) => (
						<ComboboxItem key={item} value={item}>
							{item}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}

// `hidden: true` because Base UI marks everything outside the open popup
// aria-hidden (the input excepted), chips included.
const removeButtons = () =>
	screen.queryAllByRole("button", { name: /^Remove /, hidden: true })

describe("Combobox — multiple selection", () => {
	it("shows one chip per selected item", async () => {
		const user = userEvent.setup()
		renderWithProviders(<MultiHost />)
		await user.click(screen.getByPlaceholderText("Add tags"))
		await user.click(await screen.findByRole("option", { name: "design" }))
		await user.click(await screen.findByRole("option", { name: "research" }))
		expect(removeButtons().map((button) => button.getAttribute("aria-label"))).toEqual([
			"Remove design",
			"Remove research",
		])
	})

	it("deselects an item when its chip's remove button is pressed", async () => {
		const user = userEvent.setup()
		renderWithProviders(<MultiHost defaultValue={["design", "research"]} />)
		await user.click(screen.getByRole("button", { name: "Remove design" }))
		expect(removeButtons().map((button) => button.getAttribute("aria-label"))).toEqual([
			"Remove research",
		])
	})

	it("removes the last chip on Backspace in an empty field", async () => {
		const user = userEvent.setup()
		renderWithProviders(<MultiHost defaultValue={["design", "research"]} />)
		await user.click(screen.getByPlaceholderText("Add tags"))
		await user.keyboard("{Backspace}")
		expect(removeButtons().map((button) => button.getAttribute("aria-label"))).toEqual([
			"Remove design",
		])
	})

	it("draws the remove control to the chip but keeps the ladder's pointer target", () => {
		renderWithProviders(<MultiHost defaultValue={["design"]} />)
		const remove = screen.getByRole("button", { name: "Remove design" })
		// A 28px icon-xs button swelled the chip into a 34px pill.
		expect(remove.className).toContain("size-5")
		expect(remove.className).toContain("before:size-(--control-xs)")
	})

	it("labels object items by their label field", () => {
		renderWithProviders(
			<Combobox multiple items={[{ id: 1, label: "Ada" }]} defaultValue={[{ id: 1, label: "Ada" }]}>
				<ComboboxChips placeholder="People" />
			</Combobox>,
		)
		expect(screen.getByRole("button", { name: "Remove Ada" })).toBeInTheDocument()
	})
})

describe("Combobox — the register its list opens over", () => {
	it("re-anchors density on the portaled list, not just the in-flow input", async () => {
		// The input is a DOM descendant of the Workspace and inherits the CSS
		// ladder; the list is portaled and inherits nothing. Before this, a
		// Combobox in a tool put page-sized rows over a 32px trigger — and a
		// virtualized picker is a workspace surface, so it cost twice.
		renderWithProviders(
			<Density value="compact">
				<Combobox items={["Inter", "Figtree"]}>
					<ComboboxInput placeholder="Font" />
					<ComboboxContent>
						<ComboboxList>
							{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
			</Density>,
		)
		await userEvent.click(screen.getByPlaceholderText("Font"))
		const row = await screen.findByRole("option", { name: "Inter" })
		expect(row.className).toContain("text-ui-md")
		expect(row.closest("[data-density]")).toHaveAttribute("data-density", "compact")
	})

	it("leaves the page register alone by default", async () => {
		renderWithProviders(
			<Combobox items={["Inter"]}>
				<ComboboxInput placeholder="Font" />
				<ComboboxContent>
					<ComboboxList>
						{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>,
		)
		await userEvent.click(screen.getByPlaceholderText("Font"))
		expect((await screen.findByRole("option", { name: "Inter" })).className).toContain("text-body-md")
	})
})

describe("Combobox — server results", () => {
	interface Person {
		id: string
		name: string
	}

	/** The registry's "Async search" recipe, with the server faked by a filter. */
	function AsyncHost() {
		const [query, setQuery] = useState("")
		const results: Person[] = query.startsWith("a")
			? [{ id: "1", name: "Ada Lovelace" }, { id: "2", name: "Grace Hopper" }]
			: []
		return (
			<Combobox
				items={results}
				filter={null}
				itemToStringLabel={(person: Person) => person.name}
				onInputValueChange={setQuery}
			>
				<ComboboxInput placeholder="Search people…" />
				<ComboboxContent>
					<ComboboxEmpty>{query ? "No one matches." : "Type a name to search."}</ComboboxEmpty>
					<ComboboxList>
						{(item: Person) => <ComboboxItem key={item.id} value={item}>{item.name}</ComboboxItem>}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		)
	}

	it("shows what the server returned, without filtering it again", async () => {
		renderWithProviders(<AsyncHost />)
		await userEvent.type(screen.getByPlaceholderText("Search people…"), "ad")
		// "Grace Hopper" does not contain "ad"; Base UI's own filter would drop it.
		expect(await screen.findByRole("option", { name: "Grace Hopper" })).toBeInTheDocument()
		expect(screen.getByRole("option", { name: "Ada Lovelace" })).toBeInTheDocument()
	})

	it("says why the list is empty", async () => {
		renderWithProviders(<AsyncHost />)
		await userEvent.type(screen.getByPlaceholderText("Search people…"), "zz")
		expect(await screen.findByText("No one matches.")).toBeInTheDocument()
	})
})

describe("Combobox — match highlighting", () => {
	// jsdom has no Custom Highlight API; stand in the two shapes the hook uses.
	class FakeHighlight extends Set<Range> {}
	const painted = () =>
		Array.from((globalThis.CSS as unknown as { highlights: Map<string, Set<Range>> }).highlights.get("sable-match") ?? [], (r) =>
			r.toString(),
		)

	function withRegistry(run: () => Promise<void>) {
		return async () => {
			const original = globalThis.CSS
			;(globalThis as { CSS?: unknown }).CSS = { highlights: new Map() }
			;(globalThis as { Highlight?: unknown }).Highlight = FakeHighlight
			try {
				await run()
			} finally {
				;(globalThis as { CSS?: unknown }).CSS = original
				delete (globalThis as { Highlight?: unknown }).Highlight
			}
		}
	}

	function Fruit({ highlightMatches }: { highlightMatches?: boolean }) {
		return (
			<Combobox items={["Apple", "Grape", "Banana"]} highlightMatches={highlightMatches}>
				<ComboboxInput aria-label="Fruit" />
				<ComboboxContent>
					<ComboboxList>
						{(item: string) => (
							<ComboboxItem key={item} value={item}>
								{item}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		)
	}

	it(
		"paints what was typed in the surviving row labels",
		withRegistry(async () => {
			const user = userEvent.setup()
			renderWithProviders(<Fruit />)
			await user.type(screen.getByRole("combobox", { name: "Fruit" }), "ap")
			expect(painted()).toEqual(["Ap", "ap"])
		}),
	)

	it(
		"paints nothing once a pick fills the field",
		withRegistry(async () => {
			const user = userEvent.setup()
			renderWithProviders(<Fruit />)
			const input = screen.getByRole("combobox", { name: "Fruit" })
			await user.type(input, "ban")
			await user.click(screen.getByRole("option", { name: "Banana" }))
			await user.click(input)
			expect(painted()).toEqual([])
		}),
	)

	it(
		"stays off with highlightMatches={false}",
		withRegistry(async () => {
			const user = userEvent.setup()
			renderWithProviders(<Fruit highlightMatches={false} />)
			await user.type(screen.getByRole("combobox", { name: "Fruit" }), "ap")
			expect(painted()).toEqual([])
		}),
	)
})
