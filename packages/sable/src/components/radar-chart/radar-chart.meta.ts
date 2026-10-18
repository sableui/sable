import type { ComponentMeta } from "../../lib/meta"

export const radarChartMeta: ComponentMeta = {
	name: "RadarChart",
	summary: "Several measures compared around a centre: one polygon per series over a polygon or circular web, filled or outline only, with optional dots, a radius scale and a tinted web. Polygons grow from the centre as the chart scrolls into view.",
	keywords: [
		"chart",
		"radar",
		"spider",
		"web",
		"profile",
		"skills",
		"comparison",
		"polar"
	],
	usage: {
		description: "Use RadarChart to compare the shape of a profile across five to eight dimensions — skills, product scores, a cycle of months — for one to three series. The shape is the message; for exact values or more than three series, BarChart is easier to read.",
		bestPractices: [
			{
				guidance: "do",
				description: "Keep every spoke on the same scale and direction (more is better on all of them)."
			},
			{
				guidance: "do",
				description: "Use filled={false} when two polygons overlap heavily, so both outlines stay visible."
			},
			{
				guidance: "dont",
				description: "Use fewer than five spokes — three or four make a triangle or square that says little; use BarChart."
			},
			{
				guidance: "dont",
				description: "Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks."
			}
		]
	},
	related: {
		components: [
			"BarChart",
			"LineChart",
			"Card"
		]
	},
	status: "beta",
	props: [
		{
			name: "data",
			type: "Record<string, unknown>[]",
			description: "One row per spoke."
		},
		{
			name: "index",
			type: "string",
			description: "The datum field naming each spoke."
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
			default: "\"h-72\"",
			description: "Sizes the chart. Set a height."
		},
		{
			name: "grid",
			type: "\"polygon\" | \"circle\" | \"none\"",
			default: "\"polygon\"",
			description: "The web behind the polygons."
		},
		{
			name: "gridFill",
			type: "boolean",
			default: "false",
			description: "Tint the web's outer area."
		},
		{
			name: "filled",
			type: "boolean",
			default: "true",
			description: "Fill each polygon; `false` draws outlines only."
		},
		{
			name: "dots",
			type: "boolean",
			default: "false",
			description: "Mark every vertex with a dot."
		},
		{
			name: "radiusAxis",
			type: "boolean",
			default: "false",
			description: "Print the ring values along the top spoke."
		},
		{
			name: "legend",
			type: "boolean",
			default: "true when there is more than one series",
			description: "Show the legend."
		},
		{
			name: "tooltip",
			type: "boolean | { indicator?: \"dot\" | \"line\" | \"dashed\" | \"none\"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean }",
			default: "true",
			description: "Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row."
		},
		{
			name: "valueFormatter",
			type: "(value: number) => string",
			description: "Format values everywhere (axis, labels, tooltip, table) — units like \"$12,480\". Default: compact on the axis, full elsewhere."
		},
		{
			name: "locale",
			type: "string",
			default: "runtime locale",
			description: "BCP 47 locale for default number and date formatting."
		},
		{
			name: "motion",
			type: "\"full\" | \"subtle\" | \"off\"",
			default: "\"full\"",
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The polygons growing in and morphing are the flourish; the hover highlight is the feedback `subtle` keeps."
		},
		{
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Grow the polygons from the centre when the chart scrolls into view. `animate={false}` is `motion=\"subtle\"`.",
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
		"background",
		"tone-warning-mark",
		"tone-info-mark",
		"tone-1-mark",
		"tone-2-mark",
		"tone-3-mark",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "custom",
			part: "Polygon",
			why: "Once on screen each polygon grows from the centre and fades in, series staggered, on the emphasized easing. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion=\"subtle\"` (or a subtle app policy) shows the finished chart while hover feedback stays."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Active spoke",
			why: "The hovered spoke's vertices and label highlight at once."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Polygon",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "RadarChart",
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
			label: "Two profiles",
			code: "const scores = [\n\t{ skill: \"Speed\", a: 86, b: 65 },\n\t{ skill: \"Quality\", a: 72, b: 90 },\n\t{ skill: \"Support\", a: 64, b: 80 },\n\t{ skill: \"Price\", a: 90, b: 55 },\n\t{ skill: \"Docs\", a: 70, b: 85 },\n\t{ skill: \"Ecosystem\", a: 60, b: 75 },\n]\n\n<RadarChart\n\tlabel=\"Product scores compared\"\n\tdata={scores}\n\tindex=\"skill\"\n\tseries={[\n\t\t{ key: \"a\", label: \"Atlas\" },\n\t\t{ key: \"b\", label: \"Beacon\" },\n\t]}\n/>"
		},
		{
			label: "Circular web, outlines only",
			code: "<RadarChart\n\tlabel=\"Atlas scores\"\n\tdata={scores}\n\tindex=\"skill\"\n\tseries={[{ key: \"a\", label: \"Atlas\" }]}\n\tgrid=\"circle\"\n\tgridFill\n\tfilled={false}\n\tdots\n/>"
		}
	]
}
