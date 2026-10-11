import type { ComponentMeta } from "../../lib/meta"

export const lineChartMeta: ComponentMeta = {
	name: "LineChart",
	summary: "Lines over a sequence — for comparing how measures move. Smooth, linear or step curves, optional dots (coloured by series or by category) and value labels. Lines draw on as the chart scrolls into view.",
	keywords: [
		"chart",
		"line",
		"trend",
		"time series",
		"graph",
		"compare",
		"analytics",
		"dashboard"
	],
	usage: {
		description: "Use LineChart to compare how two or more measures change over the same sequence, or to show one trend precisely (with dots and labels). Unlike AreaChart, its value axis is fitted to the data rather than forced to zero, so small movements stay visible — say so if the axis is shown.",
		bestPractices: [
			{
				guidance: "do",
				description: "Turn on dots and labels for six or fewer points, when the exact values are the story."
			},
			{
				guidance: "do",
				description: "Use curve=\"step\" for values that hold until they change — prices, plan tiers, headcount."
			},
			{
				guidance: "dont",
				description: "Plot unordered categories (channels, products) as a line — the line implies a path between them; use BarChart."
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
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Play the arrival once the chart scrolls into view. Reduced motion shows the finished chart."
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
			name: "dots",
			type: "boolean",
			default: "false",
			description: "Mark every data point with a dot."
		},
		{
			name: "colorBy",
			type: "\"series\" | \"index\"",
			default: "\"series\"",
			description: "Colour the dots by series, or each by its category."
		},
		{
			name: "labels",
			type: "boolean",
			default: "false",
			description: "Print each point's value above it."
		}
	],
	tokensUsed: [
		"tone-edition",
		"tone-collectible",
		"tone-standard",
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
			part: "Line",
			why: "Once on screen each line draws on from the first point (stroke-dashoffset), series staggered, then the dots and labels fade in. On the motion tokens; reduced motion shows the finished chart."
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
			part: "Line + dots",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "LineChart",
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
			label: "Compare two series",
			code: "<LineChart\n\tlabel=\"Desktop and mobile visitors\"\n\tdata={visitors}\n\tindex=\"month\"\n\tseries={[\n\t\t{ key: \"desktop\", label: \"Desktop\", tone: \"primary\" },\n\t\t{ key: \"mobile\", label: \"Mobile\", tone: \"info\" },\n\t]}\n\tindexFormatter={(m) => m.slice(0, 3)}\n/>"
		},
		{
			label: "Dots and labels",
			code: "<LineChart\n\tlabel=\"Desktop visitors\"\n\tdata={visitors}\n\tindex=\"month\"\n\tseries={[{ key: \"desktop\", label: \"Desktop\" }]}\n\tcurve=\"linear\"\n\tdots\n\tlabels\n\tgrid={false}\n/>"
		}
	]
}
