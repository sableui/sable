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

	it("defaults to the flush frame: the document scrolls and the rail keeps its border", () => {
		const { container } = render(
			<AppShell
				sidebar={
					<Sidebar>
						<SidebarNav>
							<SidebarItem label="Home" active />
						</SidebarNav>
					</Sidebar>
				}
			>
				x
			</AppShell>,
		)
		const shell = container.firstElementChild as HTMLElement
		const main = screen.getByRole("main")
		const rail = container.querySelector("aside") as HTMLElement
		expect(shell).not.toHaveAttribute("data-frame")
		expect(shell).toHaveClass("min-h-screen")
		expect(shell.className).not.toContain("lg:bg-shell-ground")
		expect(main.className).not.toContain("overflow-y-auto")
		expect(main).not.toHaveAttribute("tabindex")
		expect(rail).not.toHaveAttribute("data-frame")
		expect(rail).toHaveClass("border-r", "lg:self-start")
		expect(rail.className).not.toContain("lg:border-r-0")
	})

	it("frame=inset paints the rail ground and makes main a rounded scroll panel from lg", () => {
		const { container } = render(
			<AppShell
				frame="inset"
				sidebar={
					<Sidebar>
						<SidebarNav>
							<SidebarItem label="Home" active />
						</SidebarNav>
					</Sidebar>
				}
				dock={<div>bar</div>}
			>
				<p>main content</p>
			</AppShell>,
		)
		const shell = container.firstElementChild as HTMLElement
		expect(shell).toHaveAttribute("data-frame", "inset")
		expect(shell).toHaveClass("lg:h-dvh", "lg:min-h-0", "lg:bg-shell-ground")

		const main = screen.getByRole("main")
		expect(main).toHaveAttribute("id", "main-content")
		// The scroll container, with a scrollbar policy (rule 5) and focusable for the skip link.
		expect(main).toHaveClass("lg:overflow-y-auto", "scrollbar-quiet")
		expect(main).toHaveAttribute("tabindex", "-1")
		expect(main).toHaveClass("lg:rounded-lg", "lg:border", "lg:bg-background", "lg:m-2", "lg:ms-0")
		expect(main.style.containerType).toBe("inline-size")

		// The rail in the slot stretches to the row and drops its border.
		const rail = container.querySelector("aside") as HTMLElement
		expect(rail).toHaveAttribute("data-frame", "inset")
		expect(rail).toHaveClass("border-r", "lg:border-r-0", "lg:self-stretch", "lg:h-auto")
		// The rail paints the shell's ground, so it and the gap around the panel are one surface.
		expect(rail).toHaveClass("lg:[--sidebar:var(--shell-ground)]")
		expect(rail).not.toHaveClass("lg:self-start")

		// The dock stays in flow after main, so the panel's bottom gap clears it.
		const dock = container.querySelector("[data-app-shell-dock]") as HTMLElement
		expect(main.compareDocumentPosition(dock) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	})

	it("frame=inset with no sidebar insets the panel on every side", () => {
		render(<AppShell frame="inset">x</AppShell>)
		const main = screen.getByRole("main")
		expect(main).toHaveClass("lg:m-2")
		expect(main).not.toHaveClass("lg:ms-0")
	})

	it("frame=inset reaches only the sidebar slot, not a Sidebar in the content", () => {
		const { container } = render(
			<AppShell frame="inset">
				<Sidebar variant="inline">
					<SidebarNav>
						<SidebarItem label="Profile" active />
					</SidebarNav>
				</Sidebar>
			</AppShell>,
		)
		const rail = container.querySelector("aside") as HTMLElement
		expect(rail).not.toHaveAttribute("data-frame")
		expect(rail.className).not.toContain("lg:border-r-0")
	})

	it("frame=inset keeps the mobile bottom-nav reservation below lg", () => {
		render(
			<AppShell
				frame="inset"
				bottomNav={
					<BottomNav>
						<BottomNavItem label="Home" active />
					</BottomNav>
				}
			>
				x
			</AppShell>,
		)
		const main = screen.getByRole("main")
		expect(main.className).toContain("pb-[calc(var(--nav-height)")
		expect(main).toHaveClass("lg:pb-0")
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
				actions={<button type="button">account</button>}
			/>,
		)
		expect(screen.getByText("back")).toBeInTheDocument()
		expect(screen.getByText("Notifications")).toBeInTheDocument()
		expect(screen.getByText("account")).toBeInTheDocument()
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
