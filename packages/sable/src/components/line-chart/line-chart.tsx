import { CartesianChart, type CartesianBaseProps } from "../../lib/chart/cartesian"
import type { ChartCurve } from "../../lib/chart/geometry"

export interface LineChartProps extends CartesianBaseProps {
	/** How the line runs between points. `smooth` never overshoots the data. @default "smooth" */
	curve?: ChartCurve
	/** Mark every data point with a dot. @default false */
	dots?: boolean
	/** Colour the dots by series, or each by its category. @default "series" */
	colorBy?: "series" | "index"
	/** Print each point's value above it. @default false */
	labels?: boolean
}

/**
 * Lines over a sequence — for comparing how two or more measures move, where
 * fills would pile up. Lines draw on as the chart scrolls into view; changing
 * data eases each line from old to new.
 */
export function LineChart(props: LineChartProps) {
	return <CartesianChart kind="line" {...props} />
}
LineChart.displayName = "LineChart"
