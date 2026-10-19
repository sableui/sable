import { describe, expect, it } from "vitest"
import { renderWithProviders, screen } from "../../test/render"
import { Button } from "../button"
import { SectionHeader } from "./section-header"

describe("SectionHeader", () => {
	it("renders an h2 by default, not a second h1", () => {
		renderWithProviders(<SectionHeader title="New releases" />)
		expect(screen.queryByRole("heading", { level: 1 })).toBeNull()
		expect(screen.getByRole("heading", { level: 2, name: "New releases" })).toBeInTheDocument()
	})

	it("takes its level from titleAs and its look from size, independently", () => {
		renderWithProviders(<SectionHeader title="Appears on" titleAs="h3" size="sm" />)
		const heading = screen.getByRole("heading", { level: 3, name: "Appears on" })
		expect(heading).toHaveClass("text-heading-4")
		expect(heading).not.toHaveClass("text-heading-3")
	})

	it("uses the section tier by default", () => {
		renderWithProviders(<SectionHeader title="New releases" />)
		expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-heading-3")
	})

	it("lg sets the major-section tier and a body-md description, for an editorial page", () => {
		const { container } = renderWithProviders(
			<SectionHeader size="lg" title="Selected work" description="Five projects from the last two years." />,
		)
		const heading = screen.getByRole("heading", { level: 2, name: "Selected work" })
		expect(heading).toHaveClass("text-heading-2")
		expect(heading).not.toHaveClass("text-heading-3")
		// heading-1 stays the page title's: one per route.
		expect(heading).not.toHaveClass("text-heading-1")
		const description = screen.getByText("Five projects from the last two years.")
		expect(description).toHaveClass("text-body-md", "max-w-(--measure-prose)")
		expect(description).not.toHaveClass("text-body-sm")
		expect(container.firstChild).toHaveAttribute("data-size", "lg")
		expect(container.firstChild).toHaveClass("gap-3")
	})

	it("keeps md and sm descriptions on body-sm", () => {
		for (const size of ["md", "sm"] as const) {
			const { unmount } = renderWithProviders(<SectionHeader size={size} title="Playback" description="How tracks start" />)
			expect(screen.getByText("How tracks start")).toHaveClass("text-body-sm")
			unmount()
		}
	})

	// The title band is one sm control tall; a heading-2 line can be taller
	// (always under a denser ladder). The title lifts by half the difference so
	// its first line, not its line box's top, lines up with the actions' centre.
	it("keeps actions centred on an lg title's first line", () => {
		renderWithProviders(
			<SectionHeader size="lg" title="Selected work" actions={<Button variant="ghost" size="sm">View all</Button>} />,
		)
		const heading = screen.getByRole("heading", { level: 2 })
		expect(heading).toHaveClass("min-h-(--control-sm)", "items-center", "mt-[min(0px,calc((var(--control-sm)_-_1lh)/2))]")
	})

	it("names the section it heads through titleId", () => {
		renderWithProviders(
			<section aria-labelledby="new-releases">
				<SectionHeader titleId="new-releases" title="New releases" />
			</section>,
		)
		expect(screen.getByRole("region", { name: "New releases" })).toBeInTheDocument()
	})

	it("always gives the title an id, so a section can point at it", () => {
		renderWithProviders(<SectionHeader title="Playback" />)
		expect(screen.getByRole("heading", { name: "Playback" }).id).not.toBe("")
	})

	it("keeps actions on the title row and centres the title on their height", () => {
		renderWithProviders(
			<SectionHeader title="New releases" actions={<button type="button">View all</button>} />,
		)
		const heading = screen.getByRole("heading", { level: 2 })
		expect(heading).toHaveClass("min-h-(--control-sm)")
		expect(heading).not.toHaveClass("truncate")
		// Title and actions share one wrapping row.
		const row = screen.getByRole("button", { name: "View all" }).parentElement?.parentElement
		expect(row).toContainElement(heading)
		expect(row).toHaveClass("flex-wrap")
	})

	it("renders the description only when given", () => {
		const { rerender } = renderWithProviders(<SectionHeader title="Playback" />)
		expect(screen.queryByText("How tracks start")).toBeNull()
		rerender(<SectionHeader title="Playback" description="How tracks start" />)
		expect(screen.getByText("How tracks start")).toHaveClass("text-muted-foreground")
	})

	it("carries no outer spacing, so the surrounding stack owns the rhythm", () => {
		const { container } = renderWithProviders(<SectionHeader title="Playback" />)
		expect((container.firstChild as HTMLElement).className).not.toMatch(/\b(p|m)[btyxse]?-\d/)
	})

	it("aligns a trailing ghost action's label with the content edge, and leaves a filled one's edge", () => {
		renderWithProviders(
			<SectionHeader
				title="Your playlists"
				actions={
					<>
						<Button variant="ghost" size="sm">
							Filter
						</Button>
						<Button size="sm">New playlist</Button>
						<Button variant="ghost" size="sm">
							View all
						</Button>
					</>
				}
			/>,
		)
		const viewAll = screen.getByRole("button", { name: "View all" })
		const actions = viewAll.parentElement as HTMLElement
		// The container asks; only a borderless Button answers (data-bleed="auto").
		// The last one bleeds at the end, the first at the start (which is the
		// edge once the actions wrap beneath the title).
		expect(actions).toHaveClass(
			"*:last:data-[bleed=auto]:-me-(--button-pe,var(--button-px))",
			"*:first:data-[bleed=auto]:-ms-(--button-ps,var(--button-px))",
		)
		expect(viewAll).toHaveAttribute("data-bleed", "auto")
		expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("data-bleed", "auto")
		expect(screen.getByRole("button", { name: "New playlist" })).not.toHaveAttribute("data-bleed")
	})

	it("lets an action opt out of the alignment with bleed=none", () => {
		renderWithProviders(
			<SectionHeader
				title="New releases"
				actions={
					<Button variant="ghost" size="sm" bleed="none">
						View all
					</Button>
				}
			/>,
		)
		// Not "auto", so the container's selector no longer matches it.
		expect(screen.getByRole("button", { name: "View all" })).toHaveAttribute("data-bleed", "none")
	})
})
