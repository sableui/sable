import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { PageHeader } from "./page-header"

describe("PageHeader", () => {
	it("renders the route's h1 by default", () => {
		renderWithProviders(<PageHeader title="Invoices" />)
		expect(screen.getByRole("heading", { level: 1, name: "Invoices" })).toBeInTheDocument()
	})

	it("renders an h2 when the h1 is owned elsewhere", () => {
		renderWithProviders(<PageHeader title="Invoices" titleAs="h2" />)
		expect(screen.queryByRole("heading", { level: 1 })).toBeNull()
		expect(screen.getByRole("heading", { level: 2, name: "Invoices" })).toBeInTheDocument()
	})

	it("holds 20rem for the title before its actions share the row, so a phone title isn't one word a line", () => {
		renderWithProviders(<PageHeader title="Refund for a damaged order" actions={<button type="button">Reply</button>} />)
		const column = screen.getByRole("heading", { level: 1 }).parentElement as HTMLElement
		expect(column).toHaveClass("basis-[min(100%,20rem)]")
		expect(column).not.toHaveClass("basis-48")
	})

	it("wraps the title instead of truncating it", () => {
		renderWithProviders(<PageHeader title="A long page title" actions={<button type="button">Save</button>} />)
		const heading = screen.getByRole("heading", { level: 1 })
		expect(heading).not.toHaveClass("truncate")
		expect(heading).toHaveClass("min-h-(--control-md)")
	})

	it("aligns a ghost back control's glyph with the start edge and a ghost action's with the end", () => {
		renderWithProviders(
			<PageHeader
				title="Invoices"
				back={<Button variant="ghost" size="icon" aria-label="Back" />}
				actions={<Button variant="ghost" size="sm">Export</Button>}
			/>,
		)
		const back = screen.getByRole("button", { name: "Back" })
		expect(back).toHaveAttribute("data-bleed", "auto")
		expect(back.parentElement).toHaveClass("*:first:data-[bleed=auto]:-ms-(--button-ps,var(--button-px))")
		const exportButton = screen.getByRole("button", { name: "Export" })
		expect(exportButton.parentElement).toHaveClass("*:last:data-[bleed=auto]:-me-(--button-pe,var(--button-px))")
	})

	describe("size", () => {
		it("defaults to md: the heading-2 title over a body-sm description", () => {
			const { container } = renderWithProviders(<PageHeader title="Invoices" description="Every charge." />)
			expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-heading-2")
			expect(screen.getByText("Every charge.")).toHaveClass("text-body-sm")
			expect(container.firstChild).toHaveAttribute("data-size", "md")
			expect(container.firstChild).toHaveClass("gap-2", "pb-4")
		})

		it("lg sets a display-tier title over a body-lg lede capped at the prose measure", () => {
			const { container } = renderWithProviders(
				<PageHeader size="lg" title="Field notes" description="Essays on making things slowly." />,
			)
			const heading = screen.getByRole("heading", { level: 1, name: "Field notes" })
			expect(heading).toHaveClass("text-display-lg")
			expect(heading).not.toHaveClass("text-heading-2")
			const lede = screen.getByText("Essays on making things slowly.")
			expect(lede).toHaveClass("text-body-lg", "max-w-(--measure-prose)", "text-muted-foreground")
			expect(lede).not.toHaveClass("text-body-sm")
			// More air for the larger type, still on the spacing scale.
			expect(container.firstChild).toHaveClass("gap-3", "pb-6")
			expect(container.firstChild).not.toHaveClass("gap-2")
		})

		// A display line is taller than a 40px control. Pinned to the row's top,
		// the actions sat high on it; the title now lifts by half the difference
		// (computed from its own 1lh, so a shorter line gets 0) to put its first
		// line's centre on the controls' centre.
		it("keeps a taller title's first line centred on the actions", () => {
			renderWithProviders(
				<PageHeader size="lg" title="Field notes" actions={<Button size="sm">Subscribe</Button>} />,
			)
			const heading = screen.getByRole("heading", { level: 1 })
			expect(heading).toHaveClass("min-h-(--control-md)", "items-center", "mt-[min(0px,calc((var(--control-md)_-_1lh)/2))]")
		})

		it("leaves a title without controls out of the band", () => {
			renderWithProviders(<PageHeader size="lg" title="Field notes" />)
			expect(screen.getByRole("heading", { level: 1 }).className).not.toContain("mt-[")
		})
	})
})
