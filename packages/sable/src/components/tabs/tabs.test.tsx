import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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
		expect(screen.getByRole("tablist")).toHaveClass("border-b")
		expect(screen.getByRole("tab", { name: "Preview" })).toHaveClass("border-b-2")
	})

	it("pill variant drops the rule, fills the active tab, and trims the label", () => {
		render(<Example variant="pill" />)
		expect(screen.getByRole("tablist")).not.toHaveClass("border-b")
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
		expect(list.className).toContain("[[data-workspace-bar]_&]:border-b-0")
		expect(list.className).toContain("[[data-workspace-bar]_&]:self-stretch")
		expect(screen.getByRole("tab").className).toContain("[[data-workspace-bar]_&]:h-full")
	})
})
