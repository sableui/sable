import userEvent from "@testing-library/user-event"
import { axe } from "jest-axe"
import { describe, expect, it, vi } from "vitest"
import { Density } from "../../lib/density"
import { renderWithProviders, screen } from "../../test/render"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "../menu"
import { Toggle, ToggleGroup } from "../toggle"
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarLink,
	ToolbarSeparator,
} from "./toolbar"

function Formatting(props: { orientation?: "horizontal" | "vertical" }) {
	return (
		<Toolbar aria-label="Formatting" {...props}>
			<ToolbarGroup aria-label="Style">
				<ToolbarButton size="icon-sm" aria-label="Bold">
					B
				</ToolbarButton>
				<ToolbarButton size="icon-sm" aria-label="Italic">
					I
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarSeparator />
			<ToolbarButton disabled>Share</ToolbarButton>
			<ToolbarLink href="/help">Help</ToolbarLink>
		</Toolbar>
	)
}

describe("Toolbar", () => {
	it("is one toolbar with no axe violations", async () => {
		const { container } = renderWithProviders(<Formatting />)
		const bar = screen.getByRole("toolbar", { name: "Formatting" })
		expect(bar).toHaveAttribute("aria-orientation", "horizontal")
		expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical")
		expect((await axe(container)).violations).toEqual([])
	})

	it("takes one tab stop and moves between items with the arrow keys", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<>
				<Formatting />
				<button type="button">After</button>
			</>,
		)
		await user.tab()
		expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus()
		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus()
		// Disabled items stay reachable so the row does not silently shrink.
		await user.keyboard("{ArrowRight}")
		const share = screen.getByRole("button", { name: "Share" })
		expect(share).toHaveFocus()
		expect(share).toHaveAttribute("aria-disabled", "true")
		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("link", { name: "Help" })).toHaveFocus()
		// Loops back to the start by default.
		await user.keyboard("{ArrowRight}")
		expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus()
		// One tab leaves the whole toolbar.
		await user.tab()
		expect(screen.getByRole("button", { name: "After" })).toHaveFocus()
	})

	it("uses up/down when vertical", async () => {
		const user = userEvent.setup()
		renderWithProviders(<Formatting orientation="vertical" />)
		expect(screen.getByRole("toolbar")).toHaveAttribute("aria-orientation", "vertical")
		expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal")
		await user.tab()
		await user.keyboard("{ArrowDown}")
		expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus()
	})

	it("does not fire a disabled button", async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		renderWithProviders(
			<Toolbar aria-label="Actions">
				<ToolbarButton disabled onClick={onClick}>
					Delete
				</ToolbarButton>
			</Toolbar>,
		)
		await user.click(screen.getByRole("button", { name: "Delete" }))
		expect(onClick).not.toHaveBeenCalled()
	})

	it("styles buttons with the shared ghost button variants and the register's type", () => {
		renderWithProviders(
			<Density value="compact">
				<Toolbar aria-label="Canvas">
					<ToolbarButton size="icon-xs" aria-label="Zoom in">
						+
					</ToolbarButton>
				</Toolbar>
			</Density>,
		)
		const btn = screen.getByRole("button", { name: "Zoom in" })
		expect(btn.className).toContain("hover:bg-accent")
		expect(btn.className).toContain("h-(--control-xs)")
		expect(btn.className).toContain("text-ui-md")
	})

	it("joins a ToggleGroup into the same roving focus", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<Toolbar aria-label="Editor">
				<ToggleGroup aria-label="Alignment" defaultValue={["left"]}>
					<ToolbarButton render={<Toggle value="left" />}>Left</ToolbarButton>
					<ToolbarButton render={<Toggle value="center" />}>Center</ToolbarButton>
				</ToggleGroup>
				<ToolbarSeparator />
				<ToolbarButton>Undo</ToolbarButton>
			</Toolbar>,
		)
		await user.tab()
		await user.keyboard("{ArrowRight}{ArrowRight}")
		expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus()
		await user.keyboard("{ArrowLeft}")
		const center = screen.getByRole("button", { name: "Center" })
		expect(center).toHaveFocus()
		await user.keyboard(" ")
		expect(center).toHaveAttribute("aria-pressed", "true")
		expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false")
	})

	it("renders the input as a Sable Input that types and is reachable by arrow", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<Toolbar aria-label="Search bar">
				<ToolbarButton>Filter</ToolbarButton>
				<ToolbarInput aria-label="Search" />
			</Toolbar>,
		)
		await user.tab()
		await user.keyboard("{ArrowRight}")
		const field = screen.getByRole("textbox", { name: "Search" })
		expect(field).toHaveFocus()
		expect(field.className).toContain("h-(--control-sm)")
		await user.keyboard("abc")
		expect(field).toHaveValue("abc")
	})

	it("composes a menu trigger as a toolbar item", async () => {
		const user = userEvent.setup()
		renderWithProviders(
			<Toolbar aria-label="App">
				<ToolbarButton>Save</ToolbarButton>
				<Menu>
					<ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>
					<MenuContent>
						<MenuItem>Zoom to fit</MenuItem>
					</MenuContent>
				</Menu>
			</Toolbar>,
		)
		await user.tab()
		await user.keyboard("{ArrowRight}")
		const trigger = screen.getByRole("button", { name: "View" })
		expect(trigger).toHaveFocus()
		await user.keyboard("{Enter}")
		expect(await screen.findByRole("menuitem", { name: "Zoom to fit" })).toBeInTheDocument()
	})
})
