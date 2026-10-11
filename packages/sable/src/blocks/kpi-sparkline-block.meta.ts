import type { BlockMeta } from "../lib/meta"

export const kpiSparklineBlockMeta: BlockMeta = {
	name: "KpiSparklineBlock",
	family: "Dashboard",
	kind: "section",
	summary: "A KPI row with trends: three stat cards, each the value in the metric mono tier, a Sparkline of its last twelve weeks, and the change as a Badge.",
	intent:
		"Reach for this at the top of a dashboard or a landing page's proof section, where each number needs its recent shape. Without the trend, StatRowBlock is calmer; for one headline trend, TrafficTrendBlock.",
	notes: [
		"Each sparkline is coloured by what its measure is, and the change Badge by whether it is good: churn falling is good news in a warning-toned trend.",
		"The sparklines draw on as the row scrolls into view.",
		"One column on a phone, three from sm.",
	],
	a11y: [
		"Each Sparkline is an image named by the measure and the period, with its range spoken.",
		"The change is stated in text (+8.2% vs last quarter) with an arrow icon; colour only reinforces it.",
	],
}
