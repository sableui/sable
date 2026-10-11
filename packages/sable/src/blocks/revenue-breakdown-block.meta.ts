import type { BlockMeta } from "../lib/meta"

export const revenueBreakdownBlockMeta: BlockMeta = {
	name: "RevenueBreakdownBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A stat card with a breakdown: the KPI in the metric mono tier, its trend Badge, a SegmentedBar of how the total divides, and a StatusDot legend.",
	intent:
		"Reach for this when a headline number is worth splitting into a few categories — revenue by product, storage by type, tickets by priority. A plain KPI with no split is a smaller stat card (see DashboardPage's stat row).",
	notes: [
		"The value is `text-mono-xl` — tabular figures, never a heading tier — and the label above it is CardDescription.",
		"The legend reflows from two columns to one by measuring in em, so larger type or a narrower card never truncates a label.",
		"Each category keeps the same tone in the bar and its legend dot; reuse those tones wherever the category appears.",
	],
	a11y: [
		"The SegmentedBar is one image whose name reads every share; the legend repeats it visually and is aria-hidden so it is not announced twice.",
		"The trend Badge states the change as text (+8.2%), not by colour.",
	],
}
