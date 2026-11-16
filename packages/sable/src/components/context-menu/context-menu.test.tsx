import { fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen, waitFor } from "../../test/render"
import { MENU_ITEM, MENU_ITEM_DESTRUCTIVE, MenuItem } from "../menu/menu"
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	ContextMenuLinkItem,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuSubmenu,
	ContextMenuSubmenuTrigger,
	ContextMenuTrigger,
} from "./context-menu"

function FileMenu({ onRename = () => undefined }: { onRename?: () => void }) {
	return (
		<ContextMenu>
			<ContextMenuTrigger>Report.pdf</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem
					icon={<span data-testid="rename-icon" />}
					description="Change the file name"
					shortcut="F2"
					onClick={onRename}
				>
					Rename
				</ContextMenuItem>
				<ContextMenuLinkItem href="https://example.com/help" target="_blank">
					Help
				</ContextMenuLinkItem>
				<ContextMenuSeparator />
				<ContextMenuGroup>
					<ContextMenuGroupLabel>View</ContextMenuGroupLabel>
					<ContextMenuCheckboxItem defaultChecked>Show extension</ContextMenuCheckboxItem>
					<ContextMenuRadioGroup defaultValue="name">
						<ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
						<ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
					</ContextMenuRadioGroup>
				</ContextMenuGroup>
				<ContextMenuSubmenu>
					<ContextMenuSubmenuTrigger value="Desktop">Move to</ContextMenuSubmenuTrigger>
					<ContextMenuContent side="inline-end">
						<ContextMenuItem>Documents</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenuSubmenu>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive">Delete</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

async function open() {
	fireEvent.contextMenu(screen.getByText("Report.pdf"))
	return screen.findByRole("menu")
}

describe("ContextMenu", () => {
	it("opens on the contextmenu event, not on a plain click", async () => {
		renderWithProviders(<FileMenu />)
		await userEvent.click(screen.getByText("Report.pdf"))
		expect(screen.queryByRole("menu")).toBeNull()
		expect(await open()).toBeInTheDocument()
	})

	it("runs an item's action and closes", async () => {
		const onRename = vi.fn()
		renderWithProviders(<FileMenu onRename={onRename} />)
		await open()
		await userEvent.click(screen.getByRole("menuitem", { name: /Rename/ }))
		expect(onRename).toHaveBeenCalledOnce()
		await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
	})

	it("is Menu's row: icon tile, description, shortcut, and the shared classes", async () => {
		renderWithProviders(<FileMenu />)
		await open()
		const rename = screen.getByRole("menuitem", { name: /Rename/ })
		expect(screen.getByTestId("rename-icon").closest('[data-slot="menu-item-icon"]')).not.toBeNull()
		expect(rename.querySelector('[data-slot="menu-item-description"]')).toHaveTextContent("Change the file name")
		expect(rename.querySelector('[data-slot="menu-item-shortcut"]')).toHaveTextContent("F2")
		for (const cls of MENU_ITEM.split(" ")) expect(rename.className).toContain(cls)
		// Shared, not copied: the part is Menu's own.
		expect(ContextMenuItem).toBe(MenuItem)
	})

	it("keeps the destructive ink on a destructive row", async () => {
		renderWithProviders(<FileMenu />)
		await open()
		const del = screen.getByRole("menuitem", { name: "Delete" })
		for (const cls of MENU_ITEM_DESTRUCTIVE.split(" ")) expect(del.className).toContain(cls)
		expect(screen.getByRole("menuitem", { name: /Rename/ }).className).not.toContain("destructive")
	})

	it("holds checkbox and radio rows with their state", async () => {
		renderWithProviders(<FileMenu />)
		await open()
		const ext = screen.getByRole("menuitemcheckbox", { name: "Show extension" })
		expect(ext).toHaveAttribute("aria-checked", "true")
		await userEvent.click(ext)
		// Toggling rows keep the menu open (Base UI's closeOnClick is off for them).
		await waitFor(() => expect(screen.getByRole("menuitemcheckbox", { name: "Show extension" })).toHaveAttribute("aria-checked", "false"))
		const byName = screen.getByRole("menuitemradio", { name: "Sort by name" })
		const byDate = screen.getByRole("menuitemradio", { name: "Sort by date" })
		expect(byName).toHaveAttribute("aria-checked", "true")
		expect(byDate).toHaveAttribute("aria-checked", "false")
		await userEvent.click(byDate)
		await waitFor(() => expect(screen.getByRole("menuitemradio", { name: "Sort by date" })).toHaveAttribute("aria-checked", "true"))
	})

	it("opens a submenu", async () => {
		renderWithProviders(<FileMenu />)
		await open()
		const trigger = screen.getByRole("menuitem", { name: /Move to/ })
		expect(trigger).toHaveTextContent("Desktop")
		await userEvent.click(trigger)
		expect(await screen.findByRole("menuitem", { name: "Documents" })).toBeInTheDocument()
	})

	it("labels an external link item as opening a new tab", async () => {
		renderWithProviders(<FileMenu />)
		await open()
		const help = screen.getByRole("menuitem", { name: /Help\s*\(opens in new tab\)/})
		expect(help.tagName).toBe("A")
		expect(help).toHaveAttribute("rel", "noopener noreferrer")
	})
})
