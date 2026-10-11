import type { BlockMeta } from "../lib/meta"

export const trafficTrendBlockMeta: BlockMeta = {
	name: "TrafficTrendBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "20rem", max: "48rem" },
	summary: "A trend card: a stacked gradient AreaChart of two series by day, a time-range ToggleGroup in the header, and a one-line takeaway with its direction in the footer.",
	intent:
		"Reach for this as the headline chart of a dashboard or an analytics section on a landing page. For a single number with a small trend beside it, KpiSparklineBlock is lighter.",
	notes: [
		"Switching the range eases the chart from one shape to the next instead of redrawing it.",
		"The footer states the takeaway in words, so the card says something even before the chart is read.",
		"The tooltip heading spells out the weekday; the axis keeps short dates so they fit.",
	],
	a11y: [
		"The chart's accessible name includes the range showing, and its data table updates with it.",
		"The range control is a labelled ToggleGroup; the chart is one tab stop with arrow-key navigation.",
	],
}
