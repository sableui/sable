import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../test/render"
import { Combobox, ComboboxChips, ComboboxContent, ComboboxInput } from "../components/combobox"
import { CommandMenu } from "../components/command-menu"
import { Dialog, DialogContent, DialogTitle } from "../components/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../components/menu"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { Sheet, SheetContent, SheetTitle } from "../components/sheet"
import { anchoredListScroll, anchoredScroll } from "./anchored-scroll"

/**
 * jsdom runs no layout and no positioning engine: `--available-height` is never
 * written (Base UI's size middleware needs a real box), so nothing here can prove
 * that a long menu actually scrolls. What it proves is the part that was wrong in
 * every one of the three shipped bugs — that the surface DECLARES a cap, and that
 * the cap and the `overflow` sit on the same element. A capped element that does
 * not scroll, and a scrolling element with no cap, are both the same silent clip.
 */

function expectScrollingCap(target: HTMLElement | string, cap: RegExp) {
	const classes = typeof target === "string" ? target : target.className
	expect(classes).toMatch(cap)
	expect(classes).toMatch(/overflow-y-auto|overflow-auto/)
	expect(classes).toContain("overscroll-contain")
	expect(classes).toContain("scrollbar-quiet")
}

/**
 * Combobox popups carry no role of their own (the List inside them
 * owns the listbox role), so they are reached structurally: the portaled
 * positioner's focusable popup child.
 */
function popup(): HTMLElement {
	const el = document.querySelector<HTMLElement>(
		'[data-base-ui-portal] [role="presentation"][tabindex="-1"]',
	)
	if (!el) throw new Error("no popup found")
	return el
}

const AVAILABLE = /max-h-\[var\(--available-height\)\]/
const AVAILABLE_LIST = /max-h-\[min\(18rem,var\(--available-height\)\)\]/

describe("anchored surfaces cap against the room the positioner measured", () => {
	it("keeps the cap and the overflow on the same element in the shared classes", () => {
		expectScrollingCap(anchoredScroll, AVAILABLE)
		expectScrollingCap(anchoredListScroll, AVAILABLE_LIST)
	})

	it("Menu", async () => {
		renderWithProviders(
			<Menu open>
				<MenuTrigger>Open</MenuTrigger>
				<MenuContent>
					<MenuItem>One</MenuItem>
				</MenuContent>
			</Menu>,
		)
		expectScrollingCap(await screen.findByRole("menu"), AVAILABLE)
	})

	it("Select", async () => {
		renderWithProviders(
			<Select open defaultValue="a">
				<SelectTrigger placeholder="Pick" />
				<SelectContent>
					<SelectItem value="a">A</SelectItem>
				</SelectContent>
			</Select>,
		)
		// Base UI puts the listbox role on Select.List, which sits inside the
		// popup that carries the cap.
		const list = await screen.findByRole("listbox")
		expectScrollingCap(list.parentElement as HTMLElement, AVAILABLE_LIST)
	})

	it("Combobox", async () => {
		renderWithProviders(
			<Combobox open items={["a"]}>
				<ComboboxInput />
				<ComboboxContent>list</ComboboxContent>
			</Combobox>,
		)
		await screen.findByRole("combobox")
		expectScrollingCap(popup(), AVAILABLE_LIST)
	})

	it("Combobox multiple", async () => {
		renderWithProviders(
			<Combobox multiple open items={["a"]}>
				<ComboboxChips />
				<ComboboxContent>list</ComboboxContent>
			</Combobox>,
		)
		await screen.findByRole("combobox")
		expectScrollingCap(popup(), AVAILABLE_LIST)
	})

	it("Popover", async () => {
		renderWithProviders(
			<Popover open>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>body</PopoverContent>
			</Popover>,
		)
		expectScrollingCap(await screen.findByRole("dialog"), AVAILABLE)
	})
})

describe("viewport-anchored surfaces cap against the viewport", () => {
	it("Dialog caps the popup and scrolls an inner region, so the close stays put", async () => {
		renderWithProviders(
			<Dialog open>
				<DialogContent showCloseButton>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		)
		const popup = await screen.findByRole("dialog")
		expect(popup.className).toContain("max-h-[calc(100dvh-2rem)]")
		const scrollRegion = popup.firstElementChild as HTMLElement
		expect(scrollRegion.className).toContain("overflow-y-auto")
		expect(scrollRegion.className).toContain("overscroll-contain")
		expect(scrollRegion.className).toContain("scrollbar-quiet")
		// The close button is a sibling of the scroll region, not inside it.
		expect(scrollRegion.contains(screen.getByLabelText("Close"))).toBe(false)
	})

	it("Dialog's scroll region clips wider than it lays out, so a footer's focus ring survives", async () => {
		// A scroll container clips at its padding edge, and a footer's last row sits
		// flush against it — so the focus ring on a footer button, drawn OUTSIDE the
		// border box, was sliced off along with the bottom of the button's own
		// radius. Reported from a consuming app and reproduced in this package's own
		// Dialog demo. The negative margin cancels the padding, so the fix is
		// invisible in layout and only widens what `overflow` clips; asserting both
		// halves is the point, since either one alone is a bug.
		renderWithProviders(
			<Dialog open>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		)
		const popup = await screen.findByRole("dialog")
		const scrollRegion = popup.firstElementChild as HTMLElement
		expect(scrollRegion.className).toContain("-m-2")
		expect(scrollRegion.className).toContain("p-2")
	})

	it("Dialog can hand the scroll back with scroll={false}", async () => {
		renderWithProviders(
			<Dialog open>
				<DialogContent scroll={false}>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		)
		const popup = await screen.findByRole("dialog")
		expect((popup.firstElementChild as HTMLElement).className).not.toContain(
			"overflow-y-auto",
		)
	})

	it("Sheet scrolls its own column", async () => {
		renderWithProviders(
			<Sheet open>
				<SheetContent>
					<SheetTitle>Title</SheetTitle>
				</SheetContent>
			</Sheet>,
		)
		const popup = await screen.findByRole("dialog")
		expect(popup.className).toContain("overflow-y-auto")
		expect(popup.className).toContain("overscroll-contain")
		expect(popup.className).toContain("scrollbar-quiet")
	})

	it("CommandMenu pins its search header and scrolls only the listbox", async () => {
		renderWithProviders(<CommandMenu open onOpenChange={() => {}} items={[]} />)
		const listbox = await screen.findByRole("listbox")
		// The only surface here whose cap and overflow are deliberately on
		// different elements: its list is a `Scroller`, which since 0.51.0 wraps
		// the scrolling box in a chrome box so a border cannot be eaten by the
		// edge-fade mask. The cap sits on that wrapper and still bounds the list,
		// because the wrapper is a flex column and the list is `flex-1 min-h-0`.
		// max-h-80: the 20rem cap, on the spacing scale so density moves it.
		expect(listbox.parentElement?.className).toMatch(/\bmax-h-80\b/)
		expect(listbox.parentElement?.className).toContain("flex-col")
		expect(listbox.className).toMatch(/overflow-y-auto/)
		expect(listbox.className).toContain("overscroll-contain")
		expect(listbox.className).toContain("scrollbar-quiet")
		expect(listbox.className).toContain("min-h-0")
		expect(listbox.className).toContain("flex-1")
		// The combobox input is a sibling of the scrolling list, never inside it.
		expect(listbox.contains(screen.getByRole("combobox"))).toBe(false)
	})
})
