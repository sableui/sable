import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "./badge"

describe("Badge", () => {
	it("defaults to a soft neutral label", () => {
		render(<Badge>Draft</Badge>)
		const badge = screen.getByText("Draft").closest(".rounded-full") as HTMLElement
		expect(badge.className).toContain("bg-secondary")
		expect(badge.className).toContain("px-2.5")
	})

	it("sets appearance and tone independently", () => {
		render(
			<>
				<Badge tone="1">Soft</Badge>
				<Badge appearance="outline" tone="1">Outline</Badge>
				<Badge appearance="solid" tone="1">Solid</Badge>
			</>,
		)
		expect((screen.getByText("Soft").closest(".rounded-full") as HTMLElement).className).toContain("bg-tone-1/15")
		expect((screen.getByText("Outline").closest(".rounded-full") as HTMLElement).className).toContain("border-tone-1/50")
		expect((screen.getByText("Solid").closest(".rounded-full") as HTMLElement).className).toContain("text-tone-1-foreground")
	})

	it("paints a palette family from its slots, in place of the neutral look", () => {
		render(
			<>
				<Badge tone="teal">Research</Badge>
				<Badge tone="pink" appearance="solid" dot>
					Launch
				</Badge>
			</>,
		)
		const soft = screen.getByText("Research").closest(".rounded-full") as HTMLElement
		expect(soft.dataset.palette).toBe("teal")
		expect(soft.className).toContain("bg-palette-wash")
		expect(soft.className).not.toContain("bg-secondary")
		const solid = screen.getByText("Launch").closest(".rounded-full") as HTMLElement
		expect(solid.className).toContain("bg-palette-solid")
		expect(solid.querySelector("[aria-hidden]")?.className).toContain("bg-palette-dot")
	})

	it("draws on media with overlay", () => {
		render(<Badge appearance="overlay">3 images</Badge>)
		expect((screen.getByText("3 images").closest(".rounded-full") as HTMLElement).className).toContain("bg-overlay/85")
	})

	it("is a padding-free status line with plain and dot", () => {
		const { container } = render(<Badge appearance="plain" tone="success" dot>Ready</Badge>)
		const badge = container.firstElementChild as HTMLElement
		expect(badge.className).not.toContain("px-2.5")
		// The dot takes the badge's tone, and replaces any icon.
		expect(badge.querySelector(".bg-success")).not.toBeNull()
	})
})
