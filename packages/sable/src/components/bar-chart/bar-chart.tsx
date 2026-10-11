import { CartesianChart, type CartesianBaseProps } from "../../lib/chart/cartesian"
import type { ChartTone } from "../../lib/chart/types"

export interface BarChartProps extends CartesianBaseProps {
	/** `vertical` columns rise from the bottom; `horizontal` bars run from the left, for long category names. @default "vertical" */
	orientation?: "vertical" | "horizontal"
	/** Stack the series in one bar, or `"expand"` to show each category as 100%. Unstacked series sit side by side. @default false */
	stacked?: boolean | "expand"
	/** Print each bar's value at its end, or (`"inside"`, horizontal) the category inside the bar too. @default false */
	labels?: boolean | "inside"
	/** Colour by series, or give each category its own tone (one series). @default "series" */
	colorBy?: "series" | "index"
	/** Colour negative values with this tone, so losses read apart from gains. */
	negativeTone?: ChartTone
	/** Corner radius of each bar's far end, in px. Stacks round only the outer segment. @default 4 */
	radius?: number
	/** Maximum thickness of a bar, in px — the band's leftover is air, not a fatter bar. Raise it for a bolder, presentation look. @default 24 */
	barWidth?: number
}

/**
 * Bars comparing amounts across categories — the default chart for "how much
 * of each". Grouped, stacked, 100% stacked, horizontal, labelled or diverging
 * around zero. Bars rise from the baseline in sequence as the chart scrolls
 * into view; changing data eases each bar to its new length.
 */
export function BarChart(props: BarChartProps) {
	return <CartesianChart kind="bar" {...props} />
}
BarChart.displayName = "BarChart"
