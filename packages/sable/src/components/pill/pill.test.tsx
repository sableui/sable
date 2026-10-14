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
