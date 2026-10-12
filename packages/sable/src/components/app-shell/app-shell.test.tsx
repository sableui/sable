import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppHeader } from "../app-header"
import { BottomNav, BottomNavItem } from "../bottom-nav"
import { PageHeader } from "../page-header"
import { Sidebar, SidebarItem, SidebarNav } from "../sidebar"
import { AppShell } from "./app-shell"

describe("AppShell", () => {
	it("renders all slots and a skip link to #main-content", () => {
		render(
			<AppShell
				banners={<div>banner</div>}
				header={<AppHeader title="Studio" />}
				sidebar={
					<Sidebar>
						<SidebarNav>
							<SidebarItem label="Home" active />
						</SidebarNav>
					</Sidebar>
				}
				bottomNav={
					<BottomNav>
						<BottomNavItem label="Home" active />
					</BottomNav>
				}
				overlays={<div>fab</div>}
			>
				<p>main content</p>
			</AppShell>,
		)
		expect(screen.getByText("banner")).toBeInTheDocument()
		expect(screen.getByText("main content")).toBeInTheDocument()
		expect(screen.getByText("fab")).toBeInTheDocument()
		const skip = screen.getByRole("link", { name: /skip to content/i })
		expect(skip).toHaveAttribute("href", "#main-content")
		expect(document.querySelector("#main-content")?.tagName).toBe("MAIN")
	})

	it("pins the dock after main, above a bottom nav, and lets the sidebar clear it", () => {
		const { container } = render(
			<AppShell
				sidebar={
					<Sidebar>
						<SidebarNav>
							<SidebarItem label="Home" active />
						</SidebarNav>
					</Sidebar>
				}
				bottomNav={
					<BottomNav>
						<BottomNavItem label="Home" active />
					</BottomNav>
				}
				dock={<section aria-label="Player">now playing</section>}
			>
				<p>main content</p>
			</AppShell>,
		)
		const dock = container.querySelector("[data-app-shell-dock]") as HTMLElement
		expect(dock).toContainElement(screen.getByRole("region", { name: "Player" }))
		// In flow and after <main>: reached after the page content, no reserved space needed.
		expect(screen.getByRole("main").compareDocumentPosition(dock) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(dock).toHaveClass("sticky")
		expect(dock.className).toContain("bottom-[calc(var(--nav-height)")
		expect(dock).toHaveClass("lg:bottom-0")
		expect(container.innerHTML).toContain("lg:h-[calc(100vh-var(--dock-height,0px))]")
	})

	it("sticks the dock to the very bottom when there is no bottom nav", () => {
		const { container } = render(<AppShell dock={<div>bar</div>}>x</AppShell>)
		const dock = container.querySelector("[data-app-shell-dock]") as HTMLElement
		expect(dock).toHaveClass("bottom-0")
		expect(dock.className).not.toContain("--nav-height")
	})
})

describe("SidebarItem", () => {
	it("marks the active row with aria-current and renders as a polymorphic element", () => {
		render(
			<SidebarNav>
				<SidebarItem
					label="Notifications"
					active
					render={<a href="/notifications" />}
				/>
			</SidebarNav>,
		)
		const link = screen.getByRole("link", { name: "Notifications" })
		expect(link).toHaveAttribute("aria-current", "page")
		expect(link).toHaveAttribute("href", "/notifications")
	})
})

describe("BottomNavItem", () => {
	it("uses the label as the accessible name and exposes the badge", () => {
		render(
			<BottomNav>
				<BottomNavItem
					label="Notifications"
					active
					badge={<span>3</span>}
					render={<a href="/notifications" />}
				/>
			</BottomNav>,
		)
		const link = screen.getByRole("link", { name: "Notifications" })
		expect(link).toHaveAttribute("aria-current", "page")
		expect(screen.getByText("3")).toBeInTheDocument()
	})
})

describe("AppHeader", () => {
	it("renders leading, title, and actions slots", () => {
		render(
			<AppHeader
				leading={<button type="button">back</button>}
				title="Notifications"
				actions={<button type="button">wallet</button>}
			/>,
		)
		expect(screen.getByText("back")).toBeInTheDocument()
		expect(screen.getByText("Notifications")).toBeInTheDocument()
		expect(screen.getByText("wallet")).toBeInTheDocument()
	})
})

describe("PageHeader", () => {
	it("renders the title as an h1 with description and actions", () => {
		render(
			<PageHeader
				title="Settings"
				description="Manage your account."
				actions={<button type="button">Save</button>}
			/>,
		)
		expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument()
		expect(screen.getByText("Manage your account.")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
	})
})
