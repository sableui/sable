import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DateTile } from "./date-tile"

describe("DateTile", () => {
	it("renders a <time> with the local calendar day as dateTime", () => {
		// Late evening local time: a UTC-based ISO string would roll to the next day.
		const { container } = render(<DateTile date={new Date(2026, 9, 14, 23, 30)} locale="en-US" />)
		const time = container.querySelector("time")!
		expect(time.getAttribute("datetime")).toBe("2026-10-14")
		expect(time.textContent).toBe("Oct14")
	})

	it("names the month in the given locale", () => {
		// Compared against Intl itself: the exact short form varies with the ICU build.
		const date = new Date(2026, 0, 3)
		const { container } = render(<DateTile date={date} locale="de-DE" />)
		expect(container.textContent).toBe(`${new Intl.DateTimeFormat("de-DE", { month: "short" }).format(date)}3`)
	})

	it("merges className onto the tile", () => {
		const { container } = render(<DateTile date={new Date(2026, 9, 14)} className="w-16" />)
		const time = container.querySelector("time")!
		expect(time.className).toContain("w-16")
		expect(time.className).not.toContain("w-14")
	})
})
