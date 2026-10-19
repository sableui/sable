import { fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { ActivityHeatmap } from "./activity-heatmap"

const DAYS = [
	{ date: "2025-03-03", value: 1 },
	{ date: "2025-03-04", value: 12 },
	{ date: "2025-03-11", value: 4 },
]

const props = {
	label: "Contributions in 2025",
	year: 2025,
	weekStart: 0 as const,
	locale: "en-US",
	data: DAYS,
	unit: { one: "contribution", other: "contributions" },
	motion: "off" as const,
}

const cell = (date: string) => document.querySelector<HTMLElement>(`[data-date="${date}"]`) as HTMLElement

describe("ActivityHeatmap", () => {
	it("is a grid captioned by its label, with weekday and month headers", () => {
		render(<ActivityHeatmap {...props} />)
		const grid = screen.getByRole("grid", { name: "Contributions in 2025" })
		expect(grid.getAttribute("aria-readonly")).toBe("true")
		expect(screen.getAllByRole("rowheader").map((h) => h.textContent)).toEqual([
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		])
		expect(screen.getAllByRole("columnheader")).toHaveLength(12)
		expect(screen.getAllByRole("gridcell")).toHaveLength(365)
	})

	it("names each day with its date and value, and describes its level", () => {
		render(<ActivityHeatmap {...props} />)
		const busy = cell("2025-03-04")
		expect(busy.getAttribute("aria-label")).toBe("Tuesday, March 4, 2025: 12 contributions")
		expect(cell("2025-03-03").getAttribute("aria-label")).toBe("Monday, March 3, 2025: 1 contribution")
		expect(cell("2025-03-05").getAttribute("aria-label")).toBe("Wednesday, March 5, 2025: no contributions")
		const description = document.getElementById(busy.getAttribute("aria-describedby") as string)
		expect(description?.textContent).toBe("High")
	})

	it("has one tab stop, on the latest day with activity", () => {
		render(<ActivityHeatmap {...props} />)
		const stops = screen.getAllByRole("gridcell").filter((c) => c.tabIndex === 0)
		expect(stops).toHaveLength(1)
		expect(stops[0].dataset.date).toBe("2025-03-11")
	})

	it("moves by day and week with the arrow keys, without wrapping", () => {
		render(<ActivityHeatmap {...props} />)
		const start = cell("2025-03-11") // a Tuesday
		start.focus()
		fireEvent.keyDown(start, { key: "ArrowLeft" })
		expect(document.activeElement).toBe(cell("2025-03-04"))
		fireEvent.keyDown(document.activeElement as Element, { key: "ArrowUp" })
		expect(document.activeElement).toBe(cell("2025-03-03"))
		fireEvent.keyDown(document.activeElement as Element, { key: "PageUp" })
		expect(document.activeElement).toBe(cell("2025-03-02")) // Sunday tops the column
		fireEvent.keyDown(document.activeElement as Element, { key: "ArrowUp" })
		expect(document.activeElement).toBe(cell("2025-03-02")) // no wrap into the previous week
		fireEvent.keyDown(document.activeElement as Element, { key: "Home", ctrlKey: true })
		expect(document.activeElement).toBe(cell("2025-01-01"))
		fireEvent.keyDown(document.activeElement as Element, { key: "ArrowLeft" })
		expect(document.activeElement).toBe(cell("2025-01-01")) // nothing before the range
	})

	it("selects with Enter only when onSelectDate is set", () => {
		const onSelectDate = vi.fn()
		const { rerender } = render(<ActivityHeatmap {...props} />)
		fireEvent.keyDown(cell("2025-03-04"), { key: "Enter" })
		expect(cell("2025-03-04").hasAttribute("aria-selected")).toBe(false)
		rerender(<ActivityHeatmap {...props} onSelectDate={onSelectDate} />)
		fireEvent.keyDown(cell("2025-03-04"), { key: "Enter" })
		expect(onSelectDate).toHaveBeenCalledWith("2025-03-04")
		expect(cell("2025-03-04").getAttribute("aria-selected")).toBe("true")
		expect(screen.getByRole("grid").hasAttribute("aria-readonly")).toBe(false)
	})

	it("draws days after today hollow and leaves them out of the grid", () => {
		vi.useFakeTimers({ toFake: ["Date"] })
		vi.setSystemTime(new Date(2025, 5, 15, 12))
		render(<ActivityHeatmap {...props} />)
		expect(cell("2025-06-15")).not.toBeNull()
		expect(cell("2025-06-16")).toBeNull()
		expect(screen.getAllByRole("gridcell")).toHaveLength(166)
		vi.useRealTimers()
	})

	it("colours by category and names the source", () => {
		render(
			<ActivityHeatmap
				{...props}
				levels={2}
				data={[{ date: "2025-03-04", value: 3, category: "both" }]}
				categories={{ github: { label: "GitHub", tone: "success" }, both: { label: "Both", tone: "3" } }}
			/>,
		)
		expect(cell("2025-03-04").getAttribute("aria-label")).toBe("Tuesday, March 4, 2025: 3 contributions, Both")
	})

	it("renders on the server without a window", () => {
		expect(() => renderToString(<ActivityHeatmap {...props} />)).not.toThrow()
	})
})
