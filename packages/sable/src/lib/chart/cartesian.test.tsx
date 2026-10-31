import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest"
import { AreaChart } from "../../components/area-chart"
import { BarChart } from "../../components/bar-chart"
import { LineChart } from "../../components/line-chart"
import { brokenAreaPath, brokenLinePath } from "./geometry"
import { denseChart } from "./motion"

/*
 * jsdom does no layout, so the plot measures 0 and draws nothing. These tests
 * give it a box: what they prove is the marks and text the chart asks for, and
 * the browser proves how they look.
 */
const PLOT = { width: 600, height: 240 }

let measure: MockInstance
beforeEach(() => {
	measure = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ ...PLOT, top: 0, left: 0, right: 600, bottom: 240, x: 0, y: 0, toJSON: () => ({}) })
})
afterEach(() => {
	measure.mockRestore()
})

const DATA = [
	{ day: "Mon", price: 41000, forecast: null },
	{ day: "Tue", price: 41500, forecast: null },
	{ day: "Wed", price: 42000, forecast: 42000 },
	{ day: "Thu", price: null, forecast: 43000 },
	{ day: "Fri", price: null, forecast: 44000 },
]
const SERIES = [
	{ key: "price", label: "Price" },
	{ key: "forecast", label: "Forecast", dashed: true },
]

const axisLabels = () => [...document.querySelectorAll("svg text")].map((t) => t.textContent)
const seriesLines = () => [...document.querySelectorAll<SVGPathElement>('svg path[fill="none"]')]

describe("the data table", () => {
	it("is clipped by a wrapper, because a table ignores sr-only's height", () => {
		render(<LineChart label="Price" data={DATA} index="day" series={SERIES} />)
		const table = screen.getByRole("table", { name: "Price" })
		expect(table.className).not.toContain("sr-only")
		expect(table.parentElement).toHaveClass("sr-only")
		// The chart still points at the table itself.
		expect(screen.getByRole("group", { name: "Price" }).getAttribute("aria-describedby")).toBe(table.id)
	})
})

describe("missing values", () => {
	it("break the line instead of plunging to zero", () => {
		render(<LineChart label="Price" data={[{ d: "a", v: 10 }, { d: "b", v: 12 }, { d: "c", v: null }, { d: "d", v: 11 }, { d: "e", v: 13 }]} index="d" series={[{ key: "v", label: "V" }]} />)
		const d = seriesLines()[0].getAttribute("d") as string
		expect(d.match(/M/g)).toHaveLength(2)
	})

	it("do not pull a fitted axis down to zero", () => {
		render(<LineChart label="Price" yAxis data={DATA} index="day" series={SERIES} />)
		expect(axisLabels()).not.toContain("0")
	})

	it("leave a series out of the tooltip and the announcement", () => {
		render(<LineChart label="Price" data={DATA} index="day" series={SERIES} />)
		const chart = screen.getByRole("group", { name: "Price" })
		fireEvent.keyDown(chart, { key: "End" })
		expect(document.querySelector("[aria-live]")?.textContent).toBe("Fri: Forecast 44,000")
		fireEvent.keyDown(chart, { key: "Home" })
		expect(document.querySelector("[aria-live]")?.textContent).toBe("Mon: Price 41,000")
	})

	it("read as a dash in the data table, not as a measured zero", () => {
		render(<LineChart label="Price" data={DATA} index="day" series={SERIES} />)
		expect(screen.getByRole("table").textContent).toContain("Thu—43,000")
	})

	it("draw no bar", () => {
		const { container } = render(<BarChart label="Sales" data={[{ d: "a", v: 4 }, { d: "b", v: null }]} index="d" series={[{ key: "v", label: "V" }]} />)
		expect(container.querySelectorAll("svg path")).toHaveLength(1)
	})

	it("keep a point alone between two gaps visible, as a round cap", () => {
		expect(brokenLinePath([[0, 0], null, [20, 5], null, [40, 2]], "linear")).toBe("M0,0h0M20,5h0M40,2h0")
	})

	it("close one band per unbroken run", () => {
		const d = brokenAreaPath([[0, 0], [10, 0], null, [30, 0], [40, 0]], [[0, 9], [10, 9], [20, 9], [30, 9], [40, 9]], "linear")
		expect(d.match(/Z/g)).toHaveLength(2)
	})
})

describe("the value axis", () => {
	const PRICES = [
		{ d: "a", v: 41000 },
		{ d: "b", v: 44000 },
	]

	it("starts an area at zero unless asked to fit", () => {
		const { unmount } = render(<AreaChart label="P" yAxis data={PRICES} index="d" series={[{ key: "v", label: "V" }]} />)
		expect(axisLabels()).toContain("0")
		unmount()
		render(<AreaChart label="P" yAxis domain="auto" data={PRICES} index="d" series={[{ key: "v", label: "V" }]} />)
		expect(axisLabels()).not.toContain("0")
	})

	it("keeps bars on zero when asked to fit, because a bar's length is its value", () => {
		render(<BarChart label="P" yAxis domain="auto" data={PRICES} index="d" series={[{ key: "v", label: "V" }]} />)
		expect(axisLabels()).toContain("0")
	})

	it("holds a fixed range, with no tick outside it", () => {
		render(<AreaChart label="P" yAxis domain={[40000, 45000]} data={PRICES} index="d" series={[{ key: "v", label: "V" }]} />)
		const ticks = axisLabels().filter((t) => t?.endsWith("K"))
		expect(ticks[0]).toBe("40K")
		expect(ticks.at(-1)).toBe("45K")
	})

	it("formats the axis apart from the tooltip", () => {
		render(<LineChart label="P" yAxis data={PRICES} index="d" series={[{ key: "v", label: "V" }]} valueFormatter={(v) => `$${v.toFixed(2)}`} axisFormatter={(v) => `$${v / 1000}K`} />)
		expect(axisLabels()).toContain("$44K")
		expect(screen.getByRole("table").textContent).toContain("$44000.00")
	})

	it("moves to the right edge and leaves the left of the plot free", () => {
		render(<LineChart label="P" yAxis yAxisSide="right" data={PRICES} index="d" series={[{ key: "v", label: "V" }]} />)
		const tick = [...document.querySelectorAll("svg text")].find((t) => t.textContent === "44K")
		expect(tick?.getAttribute("x")).toBe(String(PLOT.width))
		expect(document.querySelector("svg line")?.getAttribute("x1")).toBe("2")
	})

	it("holds its width across data that changes the labels, so the plot does not slide", () => {
		const plotEdge = (v: number) => {
			const { unmount } = render(<LineChart label="P" yAxis yAxisWidth={48} data={[{ d: "a", v: 0 }, { d: "b", v }]} index="d" series={[{ key: "v", label: "V" }]} />)
			const edge = document.querySelector("svg line")?.getAttribute("x1")
			unmount()
			return edge
		}
		expect(plotEdge(30)).toBe(plotEdge(100000))
	})
})

describe("category labels", () => {
	it("thin to the count asked for, keeping the latest", () => {
		const data = Array.from({ length: 12 }, (_, i) => ({ d: `D${i}`, v: i }))
		render(<LineChart label="P" categoryTicks={3} data={data} index="d" series={[{ key: "v", label: "V" }]} />)
		expect(axisLabels()).toEqual(["D3", "D7", "D11"])
	})
})

describe("reference lines", () => {
	it("mark a category and a value, each with its caption", () => {
		render(<LineChart label="P" data={DATA} index="day" series={SERIES} referenceLines={[{ category: "Wed", label: "Today" }, { value: 43000, label: "Target" }]} />)
		expect(axisLabels()).toEqual(expect.arrayContaining(["Today", "Target"]))
		expect(document.querySelectorAll("svg g[aria-hidden] line")).toHaveLength(2)
	})

	it("draw nothing for a category that is not in the data", () => {
		render(<LineChart label="P" data={DATA} index="day" series={SERIES} referenceLines={[{ category: "Nope" }]} />)
		expect(document.querySelectorAll("svg g[aria-hidden] line")).toHaveLength(0)
	})
})

describe("line and fill options", () => {
	it("dashes a series, which cannot use the draw-on", () => {
		render(<LineChart label="P" data={DATA} index="day" series={SERIES} />)
		const [price, forecast] = seriesLines()
		expect(price.getAttribute("stroke-dasharray")).toBeNull()
		expect(price.getAttribute("pathLength")).toBe("1")
		expect(forecast.getAttribute("stroke-dasharray")).toBe("4 4")
		expect(forecast.getAttribute("pathLength")).toBeNull()
	})

	it("sets the line's weight and the fill's strength", () => {
		const { container } = render(<AreaChart label="P" gradient lineWidth={1.5} fillStrength={0.25} data={DATA} index="day" series={[{ key: "price", label: "P" }]} />)
		expect(seriesLines()[0].getAttribute("stroke-width")).toBe("1.5")
		expect(container.querySelector("stop")?.getAttribute("stop-opacity")).toBe("0.25")
	})
})

describe("hover", () => {
	const STACK = [{ d: "a", x: 1, y: 2 }]
	const LAYERS = [
		{ key: "x", label: "Bottom" },
		{ key: "y", label: "Top" },
	]
	const rowOrder = (text: string) => text.indexOf("Top") < text.indexOf("Bottom")

	it("lists a stack top to bottom, the way the chart reads", () => {
		const { container } = render(<AreaChart label="P" stacked defaultActiveIndex={0} data={STACK} index="d" series={LAYERS} />)
		expect(rowOrder(container.textContent ?? "")).toBe(true)
	})

	it("lists series in order otherwise, and takes an explicit order", () => {
		const { container, unmount } = render(<LineChart label="P" defaultActiveIndex={0} data={STACK} index="d" series={LAYERS} legend={false} />)
		expect(rowOrder(container.textContent ?? "")).toBe(false)
		unmount()
		const again = render(<LineChart label="P" defaultActiveIndex={0} tooltip={{ order: "reverse" }} data={STACK} index="d" series={LAYERS} legend={false} />)
		expect(rowOrder(again.container.textContent ?? "")).toBe(true)
	})

	const cursor = () => document.querySelector<SVGLineElement>('svg g[style*="translate"] line')

	it("takes a dashed cursor, or none", () => {
		const { unmount } = render(<LineChart label="P" defaultActiveIndex={1} tooltip={{ cursor: "dashed" }} data={DATA} index="day" series={SERIES} />)
		expect(cursor()?.getAttribute("stroke-dasharray")).toBe("2 3")
		unmount()
		render(<LineChart label="P" defaultActiveIndex={1} tooltip={{ cursor: "none" }} data={DATA} index="day" series={SERIES} />)
		expect(cursor()).toBeNull()
	})

	it("glides between spaced positions and tracks directly between dense ones", () => {
		expect(denseChart(600, 12)).toBe(false)
		expect(denseChart(600, 90)).toBe(true)
		expect(denseChart(320, 30)).toBe(true)
		const series = [{ key: "v", label: "V" }]
		const { unmount } = render(<LineChart label="P" defaultActiveIndex={1} data={Array.from({ length: 12 }, (_, i) => ({ d: `${i}`, v: i }))} index="d" series={series} />)
		expect(cursor()?.parentElement?.style.transition).not.toBe("")
		unmount()
		render(<LineChart label="P" defaultActiveIndex={1} data={Array.from({ length: 90 }, (_, i) => ({ d: `${i}`, v: i }))} index="d" series={series} />)
		expect(cursor()?.parentElement?.style.transition).toBe("")
	})
})
