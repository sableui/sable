import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "./tabs"

function Example({ variant, motion }: { variant?: "underline" | "pill"; motion?: "full" | "subtle" | "off" }) {
	return (
		<Tabs defaultValue="a" motion={motion}>
			<TabsList variant={variant}>
				<TabsTrigger value="a">Preview</TabsTrigger>
				<TabsTrigger value="b">Code</TabsTrigger>
			</TabsList>
			<TabsPanel value="a">A</TabsPanel>
			<TabsPanel value="b">B</TabsPanel>
		</Tabs>
	)
}

describe("Tabs", () => {
	it("draws a divider rule by default", () => {
		render(<Example />)
		// An inset shadow, not a border: the list scrolls, and a scroll container
		// clips at its padding box, which a border sits outside of.
		expect(screen.getByRole("tablist").className).toContain("shadow-[inset_0_-1px_0_var(--border)]")
		expect(screen.getByRole("tab", { name: "Preview" })).toHaveClass("border-b-2")
	})

	it("pill variant drops the rule, fills the active tab, and trims the label", () => {
		render(<Example variant="pill" />)
		expect(screen.getByRole("tablist").className).not.toContain("shadow-[inset")
		const tab = screen.getByRole("tab", { name: "Preview" })
		expect(tab).toHaveClass("data-[active]:bg-muted")
		expect(tab).not.toHaveClass("border-b-2")
		// Cap-height trim centres the label optically in the short pill.
		expect(tab.querySelector(".sable-label-trim")).not.toBeNull()
	})

	it("shows a focus ring in both variants", () => {
		render(<Example variant="pill" />)
		expect(screen.getByRole("tab", { name: "Code" })).toHaveClass("focus-visible:ring-2")
	})
})

describe("Tabs indicator", () => {
	const indicatorOf = () => screen.getByRole("tablist").querySelector<HTMLElement>("[data-tabs-indicator]")

	it("renders one gliding indicator inside the list, without the consumer adding it", () => {
		render(<Example />)
		const indicator = indicatorOf()
		expect(indicator).not.toBeNull()
		expect(indicator).toHaveClass("motion-glide", "h-0.5", "bg-foreground")
		// Decoration: the tab's aria-selected is the state.
		expect(indicator).toHaveAttribute("role", "presentation")
		// First child, so the tabs paint over it in DOM order.
		expect(screen.getByRole("tablist").firstElementChild).toBe(indicator)
	})

	it("positions from Base UI's measured vars on translate, which motion-glide eases", () => {
		render(<Example variant="pill" />)
		const indicator = indicatorOf()
		expect(indicator).toHaveClass(
			"translate-x-(--active-tab-left)",
			"translate-y-(--active-tab-top)",
			"w-(--active-tab-width)",
			"h-(--active-tab-height)",
			"bg-muted",
		)
		// Physical left: the vars are measured physically, so RTL needs no flip.
		expect(indicator).toHaveClass("left-0")
	})

	it("keeps each tab's own mark as the fallback until the indicator is shown", () => {
		// jsdom measures nothing, so Base UI keeps the indicator hidden — exactly
		// the server-render / pre-hydration state the fallback exists for.
		render(<Example />)
		expect(indicatorOf()).toHaveAttribute("hidden")
		expect(screen.getByRole("tab", { name: "Preview" })).toHaveClass("data-[active]:border-foreground", "relative")
		expect(screen.getByRole("tablist").className).toContain(
			"[&:has(>[data-tabs-indicator]:not([hidden]))>[role=tab]]:border-transparent",
		)
	})

	it("fades a changed panel in, but not on first render", () => {
		render(<Example />)
		const panel = screen.getByRole("tabpanel")
		expect(panel).toHaveClass("not-data-[activation-direction=none]:animate-fade-in")
		expect(panel).toHaveAttribute("data-activation-direction", "none")
	})
})

describe("Tabs motion", () => {
	it("sets data-motion on the root only when turned down", () => {
		const { container, rerender } = render(<Example />)
		const root = () => container.firstElementChild!
		expect(root()).not.toHaveAttribute("data-motion")
		rerender(<Example motion="subtle" />)
		expect(root()).toHaveAttribute("data-motion", "subtle")
	})
})

describe("Tabs in a WorkspaceBar", () => {
	it("sits on the bar's hairline instead of drawing a second, shorter rule", async () => {
		const { WorkspaceBar } = await import("../workspace")
		render(
			<WorkspaceBar>
				<Tabs defaultValue="a">
					<TabsList>
						<TabsTrigger value="a">Issues</TabsTrigger>
					</TabsList>
				</Tabs>
			</WorkspaceBar>,
		)
		const list = screen.getByRole("tablist")
		expect(list.closest("[data-workspace-bar]")).not.toBeNull()
		expect(list.className).toContain("[[data-workspace-bar]_&]:shadow-none")
		// The bar does not scroll the list, so the mark can overlap its hairline.
		expect(list.className).toContain("[[data-workspace-bar]_&]:overflow-visible")
		expect(screen.getByRole("tab").className).toContain("[[data-workspace-bar]_&]:-mb-px")
		expect(list.className).toContain("[[data-workspace-bar]_&]:self-stretch")
		expect(screen.getByRole("tab").className).toContain("[[data-workspace-bar]_&]:h-full")
	})
})

describe("Tabs orientation", () => {
	function Vertical({ variant }: { variant?: "underline" | "pill" }) {
		return (
			<Tabs defaultValue="a" orientation="vertical">
				<TabsList variant={variant}>
					<TabsTrigger value="a">General</TabsTrigger>
					<TabsTrigger value="b">Billing</TabsTrigger>
				</TabsList>
				<TabsPanel value="a">A</TabsPanel>
				<TabsPanel value="b">B</TabsPanel>
			</Tabs>
		)
	}

	it("sets the list beside its panels and rules it on the end edge", () => {
		const { container } = render(<Vertical />)
		const root = container.firstElementChild as HTMLElement
		expect(root).toHaveAttribute("data-orientation", "vertical")
		expect(root.className).toContain("data-[orientation=vertical]:flex")
		const list = screen.getByRole("tablist")
		expect(list).toHaveAttribute("aria-orientation", "vertical")
		expect(list.className).toContain("data-[orientation=vertical]:flex-col")
		expect(list.className).toContain("data-[orientation=vertical]:border-e")
		expect(list.className).toContain("data-[orientation=vertical]:shadow-none")
		const tab = screen.getByRole("tab", { name: "General" })
		expect(tab).toHaveAttribute("data-orientation", "vertical")
		expect(tab.className).toContain("data-[orientation=vertical]:border-e-2")
		expect(tab.className).toContain("data-[orientation=vertical]:border-b-0")
		expect(screen.getByRole("tabpanel").className).toContain("data-[orientation=vertical]:pt-0")
	})

	it("moves the underline mark to the end edge and onto the y axis", () => {
		render(<Vertical />)
		const indicator = screen.getByRole("tablist").querySelector("[data-tabs-indicator]") as HTMLElement
		expect(indicator).toHaveAttribute("data-orientation", "vertical")
		expect(indicator.className).toContain("data-[orientation=vertical]:translate-y-(--active-tab-top)")
		expect(indicator.className).toContain("data-[orientation=vertical]:h-(--active-tab-height)")
		expect(indicator.className).toContain("data-[orientation=vertical]:-end-px")
	})
})

describe("Tabs overflow", () => {
	it("scrolls a long horizontal list with no bar, and keeps labels on one line", () => {
		render(<Example />)
		const list = screen.getByRole("tablist")
		expect(list).toHaveClass("overflow-x-auto", "scrollbar-hidden", "max-w-full")
		expect(list.className).toContain("data-[orientation=vertical]:overflow-visible")
		expect(screen.getByRole("tab", { name: "Code" })).toHaveClass("shrink-0", "whitespace-nowrap")
	})

	it("scrolls the list, not the page, to show a newly active tab", async () => {
		const { fireEvent } = await import("@testing-library/react")
		render(<Example />)
		const list = screen.getByRole("tablist")
		const code = screen.getByRole("tab", { name: "Code" })
		// jsdom does no layout: give the list a 100px window over 300px of tabs.
		Object.defineProperty(list, "clientWidth", { configurable: true, value: 100 })
		Object.defineProperty(list, "scrollWidth", { configurable: true, value: 300 })
		Object.defineProperty(code, "offsetLeft", { configurable: true, value: 200 })
		Object.defineProperty(code, "offsetWidth", { configurable: true, value: 80 })
		const scrollTo = vi.fn()
		list.scrollTo = scrollTo as unknown as typeof list.scrollTo
		const page = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {})
		fireEvent.click(code)
		await vi.waitFor(() => expect(scrollTo).toHaveBeenCalled())
		expect(scrollTo.mock.calls.at(-1)?.[0]).toMatchObject({ left: 180 })
		expect(page).not.toHaveBeenCalled()
		page.mockRestore()
	})
})

describe("TabsPanel focus", () => {
	it("shows a ring when keyboard focus lands on it", () => {
		render(<Example />)
		const panel = screen.getByRole("tabpanel")
		expect(panel).toHaveClass("focus-visible:ring-2", "focus-visible:ring-ring")
		expect(panel).not.toHaveClass("focus-visible:ring-0")
	})
})
