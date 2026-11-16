import { describe, expect, it } from "vitest"
import { renderWithProviders } from "../../test/render"
import { Calendar } from "./calendar"

describe("Calendar months layout", () => {
	it("wraps months by the room it has, never by a viewport breakpoint", () => {
		// The bug: `sm:flex-row` keyed off the VIEWPORT, so a two-month calendar in
		// a narrow popover on a wide screen forced both months into one row.
		const { container } = renderWithProviders(<Calendar numberOfMonths={2} defaultMonth={new Date(2026, 0, 1)} />)
		const grids = container.querySelectorAll('[role="grid"]')
		expect(grids).toHaveLength(2)
		const months = grids[0].closest("[class*=flex-wrap]") as HTMLElement
		expect(months).not.toBeNull()
		expect(months.className).not.toMatch(/\bsm:/)
		// Each month keeps its own width as its basis, which is what lets the
		// second one wrap instead of both shrinking to fit one row.
		const month = grids[0].parentElement as HTMLElement
		expect(month).toHaveClass("basis-auto", "flex-1", "min-w-0")
	})
})
