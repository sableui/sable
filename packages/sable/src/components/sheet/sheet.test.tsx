import { render, screen, waitFor } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { Button } from "../button"
import { CardFooter } from "../card"
import { Dialog, DialogContent, DialogTitle } from "../dialog"
import { Entity } from "../entity"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetList,
	SheetTitle,
	SheetTrigger,
} from "./index"

/**
 * Sheet runs on Base UI Drawer (since swipe-to-dismiss) but keeps Dialog's
 * contract: same parts, same ARIA wiring, same dismissal paths, same focus
 * default. The swipe gesture itself needs real layout and hit-testing, which
 * jsdom has none of, so these cover the wiring around it: each side reports the
 * swipe direction that sends the panel back toward its own edge.
 */
describe("Sheet", () => {
	it("bleeds a SheetList through the sheet padding and hands it to each row", async () => {
		render(
			<Sheet open>
				<SheetContent>
					<SheetTitle>Up next</SheetTitle>
					<SheetList>
						<Entity title="Low tide, high noon" />
					</SheetList>
				</SheetContent>
			</Sheet>,
		)
		const dialog = await screen.findByRole("dialog")
		// One padding variable: the sheet pads by it, the list cancels it and
		// gives it back as the row inset, so rows align with the header.
		expect(dialog.className).toContain("[--sheet-p:--spacing(6)]")
		expect(dialog).toHaveClass("p-(--sheet-p)")
		const list = dialog.querySelector('[data-slot="sheet-list"]') as HTMLElement
		expect(list).toHaveClass("-mx-(--sheet-p)", "[--entity-px:var(--sheet-p)]", "[--entity-radius:0px]")
		expect(list).toContainElement(screen.getByText("Low tide, high noon"))
	})

	it("opens from the trigger as a labelled, described dialog", async () => {
		render(
			<Sheet>
				<SheetTrigger render={<Button>Open</Button>} />
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Filters</SheetTitle>
						<SheetDescription>Narrow the feed.</SheetDescription>
					</SheetHeader>
				</SheetContent>
			</Sheet>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		const dialog = await screen.findByRole("dialog", { name: "Filters" })
		expect(dialog).toHaveAccessibleDescription("Narrow the feed.")
	})

	it.each([
		["right", "right"],
		["left", "left"],
		["top", "up"],
		["bottom", "down"],
	] as const)("side=%s swipes %s to dismiss", async (side, direction) => {
		render(
			<Sheet open>
				<SheetContent side={side}>
					<SheetTitle>T</SheetTitle>
				</SheetContent>
			</Sheet>,
		)
		const dialog = await screen.findByRole("dialog")
		await waitFor(() =>
			expect(dialog).toHaveAttribute("data-swipe-direction", direction),
		)
	})

	it("defaults to the right edge", async () => {
		render(
			<Sheet open>
				<SheetContent>
					<SheetTitle>T</SheetTitle>
				</SheetContent>
			</Sheet>,
		)
		const dialog = await screen.findByRole("dialog")
		expect(dialog).toHaveAttribute("data-swipe-direction", "right")
		expect(dialog.className).toContain("right-0")
	})

	it("keeps children as direct flex items of the panel column", async () => {
		render(
			<Sheet open>
				<SheetContent>
					<SheetTitle>T</SheetTitle>
					<SheetFooter data-testid="footer" />
				</SheetContent>
			</Sheet>,
		)
		const dialog = await screen.findByRole("dialog")
		// Drawer.Content wraps the children so a mouse drag on content selects
		// text instead of dragging the panel; it is display: contents so the
		// footer's mt-auto still pins against the popup's own flex column.
		const content = dialog.querySelector("[data-drawer-content]")
		expect(content).not.toBeNull()
		expect(content?.className).toContain("contents")
		expect(screen.getByTestId("footer").parentElement).toBe(content)
	})

	it("Escape closes a controlled sheet", async () => {
		const onOpenChange = vi.fn()
		render(
			<Sheet open onOpenChange={onOpenChange}>
				<SheetContent>
					<SheetTitle>T</SheetTitle>
				</SheetContent>
			</Sheet>,
		)
		await screen.findByRole("dialog")
		await userEvent.keyboard("{Escape}")
		expect(onOpenChange).toHaveBeenCalledTimes(1)
		expect(onOpenChange.mock.calls[0][0]).toBe(false)
	})

	it("a click outside the panel dismisses it", async () => {
		const onOpenChange = vi.fn()
		render(
			<Sheet open onOpenChange={onOpenChange}>
				<SheetContent>
					<SheetTitle>T</SheetTitle>
				</SheetContent>
			</Sheet>,
		)
		const dialog = await screen.findByRole("dialog")
		// The viewport (Drawer's positioning layer) covers the screen around the panel.
		await userEvent.click(dialog.parentElement as HTMLElement)
		await waitFor(() => expect(onOpenChange).toHaveBeenCalled())
		expect(onOpenChange.mock.calls[0][0]).toBe(false)
	})

	it("SheetClose closes and unmounts the sheet", async () => {
		function Harness() {
			const [open, setOpen] = useState(true)
			return (
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetContent>
						<SheetTitle>T</SheetTitle>
						<SheetClose render={<Button>Done</Button>} />
					</SheetContent>
				</Sheet>
			)
		}
		render(<Harness />)
		await screen.findByRole("dialog")
		await userEvent.click(screen.getByRole("button", { name: "Done" }))
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
	})

	it("moves focus to the first tabbable on keyboard open, like Dialog", async () => {
		render(
			<Sheet>
				<SheetTrigger render={<Button>Open</Button>} />
				<SheetContent>
					<SheetTitle>T</SheetTitle>
					<Button>First action</Button>
				</SheetContent>
			</Sheet>,
		)
		screen.getByRole("button", { name: "Open" }).focus()
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("dialog")
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "First action" })).toHaveFocus(),
		)
	})

	it("returns focus to the trigger on close", async () => {
		render(
			<Sheet>
				<SheetTrigger render={<Button>Open</Button>} />
				<SheetContent>
					<SheetTitle>T</SheetTitle>
					<SheetClose render={<Button>Close</Button>} />
				</SheetContent>
			</Sheet>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Open" }))
		await screen.findByRole("dialog")
		await userEvent.click(screen.getByRole("button", { name: "Close" }))
		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Open" })).toHaveFocus(),
		)
	})

	it("stacks its footer in a bottom sheet: primary on top, full width, capped at a phone's width", async () => {
		render(
			<Sheet open>
				<SheetContent side="bottom">
					<SheetTitle>Feedback</SheetTitle>
					<SheetFooter>
						<Button variant="ghost">Skip</Button>
						<Button>Send</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>,
		)
		const footer = (await screen.findByRole("button", { name: "Send" })).parentElement as HTMLElement
		expect(footer.dataset.actions).toBe("stack")
		expect(footer.className).toContain("flex-col-reverse")
		expect(footer.className).toContain("max-w-sm")
		expect(screen.getByRole("button", { name: "Send" }).className).toContain("w-full")
	})

	it("keeps a side sheet's footer a right-aligned row", async () => {
		render(
			<Sheet open>
				<SheetContent side="right">
					<SheetTitle>Filters</SheetTitle>
					<SheetFooter>
						<Button>Apply</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>,
		)
		const footer = (await screen.findByRole("button", { name: "Apply" })).parentElement as HTMLElement
		expect(footer.dataset.actions).toBe("row")
		expect(footer.className).toContain("justify-end")
	})

	it("does not reach into a dialog opened from a bottom sheet", async () => {
		render(
			<Sheet open>
				<SheetContent side="bottom">
					<SheetTitle>Sheet</SheetTitle>
					<Dialog open>
						<DialogContent>
							<DialogTitle>Confirm</DialogTitle>
							<CardFooter actions>
								<Button>Delete</Button>
							</CardFooter>
						</DialogContent>
					</Dialog>
				</SheetContent>
			</Sheet>,
		)
		const footer = (await screen.findByRole("button", { name: "Delete" })).parentElement as HTMLElement
		expect(footer.dataset.actions).toBe("row")
	})
})
