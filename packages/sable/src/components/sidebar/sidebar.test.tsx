import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppShellFrameProvider } from "../app-shell/app-shell-frame"
import { Sidebar, SidebarBrand, SidebarHeader, SidebarItem, SidebarNav } from "./sidebar"

describe("Sidebar / SidebarItem", () => {
	it("renders an expanded item with its label, icon, and active state", () => {
		render(
			<Sidebar>
				<SidebarNav>
					<SidebarItem icon={<span data-testid="icon" />} label="Home" active />
				</SidebarNav>
			</Sidebar>,
		)
		const item = screen.getByRole("button", { name: "Home" })
		expect(item).toHaveAttribute("aria-current", "page")
		expect(screen.getByText("Home")).toBeInTheDocument()
		expect(screen.getByTestId("icon")).toBeInTheDocument()
	})

	it("collapses to an icon-only row — accessible name kept, inline label hidden", () => {
		render(
			<Sidebar collapsed>
				<SidebarNav>
					<SidebarItem icon={<span data-testid="icon" />} label="Home" />
				</SidebarNav>
			</Sidebar>,
		)
		// Accessible name comes from the string label; the inline text is gone.
		expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument()
		expect(screen.queryByText("Home")).not.toBeInTheDocument()
		expect(screen.getByTestId("icon")).toBeInTheDocument()
	})

	it("drops item icons in a text-only rail (icons={false})", () => {
		render(
			<Sidebar icons={false}>
				<SidebarNav>
					<SidebarItem icon={<span data-testid="icon" />} label="Home" />
				</SidebarNav>
			</Sidebar>,
		)
		expect(screen.queryByTestId("icon")).not.toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument()
		expect(screen.getByText("Home")).toBeInTheDocument()
	})

	it("is router-agnostic via render (renders a link)", () => {
		render(
			<Sidebar>
				<SidebarNav>
					<SidebarItem label="Home" render={<a href="/home" />} />
				</SidebarNav>
			</Sidebar>,
		)
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
			"href",
			"/home",
		)
	})

	it("is responsive chrome by default, and always visible as variant=inline", () => {
		const { container, rerender } = render(<Sidebar><SidebarNav /></Sidebar>)
		const aside = container.querySelector("aside") as HTMLElement
		expect(aside).toHaveClass("hidden", "lg:flex", "lg:sticky")
		rerender(<Sidebar variant="inline"><SidebarNav /></Sidebar>)
		expect(aside).toHaveClass("flex", "h-full")
		expect(aside).not.toHaveClass("hidden")
		expect(aside).not.toHaveClass("lg:sticky")
		expect(aside).toHaveAttribute("data-variant", "inline")
	})

	it("grows to hold a second row instead of clipping it at a fixed height", () => {
		render(
			<Sidebar variant="inline">
				<SidebarHeader>S</SidebarHeader>
			</Sidebar>,
		)
		const header = screen.getByText("S")
		expect(header).toHaveClass("min-h-16", "flex-wrap")
		expect(header).not.toHaveClass("h-16")
	})

	it("centres the header on the icon axis when collapsed", () => {
		render(
			<Sidebar collapsed variant="inline">
				<SidebarHeader>S</SidebarHeader>
			</Sidebar>,
		)
		expect(screen.getByText("S")).toHaveClass("justify-center", "px-0")
	})
})

describe("SidebarBrand", () => {
	it("sits on the item grid: same inset, gap and icon slot as a SidebarItem", () => {
		render(
			<Sidebar>
				<SidebarHeader>
					<SidebarBrand mark={<span data-testid="mark" />} label="Undertow" render={<a href="/" />} />
				</SidebarHeader>
				<SidebarNav>
					<SidebarItem icon={<span data-testid="icon" />} label="Home" />
				</SidebarNav>
			</Sidebar>,
		)
		const brand = screen.getByRole("link", { name: "Undertow" })
		const item = screen.getByRole("button", { name: "Home" })
		for (const cls of ["px-3", "gap-3"]) {
			expect(brand).toHaveClass(cls)
			expect(item).toHaveClass(cls)
		}
		// The mark's slot is the icon's slot, class for class.
		expect(screen.getByTestId("mark").parentElement?.className).toBe(screen.getByTestId("icon").parentElement?.className)
	})

	it("collapses to the mark, still named by its label", () => {
		render(
			<Sidebar collapsed>
				<SidebarHeader>
					<SidebarBrand mark={<span data-testid="mark" />} label="Undertow" render={<a href="/" />} />
				</SidebarHeader>
			</Sidebar>,
		)
		const brand = screen.getByRole("link", { name: "Undertow" })
		expect(brand).toContainElement(screen.getByTestId("mark"))
		expect(brand).not.toHaveTextContent("Undertow")
	})

	it("paints its own surface by default, and the page's with surface=\"page\"", () => {
		const { container, rerender } = render(<Sidebar><SidebarNav /></Sidebar>)
		const rail = container.querySelector("aside")!
		expect(rail).toHaveAttribute("data-surface", "rail")
		expect(rail.className).toContain("border-r")
		// The rail re-points the page tokens at its own…
		expect(rail.className).toContain("[--background:var(--sidebar)]")

		rerender(<Sidebar surface="page"><SidebarNav /></Sidebar>)
		expect(rail).toHaveAttribute("data-surface", "page")
		expect(rail.className).not.toContain("border-r")
		// …and on the page surface the reverse, never both (a token cycle).
		expect(rail.className).toContain("[--sidebar:var(--background)]")
		expect(rail.className).not.toContain("[--background:var(--sidebar)]")
	})

	it("inside an inset AppShell's sidebar slot, drops its border and fills the row from lg", () => {
		const { container, rerender } = render(
			<AppShellFrameProvider frame="inset">
				<Sidebar><SidebarNav /></Sidebar>
			</AppShellFrameProvider>,
		)
		const rail = container.querySelector("aside")!
		expect(rail).toHaveAttribute("data-frame", "inset")
		// The border stays below lg (where an inline rail can still show) and goes from lg.
		expect(rail).toHaveClass("border-r", "lg:border-r-0", "lg:h-auto", "lg:self-stretch")
		expect(rail.className).not.toContain("lg:h-[calc(100vh")

		rerender(
			<AppShellFrameProvider frame="inset">
				<Sidebar surface="page"><SidebarNav /></Sidebar>
			</AppShellFrameProvider>,
		)
		expect(rail.className).not.toContain("border-r")
		expect(rail).toHaveClass("lg:self-stretch")

		// A flush frame is today's rail exactly.
		rerender(
			<AppShellFrameProvider frame="flush">
				<Sidebar><SidebarNav /></Sidebar>
			</AppShellFrameProvider>,
		)
		expect(rail).not.toHaveAttribute("data-frame")
		expect(rail).toHaveClass("lg:self-start")
		expect(rail.className).not.toContain("lg:border-r-0")
	})
})

describe("Sidebar label fade", () => {
	const label = () => screen.getByText("Home")
	const rail = (collapsed: boolean) => (
		<Sidebar collapsed={collapsed}>
			<SidebarNav>
				<SidebarItem icon={<span />} label="Home" />
			</SidebarNav>
		</Sidebar>
	)

	it("shows an expanded rail's labels at rest on first paint — @starting-style would fade them in on load", () => {
		render(rail(false))
		expect(label().className).not.toContain("starting:opacity-0")
	})

	it("fades labels in when the rail reopens after a collapse", () => {
		const view = render(rail(false))
		view.rerender(rail(true))
		expect(screen.queryByText("Home")).not.toBeInTheDocument()
		view.rerender(rail(false))
		expect(label().className).toContain("starting:opacity-0")
	})
})
