import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders, screen, within } from "../../test/render"
import type { CommandFilter, CommandItem } from "./command-menu"
import {
	CommandMenu,
	CommandMenuGroup,
	CommandMenuItem,
	CommandMenuPanel,
} from "./command-menu"

// Stateful host so Esc/select actually close the palette, like real usage.
function DataDrivenHost({
	onSelect = () => {},
}: {
	onSelect?: (label: string) => void
}) {
	const [open, setOpen] = useState(true)
	return (
		<CommandMenu
			open={open}
			onOpenChange={setOpen}
			items={[
				{
					group: "Navigation",
					label: "Go to feed",
					onSelect: () => onSelect("Go to feed"),
				},
				{
					group: "Navigation",
					label: "Go to profile",
					onSelect: () => onSelect("Go to profile"),
				},
				{
					group: "Actions",
					label: "New post",
					onSelect: () => onSelect("New post"),
				},
			]}
		/>
	)
}

function DeclarativeHost({
	onSelect = () => {},
}: {
	onSelect?: (label: string) => void
}) {
	const [open, setOpen] = useState(true)
	return (
		<CommandMenu open={open} onOpenChange={setOpen}>
			<CommandMenuGroup label="Navigation">
				<CommandMenuItem onSelect={() => onSelect("Go to feed")}>
					Go to feed
				</CommandMenuItem>
				<CommandMenuItem onSelect={() => onSelect("Go to profile")}>
					Go to profile
				</CommandMenuItem>
			</CommandMenuGroup>
			<CommandMenuGroup label="Actions">
				<CommandMenuItem onSelect={() => onSelect("New post")}>
					New post
				</CommandMenuItem>
			</CommandMenuGroup>
		</CommandMenu>
	)
}

describe("CommandMenu — ARIA combobox contract", () => {
	it("exposes a combobox that owns the listbox of options", () => {
		renderWithProviders(<DataDrivenHost />)
		const combobox = screen.getByRole("combobox")
		const listbox = screen.getByRole("listbox")
		expect(combobox).toHaveAttribute("aria-expanded", "true")
		expect(combobox).toHaveAttribute("aria-autocomplete", "list")
		expect(combobox).toHaveAttribute("aria-controls", listbox.id)
		expect(within(listbox).getAllByRole("option")).toHaveLength(3)
	})

	it("gives the dialog an accessible name and description", () => {
		renderWithProviders(<DataDrivenHost />)
		expect(
			screen.getByRole("dialog", { name: "Command menu" }),
		).toBeInTheDocument()
	})

	it("groups options under labelled role=group regions", () => {
		renderWithProviders(<DataDrivenHost />)
		// Each group is labelled by its heading text via aria-labelledby.
		expect(screen.getByRole("group", { name: "Navigation" })).toBeInTheDocument()
		expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument()
	})
})

describe("CommandMenu — keyboard navigation", () => {
	it("seeds the active option to the first row on open", () => {
		renderWithProviders(<DataDrivenHost />)
		const combobox = screen.getByRole("combobox")
		const options = screen.getAllByRole("option")
		expect(options[0]).toHaveAttribute("aria-selected", "true")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)
	})

	it("moves the active descendant with ArrowDown/ArrowUp and wraps", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const combobox = screen.getByRole("combobox")
		const options = screen.getAllByRole("option")
		await user.click(combobox)

		await user.keyboard("{ArrowDown}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[1].id)
		expect(options[1]).toHaveAttribute("aria-selected", "true")

		await user.keyboard("{ArrowDown}{ArrowDown}")
		// wrapped past the last (index 2) back to the first
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)

		await user.keyboard("{ArrowUp}")
		// wrapped before the first to the last
		expect(combobox).toHaveAttribute("aria-activedescendant", options[2].id)

		await user.keyboard("{Home}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)
		await user.keyboard("{End}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[2].id)
	})

	it("clamps a page jump instead of wrapping it", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const combobox = screen.getByRole("combobox")
		const options = screen.getAllByRole("option")
		await user.click(combobox)

		// Ten rows past the end of a three-row list is the end, not the start.
		await user.keyboard("{PageDown}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[2].id)
		await user.keyboard("{PageUp}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)
	})

	it("activates the highlighted option with Enter and closes", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(<DataDrivenHost onSelect={onSelect} />)
		const combobox = screen.getByRole("combobox")
		await user.click(combobox)
		await user.keyboard("{ArrowDown}") // -> "Go to profile"
		await user.keyboard("{Enter}")
		expect(onSelect).toHaveBeenCalledExactlyOnceWith("Go to profile")
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
	})

	it("never puts options in the tab order (focus stays on the combobox)", () => {
		renderWithProviders(<DataDrivenHost />)
		for (const option of screen.getAllByRole("option")) {
			expect(option).not.toHaveAttribute("tabindex")
		}
	})
})

describe("CommandMenu — filtering", () => {
	it("filters options by query and re-seeds the highlight to the first match", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const combobox = screen.getByRole("combobox")
		await user.click(combobox)
		await user.keyboard("profile")
		const options = screen.getAllByRole("option")
		expect(options).toHaveLength(1)
		expect(options[0]).toHaveTextContent("Go to profile")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)
	})

	it("shows the empty message when nothing matches", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("zzzznomatch")
		expect(screen.queryAllByRole("option")).toHaveLength(0)
		expect(screen.getByText("No results found.")).toBeInTheDocument()
	})
})

describe("CommandMenu — declarative children", () => {
	it("self-filters and stays keyboard-activatable", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(<DeclarativeHost onSelect={onSelect} />)
		const combobox = screen.getByRole("combobox")
		await user.click(combobox)
		await user.keyboard("post")
		const options = screen.getAllByRole("option")
		expect(options).toHaveLength(1)
		expect(options[0]).toHaveTextContent("New post")
		await user.keyboard("{Enter}")
		expect(onSelect).toHaveBeenCalledExactlyOnceWith("New post")
	})
})

describe("CommandMenu — consumer-owned filtering", () => {
	// The finding this answers: the palette used to filter with `includes()` and
	// expose no seam, so a caller could not rank, could not order groups by their
	// best row, and could not list a row it wanted greyed rather than gone.
	const RANKED: CommandItem[] = [
		{ group: "Effects", label: "Bloom", onSelect: () => {} },
		{ group: "Effects", label: "Blur", onSelect: () => {} },
		{ group: "Layers", label: "Align left", onSelect: () => {} },
	]

	function RankedHost({
		filter,
		onQuery = () => {},
	}: {
		filter?: CommandFilter
		onQuery?: (query: string) => void
	}) {
		const [open, setOpen] = useState(true)
		const [query, setQuery] = useState("")
		return (
			<CommandMenu
				open={open}
				onOpenChange={setOpen}
				query={query}
				onQueryChange={(next) => {
					setQuery(next)
					onQuery(next)
				}}
				filter={filter}
				items={RANKED}
			/>
		)
	}

	it("drives the input from the controlled query and reports every change", async () => {
		const user = userEvent.setup()
		const onQuery = vi.fn()
		renderWithProviders(<RankedHost onQuery={onQuery} />)
		const combobox = screen.getByRole("combobox")
		await user.click(combobox)
		await user.keyboard("bl")
		expect(combobox).toHaveValue("bl")
		expect(onQuery).toHaveBeenLastCalledWith("bl")
	})

	it("renders items verbatim when filter is null", async () => {
		const user = userEvent.setup()
		renderWithProviders(<RankedHost filter={null} />)
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("zzzznomatch")
		// The built-in match would have emptied this. Nothing may filter but us.
		expect(screen.getAllByRole("option")).toHaveLength(3)
	})

	it("keeps a caller's order, and orders groups by their first surviving row", async () => {
		const user = userEvent.setup()
		// Ranks the subsequence match last, which `includes()` cannot express at
		// all — it would have dropped "Align left" outright.
		const rank: CommandFilter = (items, query) => {
			const q = query.trim().toLowerCase()
			if (!q) return items
			const score = (label: string) =>
				label.toLowerCase().startsWith(q) ? 0 : 1
			return [...items].sort((a, b) => score(a.label) - score(b.label))
		}
		renderWithProviders(<RankedHost filter={rank} />)
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("align")

		const groups = screen.getAllByRole("group")
		// "Layers" holds the only exact prefix match, so it is lifted above
		// "Effects" — which the internal Map's insertion order could not do while
		// the component owned the filter.
		expect(groups[0]).toHaveAccessibleName("Layers")
		expect(groups[1]).toHaveAccessibleName("Effects")
		expect(screen.getAllByRole("option")[0]).toHaveTextContent("Align left")
	})
})

describe("CommandMenu — disabled rows", () => {
	function DisabledHost({ onSelect = () => {} }: { onSelect?: () => void }) {
		const [open, setOpen] = useState(true)
		return (
			<CommandMenu
				open={open}
				onOpenChange={setOpen}
				items={[
					{
						group: "Layers",
						label: "Align left",
						disabled: true,
						hint: "Select another layer to align to",
						onSelect,
					},
					{ group: "Layers", label: "Bring to front", onSelect },
				]}
			/>
		)
	}

	it("lists an unavailable row, with its reason, rather than hiding it", () => {
		renderWithProviders(<DisabledHost />)
		const options = screen.getAllByRole("option")
		expect(options).toHaveLength(2)
		expect(options[0]).toHaveAttribute("aria-disabled", "true")
		expect(options[0]).toHaveTextContent("Select another layer to align to")
	})

	it("seeds the highlight past a disabled row", () => {
		renderWithProviders(<DisabledHost />)
		const options = screen.getAllByRole("option")
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"aria-activedescendant",
			options[1].id,
		)
	})

	it("stays reachable by arrow key but inert to Enter", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(<DisabledHost onSelect={onSelect} />)
		const combobox = screen.getByRole("combobox")
		const options = screen.getAllByRole("option")
		await user.click(combobox)
		// Reachable, so its reason can be read; the row is not skipped in the walk.
		await user.keyboard("{ArrowUp}")
		expect(combobox).toHaveAttribute("aria-activedescendant", options[0].id)
		await user.keyboard("{Enter}")
		expect(onSelect).not.toHaveBeenCalled()
		expect(screen.getByRole("listbox")).toBeInTheDocument()
	})

	it("is inert to a click too", async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		renderWithProviders(<DisabledHost onSelect={onSelect} />)
		await user.click(screen.getAllByRole("option")[0])
		expect(onSelect).not.toHaveBeenCalled()
	})
})

describe("CommandMenu — item identity", () => {
	// The finding this answers: `filter` is handed CommandItem[] and must return
	// CommandItem[], so without an identity field a caller ranking over its own
	// richer model could not map the array back onto it — and closed over the
	// model instead, ignoring the argument it was given.
	interface AppCommand {
		key: string
		name: string
		recent: boolean
	}

	const MODEL: AppCommand[] = [
		{ key: "cmd-blur", name: "Blur", recent: false },
		{ key: "cmd-bloom", name: "Bloom", recent: true },
	]

	it("round-trips a caller's own model through filter, by id", async () => {
		const user = userEvent.setup()
		const byId = new Map(MODEL.map((entry) => [entry.key, entry]))
		const items: CommandItem[] = MODEL.map((entry) => ({
			id: entry.key,
			group: "Effects",
			label: entry.name,
			onSelect: () => {},
		}))
		// Ranks using only what it can recover from the argument — recents first.
		const recentsFirst: CommandFilter = (given) =>
			[...given].sort(
				(a, b) =>
					Number(byId.get(b.id ?? "")?.recent ?? false) -
					Number(byId.get(a.id ?? "")?.recent ?? false),
			)

		function Host() {
			const [open, setOpen] = useState(true)
			return (
				<CommandMenu
					open={open}
					onOpenChange={setOpen}
					filter={recentsFirst}
					items={items}
				/>
			)
		}
		renderWithProviders(<Host />)
		await user.click(screen.getByRole("combobox"))
		const options = screen.getAllByRole("option")
		expect(options[0]).toHaveTextContent("Bloom")
		expect(options[1]).toHaveTextContent("Blur")
	})

	it("names the row by the caller's id, so activedescendant is recognisable", () => {
		function Host() {
			const [open, setOpen] = useState(true)
			return (
				<CommandMenu
					open={open}
					onOpenChange={setOpen}
					items={[
						{
							id: "cmd-blur",
							group: "Effects",
							label: "Blur",
							onSelect: () => {},
						},
					]}
				/>
			)
		}
		renderWithProviders(<Host />)
		const option = screen.getByRole("option")
		// Namespaced to the listbox — the caller's id is unique among its items,
		// not in the document — but the caller's id is recoverable from it.
		expect(option.id.endsWith("-cmd-blur")).toBe(true)
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"aria-activedescendant",
			option.id,
		)
	})

	it("keeps two rows that share a label distinct", () => {
		function Host() {
			const [open, setOpen] = useState(true)
			return (
				<CommandMenu
					open={open}
					onOpenChange={setOpen}
					items={[
						{ id: "a", group: "Layers", label: "Sky", onSelect: () => {} },
						{ id: "b", group: "Layers", label: "Sky", onSelect: () => {} },
					]}
				/>
			)
		}
		renderWithProviders(<Host />)
		const [first, second] = screen.getAllByRole("option")
		expect(first.id).not.toEqual(second.id)
	})
})

describe("CommandMenu — one highlight at a time", () => {
	// The finding this answers: the row carried `hover:bg-accent` as well as
	// `aria-selected:bg-accent`, so a pointer parked on one row while the keyboard
	// moved the highlight to another painted two rows as active — and only one of
	// them would have run on Enter. The pointer now takes the highlight over
	// instead of painting a second one.
	//
	// jsdom does no layout and applies no stylesheet here, so this asserts the
	// *state* (aria-selected, which is what the fill is keyed on) and the absence
	// of a hover fill in the class list. That the fill lands where the state says
	// is a browser fact, checked in the docs app.
	it("moves the highlight onto the row under the pointer", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const options = screen.getAllByRole("option")
		expect(options[0]).toHaveAttribute("aria-selected", "true")

		await user.hover(options[2])
		expect(options[2]).toHaveAttribute("aria-selected", "true")
		expect(options[0]).not.toHaveAttribute("aria-selected", "true")
		expect(screen.getByRole("combobox")).toHaveAttribute(
			"aria-activedescendant",
			options[2].id,
		)
	})

	it("paints exactly one row, from aria-selected alone", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const options = screen.getAllByRole("option")
		// Park the pointer on the last row, then move the highlight by keyboard
		// without moving the mouse — the case that used to show two active rows.
		await user.hover(options[2])
		await user.keyboard("{Home}")

		expect(
			options.filter((o) => o.getAttribute("aria-selected") === "true"),
		).toHaveLength(1)
		for (const option of options) {
			expect(option.className).not.toMatch(/hover:bg-/)
		}
	})
})

describe("CommandMenu — the scrolling list", () => {
	// jsdom does no layout: it cannot prove that the list scrolls, that the cap
	// takes effect, or that the Scroller's edge fades appear (they are driven by
	// scrollHeight/clientHeight, both 0 here). What is testable is that the list
	// IS the scroll region and that a caller can reach it — the browser proves
	// the rest.
	it("puts listClassName on the listbox, and className on the dialog", () => {
		function Host() {
			const [open, setOpen] = useState(true)
			return (
				<CommandMenu
					open={open}
					onOpenChange={setOpen}
					className="max-w-[720px]"
					listClassName="max-h-[60vh]"
					items={[{ group: "Actions", label: "New post", onSelect: () => {} }]}
				/>
			)
		}
		renderWithProviders(<Host />)
		const listbox = screen.getByRole("listbox")
		// `listClassName` sizes the Scroller, which since 0.51.0 is the chrome box
		// wrapping the listbox — the cap and the overflow are on different
		// elements ON PURPOSE (a mask on the bordered box faded the border away).
		// What matters is unchanged: the cap bounds what scrolls.
		expect(listbox.parentElement).toHaveClass("max-h-[60vh]")
		expect(listbox).not.toHaveClass("max-w-[720px]")
		expect(screen.getByRole("dialog")).toHaveClass("max-w-[720px]")
	})

	it("scrolls on the listbox itself, and the cap above it still bounds it", () => {
		renderWithProviders(<DataDrivenHost />)
		const listbox = screen.getByRole("listbox")
		// The listbox overflows; its chrome box carries the cap and is a flex
		// column, so `flex-1 min-h-0` here resolves against a definite height.
		// That pairing is what the 0.44 wrapper lacked — it used `h-full`, which
		// had no definite height to resolve against, so the region never scrolled.
		expect(listbox).toHaveClass("overflow-y-auto")
		expect(listbox).toHaveClass("flex-1")
		expect(listbox).toHaveClass("min-h-0")
		expect(listbox).not.toHaveClass("h-full")
		expect(listbox.parentElement).toHaveClass("max-h-80")
		expect(listbox.parentElement).toHaveClass("flex-col")
	})
})

describe("CommandMenu — result count", () => {
	it("announces the count politely, and updates as the query narrows", async () => {
		const user = userEvent.setup()
		renderWithProviders(<DataDrivenHost />)
		const status = screen.getByRole("status")
		expect(status).toHaveTextContent("3 results")
		await user.click(screen.getByRole("combobox"))
		await user.keyboard("profile")
		expect(status).toHaveTextContent("1 result")
		await user.keyboard("zzz")
		expect(status).toHaveTextContent("No results")
	})
})

describe("CommandMenu — automated a11y", () => {
	it("has no axe violations when open", async () => {
		renderWithProviders(<DataDrivenHost />)
		const results = await axe(document.body, {
			// jsdom has no layout, so contrast can't be computed here; it is covered
			// by the token contrast math elsewhere.
			rules: { "color-contrast": { enabled: false } },
		})
		// Ignore Base UI's own focus-trap guard sentinels (role=button, inert) —
		// framework machinery this component does not author or control.
		const violations = results.violations.filter(
			(v) =>
				!v.nodes.every((n) => n.html.includes("data-base-ui-focus-guard")),
		)
		expect(violations).toEqual([])
	})
})

describe("CommandMenu — the register it opens over", () => {
	const items: CommandItem[] = [
		{ id: "a", label: "New layer", group: "Layer", onSelect: () => {} },
	]

	it("renders chrome type and re-anchors density inside a compact scope", async () => {
		// The palette portals, so it inherits no `data-density` from the Workspace
		// the keystroke came from. lib/density exists for exactly this failure and
		// CommandMenu was the surface the sweep missed — which made the fastest way
		// to do anything in a tool the one thing that did not look like the tool.
		renderWithProviders(
			<Density value="compact">
				<CommandMenu open onOpenChange={() => {}} items={items} />
			</Density>,
		)
		const input = await screen.findByRole("combobox")
		expect(input.className).toContain("text-ui-md")
		expect(input.className).not.toContain("text-body-md")

		const row = screen.getByRole("option", { name: /New layer/ })
		expect(row.className).toContain("text-ui-md")

		// The surface itself re-declares the register, so anything inside it that
		// reads the CSS ladder (--control-*, --button-radius) resolves compact too.
		expect(input.closest("[data-density]")).toHaveAttribute("data-density", "compact")
	})

	it("stays page-register by default, so nothing moves for existing callers", async () => {
		renderWithProviders(<CommandMenu open onOpenChange={() => {}} items={items} />)
		const input = await screen.findByRole("combobox")
		expect(input.className).toContain("text-body-md")
		expect(screen.getByRole("option", { name: /New layer/ }).className).toContain("text-body-md")
	})
})

describe("CommandMenu — a palette that owns its input", () => {
	const items: CommandItem[] = [
		{ id: "a", label: "Alpha", group: "Go", onSelect: () => {} },
		{ id: "b", label: "Beta", group: "Go", onSelect: () => {} },
	]

	it("renders a scope chip beside the glyph rather than inside the value", async () => {
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={items}
				scope={<span data-testid="chip">In: Backdrop</span>}
			/>,
		)
		expect(await screen.findByTestId("chip")).toBeVisible()
		// The scope is NOT in the query — a caller filtering on `query` must not
		// have to parse its own chip back out of the user's text.
		expect(await screen.findByRole("combobox")).toHaveValue("")
	})

	it("runs the caller's key handler before its own", async () => {
		const seen: string[] = []
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={items}
				inputProps={{ onKeyDown: (e) => seen.push(e.key) }}
			/>,
		)
		const input = await screen.findByRole("combobox")
		await userEvent.type(input, "{Backspace}")
		expect(seen).toContain("Backspace")
	})

	it("lets the caller take a key the palette owns, via preventDefault", async () => {
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={items}
				inputProps={{
					onKeyDown: (e) => {
						if (e.key === "ArrowDown") e.preventDefault()
					},
				}}
			/>,
		)
		const input = await screen.findByRole("combobox")
		const before = input.getAttribute("aria-activedescendant")
		await userEvent.keyboard("{ArrowDown}")
		// The move is skipped — and, the part that matters, the active id is not
		// left naming a row that isn't highlighted.
		expect(input.getAttribute("aria-activedescendant")).toBe(before)
	})

	it("keeps its own navigation when the caller claims a different key", async () => {
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={items}
				inputProps={{
					onKeyDown: (e) => {
						if (e.key === "Backspace") e.preventDefault()
					},
				}}
			/>,
		)
		const input = await screen.findByRole("combobox")
		await userEvent.keyboard("{ArrowDown}")
		expect(input.getAttribute("aria-activedescendant")).toBeTruthy()
	})

	it("does not let inputProps take the combobox wiring", async () => {
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={items}
				// A caller who could replace these would break the other five.
				inputProps={{ spellCheck: false } as never}
			/>,
		)
		const input = await screen.findByRole("combobox")
		expect(input).toHaveAttribute("aria-autocomplete", "list")
		expect(input).toHaveAttribute("spellcheck", "false")
	})
})

describe("CommandMenuPanel — the palette in place", () => {
	const panelItems = (onSelect: (label: string) => void = () => {}): CommandItem[] => [
		{ group: "Create", label: "New project", onSelect: () => onSelect("New project") },
		{ group: "Create", label: "Invite teammate", onSelect: () => onSelect("Invite teammate") },
		{ group: "Settings", label: "Open settings", onSelect: () => onSelect("Open settings") },
	]

	it("renders the combobox and listbox in the page, with no dialog", () => {
		renderWithProviders(<CommandMenuPanel items={panelItems()} />)
		expect(screen.queryByRole("dialog")).toBeNull()
		const combobox = screen.getByRole("combobox")
		const listbox = screen.getByRole("listbox", { name: "Command menu" })
		expect(combobox).toHaveAttribute("aria-controls", listbox.id)
		expect(within(listbox).getAllByRole("option")).toHaveLength(3)
		expect(within(listbox).getAllByRole("group")).toHaveLength(2)
	})

	it("does not take focus on mount, and is not the shortcut's input", () => {
		renderWithProviders(<CommandMenuPanel items={panelItems()} />)
		const combobox = screen.getByRole("combobox")
		expect(combobox).not.toHaveFocus()
		expect(combobox).not.toHaveAttribute("data-command-menu-input")
	})

	it("is a static surface: bordered card, no floating shadow", () => {
		const { container } = renderWithProviders(
			<CommandMenuPanel items={panelItems()} className="w-80" />,
		)
		const root = container.querySelector('[data-slot="command-menu-panel"]')
		expect(root).toHaveClass("bg-card", "border-border", "w-80")
		expect(root?.className).not.toMatch(/shadow|bg-popover/)
	})

	it("shares the keyboard model: seeds, moves, runs on Enter", async () => {
		const onSelect = vi.fn()
		renderWithProviders(<CommandMenuPanel items={panelItems(onSelect)} />)
		const input = screen.getByRole("combobox")
		const options = screen.getAllByRole("option")
		expect(input).toHaveAttribute("aria-activedescendant", options[0].id)
		await userEvent.click(input)
		await userEvent.keyboard("{End}")
		expect(input).toHaveAttribute("aria-activedescendant", options[2].id)
		await userEvent.keyboard("{ArrowDown}")
		expect(input).toHaveAttribute("aria-activedescendant", options[0].id)
		await userEvent.keyboard("{ArrowDown}{Enter}")
		expect(onSelect).toHaveBeenCalledWith("Invite teammate")
		// Nothing to close: the panel stays put.
		expect(screen.getByRole("listbox")).toBeInTheDocument()
	})

	it("filters and re-seeds as the query narrows", async () => {
		renderWithProviders(<CommandMenuPanel items={panelItems()} />)
		const input = screen.getByRole("combobox")
		await userEvent.type(input, "set")
		const options = screen.getAllByRole("option")
		expect(options).toHaveLength(1)
		expect(input).toHaveAttribute("aria-activedescendant", options[0].id)
	})

	it("clears the query on Esc instead of closing", async () => {
		renderWithProviders(<CommandMenuPanel items={panelItems()} />)
		const input = screen.getByRole("combobox")
		await userEvent.type(input, "zzz")
		expect(screen.queryAllByRole("option")).toHaveLength(0)
		await userEvent.keyboard("{Escape}")
		expect(input).toHaveValue("")
		expect(screen.getAllByRole("option")).toHaveLength(3)
	})

	it("lets Esc through once the query is empty, so a popover around it can close", async () => {
		const outer = vi.fn()
		renderWithProviders(
			// biome-ignore lint/a11y/noStaticElementInteractions: test listener
			<div onKeyDown={(e) => outer(e.key, e.defaultPrevented)}>
				<CommandMenuPanel items={panelItems()} />
			</div>,
		)
		const input = screen.getByRole("combobox")
		await userEvent.type(input, "new")
		await userEvent.keyboard("{Escape}")
		expect(outer).not.toHaveBeenCalledWith("Escape", expect.anything())
		await userEvent.keyboard("{Escape}")
		expect(outer).toHaveBeenCalledWith("Escape", false)
	})

	it("reports controlled query changes, Esc included", async () => {
		const onQueryChange = vi.fn()
		renderWithProviders(
			<CommandMenuPanel items={panelItems()} query="new" onQueryChange={onQueryChange} />,
		)
		await userEvent.click(screen.getByRole("combobox"))
		await userEvent.keyboard("{Escape}")
		expect(onQueryChange).toHaveBeenLastCalledWith("")
	})

	it("re-seeds when the items under it change with no query change", () => {
		const { rerender } = renderWithProviders(<CommandMenuPanel items={[]} />)
		const input = screen.getByRole("combobox")
		expect(input).not.toHaveAttribute("aria-activedescendant")
		rerender(<CommandMenuPanel items={panelItems()} />)
		const options = screen.getAllByRole("option")
		expect(input).toHaveAttribute("aria-activedescendant", options[0].id)
		rerender(<CommandMenuPanel items={panelItems().slice(1)} />)
		expect(input).toHaveAttribute(
			"aria-activedescendant",
			screen.getAllByRole("option")[0].id,
		)
	})

	it("self-filters declarative children too", async () => {
		renderWithProviders(
			<CommandMenuPanel>
				<CommandMenuGroup label="Create">
					<CommandMenuItem>New project</CommandMenuItem>
					<CommandMenuItem>Invite teammate</CommandMenuItem>
				</CommandMenuGroup>
			</CommandMenuPanel>,
		)
		await userEvent.type(screen.getByRole("combobox"), "invite")
		expect(screen.getAllByRole("option")).toHaveLength(1)
	})

	it("has no axe violations", async () => {
		const { container } = renderWithProviders(
			<CommandMenuPanel items={panelItems()} />,
		)
		const results = await axe(container, {
			rules: { "color-contrast": { enabled: false } },
		})
		expect(results.violations).toEqual([])
	})
})

describe("CommandMenu — stacked rows", () => {
	it("puts a stacked item's detail on its own line under the label", () => {
		renderWithProviders(
			<CommandMenu
				open
				onOpenChange={() => {}}
				items={[
					{ group: "Tickets", label: "Refund not received", detail: "#4120 · Ada Lovelace", stacked: true, onSelect: () => {} },
					{ group: "Tickets", label: "Refund not received", detail: "#4188 · Grace Hopper", onSelect: () => {} },
				]}
			/>,
		)
		const [stacked, inline] = screen.getAllByRole("option")
		const detail = within(stacked).getByText("#4120 · Ada Lovelace")
		expect(detail.parentElement).toHaveClass("flex-col")
		expect(within(stacked).getByText("Refund not received").parentElement).toBe(detail.parentElement)
		expect(within(inline).getByText("#4188 · Grace Hopper").parentElement).toBe(inline)
	})
})
