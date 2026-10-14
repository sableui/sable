import { render, screen } from "@testing-library/react"
import { createRef } from "react"
import { describe, expect, it } from "vitest"
import { PresentationProvider } from "../../lib/presentation"
import { Button } from "../button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardList, CardTitle } from "./card"

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
			"[&:is(a[href],button)]:hover:outline-border-strong",
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

describe("CardContent flush", () => {
	it("lets the card clip an edge-to-edge table's hover and footer fills to its corners", () => {
		const { container } = render(
			<Card>
				<CardContent flush>
					<div>Table</div>
				</CardContent>
			</Card>,
		)
		const card = container.firstChild as HTMLElement
		expect(card.className).toContain("has-[[data-slot=card-content][data-flush]]:overflow-clip")
		expect(card.querySelector("[data-slot=card-content]")).toHaveAttribute("data-flush")
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

describe("CardHeader", () => {
	it("pads its own bottom when nothing follows it, and leaves the seam to content otherwise", () => {
		// A stat card is a header alone; with pb-0 unconditional its number sat
		// on the card's bottom edge.
		const { container } = render(
			<Card>
				<CardHeader>
					<CardTitle>4.1%</CardTitle>
				</CardHeader>
			</Card>,
		)
		const header = container.querySelector("[data-slot=card-header]")
		expect(header?.className).toContain("pb-0")
		expect(header?.className).toContain("last:pb-[var(--card-p,--spacing(6))]")
	})
})

describe("Card in a sheet (lib/presentation)", () => {
	const actions = (
		<CardFooter actions>
			<Button variant="ghost" size="sm">Skip</Button>
			<Button size="sm">Send</Button>
		</CardFooter>
	)

	it("keeps an action footer a row on a page", () => {
		const { container } = render(actions)
		const footer = container.querySelector("[data-slot=card-footer]") as HTMLElement
		expect(footer.dataset.actions).toBe("row")
		expect(footer.className).not.toContain("flex-col-reverse")
		expect(screen.getByRole("button", { name: "Send" }).className).toContain("h-(--control-sm)")
	})

	it("stacks an action footer in a sheet: full width, primary on top, cta height", () => {
		const { container } = render(<PresentationProvider value="sheet">{actions}</PresentationProvider>)
		const footer = container.querySelector("[data-slot=card-footer]") as HTMLElement
		expect(footer.dataset.actions).toBe("stack")
		expect(footer.className).toContain("flex-col-reverse")
		expect(footer.className).toContain("mt-auto")
		for (const name of ["Skip", "Send"]) {
			const button = screen.getByRole("button", { name })
			expect(button.className).toContain("h-(--control-cta)")
			expect(button.className).not.toContain("h-(--control-sm)")
			expect(button.className).toContain("w-full")
		}
	})

	it("leaves a footer without `actions` alone in a sheet", () => {
		const { container } = render(
			<PresentationProvider value="sheet">
				<CardFooter>
					<Button size="sm">Add task</Button>
				</CardFooter>
			</PresentationProvider>,
		)
		expect((container.querySelector("[data-slot=card-footer]") as HTMLElement).dataset.actions).toBeUndefined()
		expect(screen.getByRole("button").className).toContain("h-(--control-sm)")
	})

	it("bleeds a flat card's padding into the sheet's, and keeps a framed card whole", () => {
		const { container } = render(
			<PresentationProvider value="sheet">
				<Card variant="flat">flat</Card>
				<Card>framed</Card>
			</PresentationProvider>,
		)
		const [flat, framed] = Array.from(container.children) as HTMLElement[]
		expect(flat.style.margin).toBe("calc(var(--card-p) * -1)")
		expect(flat.style.width).toBe("calc(100% + var(--card-p) * 2)")
		expect(framed.style.margin).toBe("")
	})

	it("leaves a card nested in the sheet's card alone: no bleed, its actions stay a row", () => {
		const { container } = render(
			<PresentationProvider value="sheet">
				<Card variant="flat">
					<Card variant="flat" data-testid="inner">
						<CardFooter actions>
							<Button size="sm">Inner</Button>
						</CardFooter>
					</Card>
					<CardFooter actions>
						<Button size="sm">Outer</Button>
					</CardFooter>
				</Card>
			</PresentationProvider>,
		)
		expect(screen.getByTestId("inner").style.margin).toBe("")
		const [inner, outer] = Array.from(container.querySelectorAll("[data-slot=card-footer]")) as HTMLElement[]
		expect(inner.dataset.actions).toBe("row")
		expect(outer.dataset.actions).toBe("stack")
	})
})

describe("CardAction optical alignment", () => {
	it("bleeds a trailing ghost action to the card's content edge", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Top customers</CardTitle>
					<CardAction>
						<Button variant="ghost" size="sm">
							View all
						</Button>
					</CardAction>
				</CardHeader>
			</Card>,
		)
		const button = screen.getByRole("button", { name: "View all" })
		expect(button).toHaveAttribute("data-bleed", "auto")
		expect(button.parentElement).toHaveClass("*:last:data-[bleed=auto]:-me-(--button-pe,var(--button-px))")
	})
})
