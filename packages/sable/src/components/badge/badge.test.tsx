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
				<Badge tone="edition">Soft</Badge>
				<Badge appearance="outline" tone="edition">Outline</Badge>
				<Badge appearance="solid" tone="edition">Solid</Badge>
			</>,
		)
		expect((screen.getByText("Soft").closest(".rounded-full") as HTMLElement).className).toContain("bg-tone-edition/15")
		expect((screen.getByText("Outline").closest(".rounded-full") as HTMLElement).className).toContain("border-tone-edition/50")
		expect((screen.getByText("Solid").closest(".rounded-full") as HTMLElement).className).toContain("text-tone-edition-foreground")
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
