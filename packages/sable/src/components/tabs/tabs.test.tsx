import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "./tabs"

function Example({ variant }: { variant?: "underline" | "pill" }) {
	return (
		<Tabs defaultValue="a">
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
