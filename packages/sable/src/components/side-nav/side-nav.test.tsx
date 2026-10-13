import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SideNav, SideNavGroup, SideNavItem } from "./side-nav"

describe("SideNav", () => {
	it("renders an item with its label + active state", () => {
		render(
			<SideNav>
				<SideNavItem label="Profile" active />
			</SideNav>,
		)
		expect(screen.getByRole("button", { name: "Profile" })).toHaveAttribute(
			"aria-current",
			"page",
		)
	})

	it("is router-agnostic via render (renders a link)", () => {
		render(
			<SideNav>
				<SideNavItem label="Account" render={<a href="/a" />} />
			</SideNav>,
		)
		expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
			"href",
			"/a",
		)
	})

	it("SideNavGroup renders a section label above its items", () => {
		render(
			<SideNav>
				<SideNavGroup label="Workspace">
					<SideNavItem label="Members" />
				</SideNavGroup>
			</SideNav>,
		)
		expect(screen.getByText("Workspace")).toBeInTheDocument()
		expect(
			screen.getByRole("button", { name: "Members" }),
		).toBeInTheDocument()
	})

	it("can opt active rows into sidebar chrome tokens", () => {
		render(
			<SideNav activeVariant="sidebar">
				<SideNavItem label="Overview" active />
			</SideNav>,
		)
		expect(screen.getByRole("button", { name: "Overview" }).className).toContain(
			"data-[active]:bg-sidebar-accent",
		)
	})

	it("sizes the icon box in the icon's own unit, so a theme's spacing step cannot shrink it", () => {
		render(
			<SideNav>
				<SideNavItem label="Inbox" icon={<svg data-testid="icon" />} />
			</SideNav>,
		)
		const box = screen.getByTestId("icon").parentElement as HTMLElement
		// Icons are 1em: a spacing-scale box (size-5) drifted from them when
		// --spacing was not 4px, and grid centring dropped the overflow downward.
		expect(box).toHaveClass("size-[1em]", "text-xl", "flex", "items-center", "justify-center")
		expect(box.className).not.toMatch(/(^|\s)(size-\d|grid|place-items-center)/)
	})
})
