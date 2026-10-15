import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Menu, MenuContent, MenuItem } from "../menu"
import { Menubar, MenubarTrigger } from "./menubar"

function Editor({ onUndo = () => undefined }: { onUndo?: () => void }) {
	return (
		<Menubar aria-label="Editor">
			<Menu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenuContent>
					<MenuItem>New</MenuItem>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenuContent>
					<MenuItem onClick={onUndo}>Undo</MenuItem>
				</MenuContent>
			</Menu>
		</Menubar>
	)
}

describe("Menubar", () => {
	it("is a named menubar whose titles are menu items", () => {
		renderWithProviders(<Editor />)
		const bar = screen.getByRole("menubar", { name: "Editor" })
		const titles = screen.getAllByRole("menuitem")
		expect(titles.map((t) => t.textContent)).toEqual(["File", "Edit"])
		for (const title of titles) expect(bar.contains(title)).toBe(true)
	})

	it("opens a title's menu and runs its rows", async () => {
		const onUndo = vi.fn()
		renderWithProviders(<Editor onUndo={onUndo} />)
		await userEvent.click(screen.getByRole("menuitem", { name: "Edit" }))
		const undo = await screen.findByRole("menuitem", { name: "Undo" })
		// The attribute `sable-open:` keys the title's wash to.
		expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("data-popup-open")
		await userEvent.click(undo)
		expect(onUndo).toHaveBeenCalledOnce()
	})

	it("moves between titles with the arrow keys, one tab stop for the bar", async () => {
		renderWithProviders(<Editor />)
		await userEvent.tab()
		expect(screen.getByRole("menuitem", { name: "File" })).toHaveFocus()
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus()
		// Wraps by default (loopFocus).
		await userEvent.keyboard("{ArrowRight}")
		expect(screen.getByRole("menuitem", { name: "File" })).toHaveFocus()
	})

	it("holds the open title in the accent wash", () => {
		renderWithProviders(<Editor />)
		const cls = screen.getByRole("menuitem", { name: "File" }).className
		// sable-open matches Base UI's data-popup-open on the trigger.
		expect(cls).toContain("sable-open:bg-accent")
		expect(cls).toContain("sable-open:text-accent-foreground")
	})
})
