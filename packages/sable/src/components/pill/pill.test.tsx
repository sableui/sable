import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Pill } from "./pill"

describe("Pill", () => {
	it("rests on the secondary surface and lifts onto the primary when selected", () => {
		render(
			<>
				<Pill>All</Pill>
				<Pill selected>Mine</Pill>
			</>,
		)
		expect(screen.getByRole("button", { name: "All" }).className).toContain("bg-secondary")
		const selected = screen.getByRole("button", { name: "Mine" })
		expect(selected.className).toContain("bg-primary")
		expect(selected).toHaveAttribute("aria-pressed", "true")
	})

	it("colours a palette family as a category: a wash at rest, the solid colour when chosen", () => {
		render(
			<>
				<Pill tone="blue">Design</Pill>
				<Pill tone="blue" selected>
					Research
				</Pill>
			</>,
		)
		const rest = screen.getByRole("button", { name: "Design" })
		expect(rest.dataset.palette).toBe("blue")
		expect(rest.className).toContain("bg-palette-wash")
		expect(rest.className).not.toContain("bg-secondary")
		const chosen = screen.getByRole("button", { name: "Research" })
		expect(chosen.className).toContain("bg-palette-solid")
		expect(chosen.className).not.toContain("bg-primary")
	})
})

describe("Pill size ladder", () => {
	it.each([
		["lg", "h-(--control-sm)"],
		["md", "h-(--control-xs)"],
	] as const)("%s reads the control ladder for its height, never a literal", (size, ladder) => {
		render(<Pill size={size}>All</Pill>)
		const heights = [...screen.getByRole("button", { name: "All" }).classList].filter((name) => name.startsWith("h-"))
		expect(heights).toEqual([ladder])
	})

	it("sm is the one fixed height: the 24px target floor, which a compact ladder must not shrink", () => {
		render(<Pill size="sm">All</Pill>)
		const heights = [...screen.getByRole("button", { name: "All" }).classList].filter((name) => name.startsWith("h-"))
		expect(heights).toEqual(["h-6"])
	})

	it("lg shares --control-sm with SearchInput sm and Button sm, the toolbar rung", () => {
		render(<Pill size="lg">All</Pill>)
		expect(screen.getByRole("button", { name: "All" })).toHaveClass("h-(--control-sm)", "text-label-lg")
	})
})
