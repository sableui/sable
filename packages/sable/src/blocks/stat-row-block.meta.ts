import type { BlockMeta } from "../lib/meta"

export const statRowBlockMeta: BlockMeta = {
	name: "StatRowBlock",
	family: "Dashboard",
	kind: "section",
	summary: "A KPI row: four stat cards, each a label, the value in the metric mono tier, and a trend Badge with its comparison note — 2 × 2 on a phone, one row from xl.",
	intent:
		"Reach for this at the top of a dashboard or report, above the tables and charts it summarises. One headline number worth splitting into categories is RevenueBreakdownBlock.",
	notes: [
		"Copied from the DashboardPage page shell's stat row.",
		"Values are `text-mono-xl` — tabular figures, never a heading tier — so the four numbers align digit for digit.",
		"The trend Badge sits with its note in CardContent, so the value keeps the full card width when the row folds to 2 × 2.",
		"Keep it to four. A fifth stat is a sign one of them belongs in a table.",
	],
	a11y: [
		"The trend is stated in text (+8.2%) with an arrow icon; the tone is reinforcement, not the signal.",
		"Each card's label is read before its value, in source order.",
	],
}
