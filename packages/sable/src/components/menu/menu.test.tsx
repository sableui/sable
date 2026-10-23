import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuLinkItem, MenuSubmenu, MenuSubmenuTrigger, MenuTrigger } from "./menu"

function PageActions({ onCopy = () => undefined }: { onCopy?: () => void }) {
	return (
		<Menu>
			<MenuTrigger render={<Button>Actions</Button>} />
			<MenuContent>
				<MenuItem icon={<span data-testid="copy-icon" />} description="Copy page as Markdown for LLMs" onClick={onCopy}>
					Copy page
				</MenuItem>
				<MenuLinkItem description="Ask questions about this page" href="https://example.com/ask" target="_blank">
					Open in Claude
				</MenuLinkItem>
				<MenuLinkItem href="/llms.txt">llms.txt</MenuLinkItem>
			</MenuContent>
		</Menu>
	)
}

describe("Menu rows with a description", () => {
	it("keeps one accessible row: label and description, the icon in its tile", async () => {
		renderWithProviders(<PageActions />)
		await userEvent.click(screen.getByRole("button", { name: "Actions" }))
		const row = await screen.findByRole("menuitem", { name: /Copy page/ })
		expect(row).toHaveTextContent("Copy pageCopy page as Markdown for LLMs")
		expect(row.querySelector('[data-slot="menu-item-description"]')?.className).toContain("text-muted-foreground")
		expect(screen.getByTestId("copy-icon").closest('[data-slot="menu-item-icon"]')).not.toBeNull()
	})

	it("still runs the action", async () => {
		const onCopy = vi.fn()
		renderWithProviders(<PageActions onCopy={onCopy} />)
		await userEvent.click(screen.getByRole("button", { name: "Actions" }))
		await userEvent.click(await screen.findByRole("menuitem", { name: /Copy page/ }))
		expect(onCopy).toHaveBeenCalledOnce()
	})
})

describe("MenuLinkItem", () => {
	it("is a real link, and an external one says it leaves safely", async () => {
		renderWithProviders(<PageActions />)
		await userEvent.click(screen.getByRole("button", { name: "Actions" }))
		const external = await screen.findByRole("menuitem", { name: /Open in Claude/ })
		expect(external.tagName).toBe("A")
		expect(external).toHaveAttribute("href", "https://example.com/ask")
		expect(external).toHaveAttribute("rel", "noopener noreferrer")
		const internal = screen.getByRole("menuitem", { name: "llms.txt" })
		expect(internal).toHaveAttribute("href", "/llms.txt")
		expect(internal).not.toHaveAttribute("rel")
	})
})

describe("MenuSubmenuTrigger icon", () => {
	it("leads the row with its icon, on the same column as MenuItem's", async () => {
		renderWithProviders(
			<Menu>
				<MenuTrigger render={<Button>Account</Button>} />
				<MenuContent>
					<MenuItem icon={<span data-testid="item-icon" />}>Settings</MenuItem>
					<MenuSubmenu>
						<MenuSubmenuTrigger icon={<span data-testid="submenu-icon" />} value="Dark">Appearance</MenuSubmenuTrigger>
						<MenuContent>
							<MenuItem>Light</MenuItem>
						</MenuContent>
					</MenuSubmenu>
				</MenuContent>
			</Menu>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Account" }))
		const trigger = await screen.findByRole("menuitem", { name: /Appearance/ })
		// The icon is the row's first child, as it is in MenuItem.
		expect(trigger.firstElementChild).toBe(screen.getByTestId("submenu-icon"))
		expect(screen.getByRole("menuitem", { name: "Settings" }).firstElementChild).toBe(screen.getByTestId("item-icon"))
	})
})

describe("Menu row shortcuts", () => {
	it("ends the row with the shortcut, muted, on MenuItem and MenuCheckboxItem", async () => {
		renderWithProviders(
			<Menu>
				<MenuTrigger render={<Button>Edit</Button>} />
				<MenuContent>
					<MenuItem shortcut="Ctrl Z">Undo</MenuItem>
					<MenuCheckboxItem shortcut="Ctrl R">Show ruler</MenuCheckboxItem>
					<MenuItem>Select all</MenuItem>
				</MenuContent>
			</Menu>,
		)
		await userEvent.click(screen.getByRole("button", { name: "Edit" }))
		const undo = await screen.findByRole("menuitem", { name: /Undo/ })
		const shortcut = undo.querySelector('[data-slot="menu-item-shortcut"]')
		expect(shortcut).toHaveTextContent("Ctrl Z")
		expect(undo.lastElementChild).toBe(shortcut)
		expect(shortcut?.className).toContain("ms-auto")
		expect(shortcut?.className).toContain("text-muted-foreground")
		const ruler = screen.getByRole("menuitemcheckbox", { name: /Show ruler/ })
		expect(ruler.querySelector('[data-slot="menu-item-shortcut"]')).toHaveTextContent("Ctrl R")
		// No column when there is no shortcut.
		expect(screen.getByRole("menuitem", { name: "Select all" }).querySelector('[data-slot="menu-item-shortcut"]')).toBeNull()
	})
})
