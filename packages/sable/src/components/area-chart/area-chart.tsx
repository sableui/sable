import { CartesianChart, type CartesianBaseProps } from "../../lib/chart/cartesian"
import type { ChartCurve } from "../../lib/chart/geometry"

export interface AreaChartProps extends CartesianBaseProps {
	/** How the line runs between points. `smooth` never overshoots the data. @default "smooth" */
	curve?: ChartCurve
	/** Stack the series on each other, or `"expand"` to show each category as 100%. @default false */
	stacked?: boolean | "expand"
	/** Fill each area with a fade from its colour to transparent instead of a flat tint. @default false */
	gradient?: boolean
}

/**
 * A trend over a sequence (days, months), filled to the baseline — volume over
 * time at a glance. Series overlap as translucent tints, or stack to show a
 * total and its parts. The line draws on and the fill rises when the chart
 * scrolls into view; changing data eases the shape from old to new.
 */
export function AreaChart(props: AreaChartProps) {
	return <CartesianChart kind="area" {...props} />
}
AreaChart.displayName = "AreaChart"
