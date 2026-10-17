import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AreaChart } from "../../components/area-chart"
import { BarChart } from "../../components/bar-chart"
import { LineChart } from "../../components/line-chart"
import { PieChart } from "../../components/pie-chart"
import { RadarChart } from "../../components/radar-chart"
import { RadialChart } from "../../components/radial-chart"
import { Sparkline } from "../../components/sparkline"
import { centerValueText } from "./format"
import { arcPath, linePath, rectPath } from "./geometry"
import { bandScale, niceTicks, stack } from "./scale"
import { resolveSeries } from "./types"

const DATA = [
	{ month: "Jan", desktop: 186, mobile: 80 },
	{ month: "Feb", desktop: 305, mobile: 200 },
	{ month: "Mar", desktop: 237, mobile: 120 },
]
const SERIES = [
	{ key: "desktop", label: "Desktop" },
	{ key: "mobile", label: "Mobile" },
]

describe("chart scales", () => {
	it("picks 1-2-5 ticks that cover the data and start at a round number", () => {
		// The count is a target, as in d3: 0–305 at ~5 ticks steps by 50, at ~3 by 100.
		expect(niceTicks(0, 305, 5)).toEqual([0, 50, 100, 150, 200, 250, 300, 350])
		expect(niceTicks(0, 305, 3)).toEqual([0, 100, 200, 300, 400])
		expect(niceTicks(-95, 209, 4)).toEqual([-100, 0, 100, 200, 300])
		expect(niceTicks(0, 0)).toEqual([0, 1])
		expect(niceTicks(0.1, 0.3, 2)).toEqual([0.1, 0.2, 0.3])
	})

	it("stacks positives up and negatives down, and expands to 100%", () => {
		const s = stack([
			[10, -5],
			[30, 5],
		])
		expect(s[0]).toEqual([
			[0, 10],
			[0, -5],
		])
		expect(s[1]).toEqual([
			[10, 40],
			[0, 5],
		])
		const e = stack([[1], [3]], true)
		expect(e[1][0]).toEqual([0.25, 1])
	})

	it("spaces bands evenly with the bars inside them", () => {
		const b = bandScale(4, [0, 100], 0.2, 0)
		expect(b.at(0)).toBe(0)
		expect(b.bandwidth).toBeCloseTo(b.step * 0.8)
		expect(b.at(3) + b.bandwidth).toBeCloseTo(100)
	})
})

describe("centre labels", () => {
	it("writes a number in full up to 9,999 and compact from 10,000, and leaves a string alone", () => {
		expect(centerValueText(9990, "en-US")).toBe("9,990")
		expect(centerValueText(7.25, "en-US")).toBe("7.3")
		expect(centerValueText(10_200, "en-US")).toBe("10.2K")
		expect(centerValueText(102_140, "en-US")).toBe("102.1K")
		expect(centerValueText(1_234_567, "en-US")).toBe("1.2M")
		expect(centerValueText("7.2 GB", "en-US")).toBe("7.2 GB")
	})
})

describe("chart geometry", () => {
	it("keeps the same command structure for the same number of points, so shapes can morph", () => {
		const a = linePath([[0, 0], [10, 5], [20, 2]])
		const b = linePath([[0, 9], [10, 1], [20, 7]])
		expect(a.replace(/[\d.,-]+/g, "")).toBe(b.replace(/[\d.,-]+/g, ""))
		expect(linePath([[0, 0], [10, 5]], "step")).toBe("M0,0L5,0L5,5L10,5")
	})

	it("rounds only the corners asked for, clamped to the bar", () => {
		expect(rectPath(0, 0, 10, 4, [0, 0, 0, 0])).toContain("A0,0")
		expect(rectPath(0, 0, 10, 4, [8, 8, 0, 0])).toContain("A2,2")
	})

	it("draws a full ring as two arcs, since one arc with coincident ends draws nothing", () => {
		expect(arcPath(50, 50, 20, 40, 0, Math.PI * 2).match(/M/g)).toHaveLength(2)
	})

	it("gives series the chart palette in order and lets a colour override", () => {
		const r = resolveSeries([{ key: "a", label: "A" }, { key: "b", label: "B", color: "red" }])
		expect(r[0].colorValue).toBe("var(--chart-1)")
		expect(r[1].colorValue).toBe("red")
	})
})

describe("charts", () => {
	it("carry their data as a captioned table for assistive tech", () => {
		render(<BarChart label="Visitors by device" data={DATA} index="month" series={SERIES} />)
		const chart = screen.getByRole("group", { name: "Visitors by device" })
		expect(chart.getAttribute("aria-roledescription")).toBe("chart")
		const table = screen.getByRole("table", { name: "Visitors by device" })
		expect(table.querySelectorAll("tbody tr")).toHaveLength(3)
		expect(table.textContent).toContain("Feb305200")
	})

	it("step through the data from the keyboard and announce each row", () => {
		render(<LineChart label="Visitors" data={DATA} index="month" series={SERIES} />)
		const chart = screen.getByRole("group", { name: "Visitors" })
		fireEvent.keyDown(chart, { key: "ArrowRight" })
		fireEvent.keyDown(chart, { key: "ArrowRight" })
		expect(document.querySelector("[aria-live]")?.textContent).toBe("Feb: Desktop 305, Mobile 200")
		fireEvent.keyDown(chart, { key: "End" })
		expect(document.querySelector("[aria-live]")?.textContent).toBe("Mar: Desktop 237, Mobile 120")
		fireEvent.keyDown(chart, { key: "Escape" })
		expect(document.querySelector("[aria-live]")?.textContent).toBe("")
	})

	it("is not a tab stop without a tooltip", () => {
		render(<AreaChart label="Visitors" data={DATA} index="month" series={SERIES} tooltip={false} />)
		expect(screen.getByRole("group", { name: "Visitors" }).hasAttribute("tabindex")).toBe(false)
	})

	it("reports 100% stacks as shares in the table", () => {
		render(<AreaChart label="Share" data={[{ m: "Jan", a: 1, b: 3 }]} index="m" series={[{ key: "a", label: "A" }, { key: "b", label: "B" }]} stacked="expand" locale="en-US" />)
		expect(screen.getByRole("table").textContent).toContain("1 (25%)")
	})

	it("pie, radar and radial charts carry their data too", () => {
		render(
			<>
				<PieChart label="Sources" data={[{ s: "Search", v: 3 }, { s: "Direct", v: 1 }]} index="s" valueKey="v" />
				<RadarChart label="Scores" data={[{ k: "Speed", a: 4 }, { k: "Docs", a: 2 }, { k: "Price", a: 5 }]} index="k" series={[{ key: "a", label: "Atlas" }]} />
				<RadialChart label="Goals" data={[{ g: "Move", p: 80 }]} index="g" valueKey="p" max={100} />
			</>,
		)
		expect(screen.getByRole("table", { name: "Sources" }).textContent).toContain("Search3")
		expect(screen.getByRole("table", { name: "Scores" }).textContent).toContain("Price5")
		expect(screen.getByRole("table", { name: "Goals" }).textContent).toContain("Move80")
	})

	it("take a motion level onto the figure, and read animate={false} as subtle", () => {
		const { container } = render(
			<>
				<BarChart label="A" data={DATA} index="month" series={SERIES} motion="subtle" />
				<AreaChart label="B" data={DATA} index="month" series={SERIES} motion="off" />
				<LineChart label="C" data={DATA} index="month" series={SERIES} animate={false} />
				<PieChart label="D" data={[{ s: "Search", v: 3 }]} index="s" valueKey="v" motion="subtle" />
				<RadarChart label="E" data={[{ k: "Speed", a: 4 }]} index="k" series={[{ key: "a", label: "Atlas" }]} motion="off" />
				<RadialChart label="F" data={[{ g: "Move", p: 80 }]} index="g" valueKey="p" motion="subtle" />
				<LineChart label="G" data={DATA} index="month" series={SERIES} />
			</>,
		)
		const figures = [...container.querySelectorAll("figure")]
		expect(figures.map((f) => f.getAttribute("data-motion"))).toEqual(["subtle", "off", "subtle", "subtle", "off", "subtle", null])
		// Below full the arrival does not wait for the viewport: the finished chart shows at once.
		expect(figures[0].getAttribute("data-reveal")).toBe("in")
		const { container: spark } = render(<Sparkline label="Revenue" data={[1, 2]} motion="subtle" />)
		expect(spark.querySelector("svg")?.getAttribute("data-motion")).toBe("subtle")
		expect(spark.querySelector("svg")?.getAttribute("data-reveal")).toBe("in")
	})

	it("sparkline speaks its range", () => {
		render(<Sparkline label="Revenue" data={[3, 9, 1, 6]} locale="en-US" />)
		expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Revenue: from 3 to 6, low 1, high 9")
	})

	it("sparkline lines span their own range; bars keep zero", () => {
		const ys = (d: string) => [...d.matchAll(/[ML]?(-?[\d.]+),(-?[\d.]+)/g)].map((m) => Number(m[2]))
		const { container, rerender } = render(<Sparkline label="Revenue" data={[12, 26, 19]} animate={false} />)
		const line = ys(container.querySelector("path")?.getAttribute("d") ?? "")
		// Inset 2 of 32 top and bottom: the low point sits at the bottom, not mid-box.
		expect(Math.min(...line)).toBeCloseTo(2)
		expect(Math.max(...line)).toBeCloseTo(30)
		rerender(<Sparkline label="Flat" data={[5, 5, 5]} animate={false} />)
		expect(ys(container.querySelector("path")?.getAttribute("d") ?? "")[0]).toBeCloseTo(16)
		rerender(<Sparkline label="Signups" data={[12, 26]} variant="bar" animate={false} />)
		const bar = container.querySelector("rect")
		expect(Number(bar?.getAttribute("y")) + Number(bar?.getAttribute("height"))).toBeCloseTo(30)
		expect(Number(bar?.getAttribute("height"))).toBeGreaterThan(10)
	})
})
