import type { ComponentMeta } from "../../lib/meta"

export const areaChartMeta: ComponentMeta = {
	name: "AreaChart",
	summary: "A trend over a sequence, filled to the baseline: overlapping translucent series, stacked, or stacked to 100%, with smooth, linear or step curves and optional gradient fills. The line draws on and the fill rises as it scrolls into view.",
	keywords: [
		"chart",
		"area",
		"trend",
		"time series",
		"stacked",
		"graph",
		"analytics",
		"dashboard",
		"visitors",
		"revenue"
	],
	usage: {
		description: "Use AreaChart for volume over time — visitors, revenue, usage — where the filled shape helps the eye read the size of the total. Stack the series to show a total and its parts; `stacked=\"expand\"` shows each category as 100%. For comparing how measures move relative to each other, LineChart is cleaner; for amounts per category, BarChart.",
		bestPractices: [
			{
				guidance: "do",
				description: "Keep to one to three series; past that the tints muddy — stack them or switch to LineChart."
			},
			{
				guidance: "do",
				description: "Set a height on className (h-72, aspect-video h-auto); the chart fills the box it is given."
			},
			{
				guidance: "dont",
				description: "Overlap more than two unstacked series — the translucent tints blend into a colour no series has."
			},
			{
				guidance: "dont",
				description: "Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks."
			}
		]
	},
	related: {
		components: [
			"LineChart",
			"BarChart",
			"Sparkline",
			"Card"
		]
	},
	status: "beta",
	props: [
		{
			name: "data",
			type: "Record<string, unknown>[]",
			description: "The rows, in order along the category axis."
		},
		{
			name: "index",
			type: "string",
			description: "The datum field naming each row's category (a month, a day, a channel)."
		},
		{
			name: "series",
			type: "{ key: string; label: string; tone?: ChartTone; color?: string; icon?: string }[]",
			description: "The measures to plot: the datum field, its name in the legend/tooltip/table, and its colour (a tone by role, or any CSS colour). Omitted, series take the chart palette in order: --chart-1 … --chart-8, validated for colour-blind separation in light and dark; a theme may override the set."
		},
		{
			name: "label",
			type: "string",
			description: "What the chart shows. Its accessible name and the caption of the data table assistive tech reads."
		},
		{
			name: "className",
			type: "string",
			default: "\"h-60\"",
			description: "Sizes the chart (plot + legend). Set a height: `h-72`, `aspect-video h-auto`."
		},
		{
			name: "valueFormatter",
			type: "(value: number) => string",
			description: "Format values everywhere (axis, labels, tooltip, table) — units like \"$12,480\". Default: compact on the axis, full elsewhere."
		},
		{
			name: "indexFormatter",
			type: "(value: string) => string",
			description: "Shorten category labels on the axis (\"January\" → \"Jan\"); the tooltip keeps the full value."
		},
		{
			name: "locale",
			type: "string",
			default: "runtime locale",
			description: "BCP 47 locale for default number and date formatting."
		},
		{
			name: "tooltip",
			type: "boolean | { indicator?: \"dot\" | \"line\" | \"dashed\" | \"none\"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean }",
			default: "true",
			description: "Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row."
		},
		{
			name: "legend",
			type: "boolean",
			default: "true when there is more than one series",
			description: "Show the legend under the chart."
		},
		{
			name: "grid",
			type: "boolean",
			default: "true (false for horizontal bars)",
			description: "Hairline gridlines along the value axis."
		},
		{
			name: "xAxis",
			type: "boolean",
			default: "true for columns; false for horizontal bars",
			description: "The horizontal axis."
		},
		{
			name: "yAxis",
			type: "boolean",
			default: "false for columns; true for horizontal bars",
			description: "The vertical axis."
		},
		{
			name: "motion",
			type: "\"full\" | \"subtle\" | \"off\"",
			default: "\"full\"",
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The arrival (draw-on, rising fill) and the data-change morph are the flourish; the gliding cursor and tooltip are the feedback `subtle` keeps."
		},
		{
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Play the arrival once the chart scrolls into view. Reduced motion shows the finished chart. `animate={false}` is `motion=\"subtle\"`.",
			deprecated: "motion=\"subtle\" (what animate={false} now maps to: no arrival, hover kept) or motion=\"off\""
		},
		{
			name: "activeIndex",
			type: "number | null",
			description: "The highlighted row (controlled); `null` for none."
		},
		{
			name: "defaultActiveIndex",
			type: "number | null",
			description: "The row highlighted at first — a tooltip already open before anyone hovers."
		},
		{
			name: "onActiveIndexChange",
			type: "(index: number | null) => void",
			description: "Called as the pointer or keyboard moves between rows."
		},
		{
			name: "curve",
			type: "\"smooth\" | \"linear\" | \"step\"",
			default: "\"smooth\"",
			description: "How the line runs between points. `smooth` is monotone: it never overshoots a value the data does not contain."
		},
		{
			name: "stacked",
			type: "boolean | \"expand\"",
			default: "false",
			description: "Stack the series, or `\"expand\"` to show each category as 100%."
		},
		{
			name: "gradient",
			type: "boolean",
			default: "false",
			description: "Fill each area with a fade from its colour to transparent instead of a flat tint."
		}
	],
	tokensUsed: [
		"tone-1",
		"tone-2",
		"tone-3",
		"tone-info",
		"tone-warning",
		"primary",
		"muted-foreground",
		"border",
		"popover",
		"popover-foreground",
		"foreground",
		"background"
	],
	motion: [
		{
			slot: "arrival",
			recipe: "custom",
			part: "Area + line",
			why: "Once on screen, each line draws on (stroke-dashoffset) and its fill rises from the baseline, series staggered — the trend is read as it is drawn. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion=\"subtle\"` (or a subtle app policy) shows the finished chart while hover feedback stays."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Cursor + tooltip",
			why: "Hover and focus move the cursor and tooltip instantly — a lagging cursor reads as a slow chart."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Area + line",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "AreaChart",
			why: "A chart has no indeterminate state; show a Skeleton while the data loads."
		}
	],
	a11y: [
		"The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.",
		"With a tooltip, the chart is one tab stop (role=group, aria-roledescription=\"chart\"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.",
		"Colour is never the only key: series are named in the legend, tooltip and table."
	],
	examples: [
		{
			label: "Two series with a legend",
			code: "const visitors = [\n\t{ month: \"January\", desktop: 186, mobile: 80 },\n\t{ month: \"February\", desktop: 305, mobile: 200 },\n\t{ month: \"March\", desktop: 237, mobile: 120 },\n\t{ month: \"April\", desktop: 73, mobile: 190 },\n\t{ month: \"May\", desktop: 209, mobile: 130 },\n\t{ month: \"June\", desktop: 214, mobile: 140 },\n]\n\n<AreaChart\n\tlabel=\"Visitors, January to June\"\n\tdata={visitors}\n\tindex=\"month\"\n\tseries={[\n\t\t{ key: \"desktop\", label: \"Desktop\" },\n\t\t{ key: \"mobile\", label: \"Mobile\" },\n\t]}\n\tindexFormatter={(m) => m.slice(0, 3)}\n\tgradient\n/>"
		},
		{
			label: "Stacked to 100%",
			code: "<AreaChart\n\tlabel=\"Share of visitors by device\"\n\tdata={visitors}\n\tindex=\"month\"\n\tseries={[\n\t\t{ key: \"desktop\", label: \"Desktop\" },\n\t\t{ key: \"mobile\", label: \"Mobile\" },\n\t]}\n\tstacked=\"expand\"\n\tyAxis\n\ttooltip={{ indicator: \"line\", showTotal: true }}\n/>"
		}
	]
}
