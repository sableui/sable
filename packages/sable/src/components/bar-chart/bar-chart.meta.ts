import type { ComponentMeta } from "../../lib/meta"

export const barChartMeta: ComponentMeta = {
	name: "BarChart",
	summary: "Bars comparing amounts across categories: grouped, stacked or stacked to 100%, vertical columns or horizontal bars, with value labels, per-category colours and a separate tone for negative values. Bars rise from the baseline in sequence as the chart scrolls into view.",
	keywords: [
		"chart",
		"bar",
		"column",
		"histogram",
		"compare",
		"stacked",
		"grouped",
		"horizontal",
		"analytics",
		"dashboard"
	],
	usage: {
		description: "Use BarChart to compare amounts across categories — the default chart for \"how much of each\". Go horizontal (`orientation=\"horizontal\"`) when category names are long or there are many of them; group series side by side to compare them, stack them to show a total. For parts of one whole, a stacked bar or PieChart; for a trend, AreaChart or LineChart.",
		bestPractices: [
			{
				guidance: "do",
				description: "Sort categories by value unless they have a natural order (months, steps)."
			},
			{
				guidance: "do",
				description: "Use negativeTone for diverging data (profit and loss), so a loss reads apart from a gain."
			},
			{
				guidance: "dont",
				description: "Group more than three series side by side — the bars get too thin to compare; stack them or split the chart."
			},
			{
				guidance: "dont",
				description: "Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks."
			}
		]
	},
	related: {
		components: [
			"AreaChart",
			"PieChart",
			"SegmentedBar",
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
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The arrival (bars rising in sequence) and the data-change morph are the flourish; the hover dim and gliding cursor are the feedback `subtle` keeps."
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
			name: "orientation",
			type: "\"vertical\" | \"horizontal\"",
			default: "\"vertical\"",
			description: "`vertical` columns rise from the bottom; `horizontal` bars run from the left, for long category names."
		},
		{
			name: "stacked",
			type: "boolean | \"expand\"",
			default: "false",
			description: "Stack the series in one bar, or `\"expand\"` to show each category as 100%. Unstacked series sit side by side."
		},
		{
			name: "labels",
			type: "boolean | \"inside\"",
			default: "false",
			description: "Print each bar's value at its end, or (`\"inside\"`, horizontal) the category name inside the bar as well."
		},
		{
			name: "colorBy",
			type: "\"series\" | \"index\"",
			default: "\"series\"",
			description: "Colour by series, or give each category its own tone (one series)."
		},
		{
			name: "negativeTone",
			type: "\"1\" | \"2\" | \"3\" | \"info\" | \"warning\" | \"primary\" | \"neutral\" | \"success\" | \"destructive\"",
			description: "Colour negative values with this tone."
		},
		{
			name: "radius",
			type: "number",
			default: "4",
			description: "Corner radius of each bar's far end, in px. Stacks round only the outer segment."
		},
		{
			name: "barWidth",
			type: "number",
			default: "24",
			description: "Maximum thickness of a bar, in px: the band's leftover is air, not a fatter bar. Raise it for a bolder presentation look."
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
			part: "Bar",
			why: "Once on screen, bars rise from the baseline in sequence on the emphasized easing (scale from the zero line) and their labels fade in. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion=\"subtle\"` (or a subtle app policy) shows the finished chart while hover feedback stays."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Cursor + tooltip",
			why: "The hovered category gets a band behind it and the other bars dim at once — a lagging highlight reads as a slow chart. The dim mixes each bar toward the surface instead of fading it, so gridlines never strike through a dimmed column and stacked segments stay solid. Essential: `subtle` keeps it."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Bar",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "BarChart",
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
			label: "Grouped series",
			code: "<BarChart\n\tlabel=\"Visitors by device\"\n\tdata={visitors}\n\tindex=\"month\"\n\tseries={[\n\t\t{ key: \"desktop\", label: \"Desktop\" },\n\t\t{ key: \"mobile\", label: \"Mobile\" },\n\t]}\n\tindexFormatter={(m) => m.slice(0, 3)}\n/>"
		},
		{
			label: "Horizontal, labelled inside",
			code: "const browsers = [\n\t{ browser: \"Chrome\", visitors: 275 },\n\t{ browser: \"Safari\", visitors: 200 },\n\t{ browser: \"Firefox\", visitors: 187 },\n\t{ browser: \"Edge\", visitors: 173 },\n]\n\n<BarChart\n\tlabel=\"Visitors by browser\"\n\tdata={browsers}\n\tindex=\"browser\"\n\tseries={[{ key: \"visitors\", label: \"Visitors\" }]}\n\torientation=\"horizontal\"\n\tlabels=\"inside\"\n\tyAxis={false}\n\tgrid={false}\n/>"
		},
		{
			label: "Profit and loss",
			code: "<BarChart\n\tlabel=\"Net revenue by month\"\n\tdata={[\n\t\t{ month: \"Jan\", net: 186 },\n\t\t{ month: \"Feb\", net: -95 },\n\t\t{ month: \"Mar\", net: 137 },\n\t\t{ month: \"Apr\", net: -60 },\n\t]}\n\tindex=\"month\"\n\tseries={[{ key: \"net\", label: \"Net\", tone: \"success\" }]}\n\tnegativeTone=\"destructive\"\n\tlabels\n/>"
		}
	]
}
