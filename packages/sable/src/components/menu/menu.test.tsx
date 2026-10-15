import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from "./menu"

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
