import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SectionRail } from "./section-rail"

const SECTIONS = [
	{ id: "overview", label: "Overview" },
	{ id: "process", label: "Process" },
	{ id: "outcome", label: "Outcome" },
]

/** Mount the sections with fixed tops (jsdom has no layout). */
function mountSections(tops: Record<string, number>) {
	for (const [id, top] of Object.entries(tops)) {
		const section = document.createElement("section")
		section.id = id
		section.getBoundingClientRect = () => ({ top, bottom: top + 400 }) as DOMRect
		document.body.append(section)
	}
}

afterEach(() => {
	for (const section of document.querySelectorAll("section")) section.remove()
})

describe("SectionRail", () => {
	it("renders a named nav of links to each section", () => {
		render(<SectionRail sections={SECTIONS} />)
		expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Process" })).toHaveAttribute("href", "#process")
	})

	it("marks the first section current before any has crossed the reading line", () => {
		mountSections({ overview: 600, process: 1200, outcome: 1800 })
		render(<SectionRail sections={SECTIONS} />)
		expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "location")
	})

	it("follows the last section whose top has crossed the reading line", () => {
		mountSections({ overview: -900, process: 100, outcome: 700 })
		render(<SectionRail sections={SECTIONS} />)
		expect(screen.getByRole("link", { name: "Process" })).toHaveAttribute("aria-current", "location")
		expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current")
	})

	it("shows a controlled value over the scroll position", () => {
		mountSections({ overview: -900, process: 100, outcome: 700 })
		render(<SectionRail sections={SECTIONS} value="outcome" />)
		expect(screen.getByRole("link", { name: "Outcome" })).toHaveAttribute("aria-current", "location")
	})

	it("scrolls to a picked section and reports it", () => {
		mountSections({ overview: 0, process: 600, outcome: 1200 })
		const onValueChange = vi.fn()
		render(<SectionRail sections={SECTIONS} onValueChange={onValueChange} />)
		const target = document.getElementById("outcome") as HTMLElement
		const scrollIntoView = vi.fn()
		target.scrollIntoView = scrollIntoView
		act(() => {
			fireEvent.click(screen.getByRole("link", { name: "Outcome" }))
		})
		expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }))
		expect(onValueChange).toHaveBeenCalledWith("outcome")
		expect(screen.getByRole("link", { name: "Outcome" })).toHaveAttribute("aria-current", "location")
		expect(window.location.hash).toBe("#outcome")
	})

	it("scrolls only the root when one is given, never the page around it", () => {
		mountSections({ overview: 0, process: 600, outcome: 1200 })
		const scroller = document.createElement("div")
		scroller.getBoundingClientRect = () => ({ top: 100 }) as DOMRect
		const scrollTo = vi.fn()
		scroller.scrollTo = scrollTo as typeof scroller.scrollTo
		document.body.append(scroller)
		const target = document.getElementById("outcome") as HTMLElement
		const scrollIntoView = vi.fn()
		target.scrollIntoView = scrollIntoView
		const hash = window.location.hash
		render(<SectionRail sections={SECTIONS} root={{ current: scroller }} />)
		act(() => {
			fireEvent.click(screen.getByRole("link", { name: "Outcome" }))
		})
		expect(scrollIntoView).not.toHaveBeenCalled()
		expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1100 }))
		expect(window.location.hash).toBe(hash)
		scroller.remove()
	})

	it("moves focus into the section on a keyboard activation", () => {
		mountSections({ overview: 0, process: 600, outcome: 1200 })
		render(<SectionRail sections={SECTIONS} />)
		act(() => {
			// A keyboard-fired click carries detail 0.
			fireEvent.click(screen.getByRole("link", { name: "Process" }), { detail: 0 })
		})
		expect(document.activeElement).toBe(document.getElementById("process"))
	})

	it("leaves modified clicks to the browser", () => {
		mountSections({ overview: 0, process: 600, outcome: 1200 })
		render(<SectionRail sections={SECTIONS} />)
		const target = document.getElementById("process") as HTMLElement
		const scrollIntoView = vi.fn()
		target.scrollIntoView = scrollIntoView
		fireEvent.click(screen.getByRole("link", { name: "Process" }), { metaKey: true })
		expect(scrollIntoView).not.toHaveBeenCalled()
	})

	it("takes a landmark name of its own", () => {
		render(<SectionRail sections={SECTIONS} side="right" aria-label="Chapters" />)
		expect(screen.getByRole("navigation", { name: "Chapters" })).toBeInTheDocument()
	})
})
