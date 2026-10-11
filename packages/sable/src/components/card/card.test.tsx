import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"
import { Card, CardContent, CardList, CardTitle } from "./card"

describe("Card density", () => {
	it("defaults to comfortable padding (p-6, on the spacing scale so density moves it)", () => {
		const { container } = render(<Card>x</Card>)
		expect(
			(container.firstChild as HTMLElement).style.getPropertyValue("--card-p"),
		).toBe("calc(var(--spacing) * 6)")
	})

	it("sets compact padding (p-4) on the inherited var", () => {
		const { container } = render(<Card density="compact">x</Card>)
		expect(
			(container.firstChild as HTMLElement).style.getPropertyValue("--card-p"),
		).toBe("calc(var(--spacing) * 4)")
	})

	it("parts pad from the inherited --card-p var", () => {
		const { getByText } = render(
			<Card density="compact">
				<CardContent>body</CardContent>
			</Card>,
		)
		// The part reads the var (resolved to 1rem by inheritance at runtime),
		// falling back to 1.5rem when used without a Card.
		expect(getByText("body").className).toContain("p-[var(--card-p,--spacing(6))]")
	})
})

describe("Card render", () => {
	it("renders a div by default with no interactive hover", () => {
		const { container } = render(<Card>x</Card>)
		const el = container.firstChild as HTMLElement
		expect(el.tagName).toBe("DIV")
		// Hover/motion are gated on the rendered element being a link or button.
		expect(el.className).not.toMatch(/(^| )hover:/)
	})

	it("renders as a link with Card's surface when render is an <a>", () => {
		render(
			<Card render={<a href="/components" />} density="compact">
				Components
			</Card>,
		)
		const link = screen.getByRole("link", { name: "Components" })
		expect(link.getAttribute("href")).toBe("/components")
		expect(link.className).toContain("bg-card")
		expect(link.className).toContain("focus-visible:ring-2")
		expect(link.className).toContain("[&:is(a[href],button)]:motion-interactive")
		expect(link.className).toContain(
			"[&:is(a[href],button)]:hover:border-border-strong",
		)
		expect(link.style.getPropertyValue("--card-p")).toBe("calc(var(--spacing) * 4)")
	})

	it("flat link cards hover with a muted fill instead of a border", () => {
		render(<Card variant="flat" render={<a href="/x" />}>Flat</Card>)
		const link = screen.getByRole("link", { name: "Flat" })
		expect(link.className).toContain("[&:is(a[href],button)]:hover:bg-muted")
		expect(link.className).not.toContain("bg-card")
	})

	it("forwards ref and merges className onto the rendered element", () => {
		const ref = createRef<HTMLDivElement>()
		render(
			<Card ref={ref} render={<button type="button" />} className="h-full">
				Open
			</Card>,
		)
		const button = screen.getByRole("button", { name: "Open" })
		expect(ref.current).toBe(button)
		expect(button.className).toContain("h-full")
	})
})

describe("CardList", () => {
	it("squares full-bleed rows and lets the card clip them to its corners", () => {
		const { container } = render(
			<Card>
				<CardList>
					<div>Row</div>
				</CardList>
			</Card>,
		)
		const card = container.firstChild as HTMLElement
		expect(card.className).toContain("has-data-[slot=card-list]:overflow-clip")
		const list = card.querySelector("[data-slot=card-list]") as HTMLElement
		expect(list.className).toContain("[--entity-radius:0px]")
	})
})

describe("CardTitle", () => {
	it("is a div by default and a real heading when rendered as one", () => {
		const { rerender } = render(<CardTitle>Payouts</CardTitle>)
		expect(screen.queryByRole("heading")).toBeNull()
		rerender(<CardTitle render={<h2 />}>Payouts</CardTitle>)
		const heading = screen.getByRole("heading", { level: 2, name: "Payouts" })
		expect(heading.className).toContain("text-title-lg")
	})
})
