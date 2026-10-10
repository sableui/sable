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
})
