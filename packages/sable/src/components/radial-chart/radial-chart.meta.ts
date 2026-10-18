import type { ComponentMeta } from "../../lib/meta"

export const radialChartMeta: ComponentMeta = {
	name: "RadialChart",
	summary: "Progress or share as rings: one ring per row against a muted track, a full circle or a gauge (`sweep`), one ring split between rows (`stacked`), ring labels and a value in the middle. Rings draw round as the chart scrolls into view.",
	keywords: [
		"chart",
		"radial",
		"ring",
		"gauge",
		"progress",
		"goal",
		"score",
		"activity rings",
		"donut"
	],
	usage: {
		description: "Use RadialChart for progress toward goals (several rings), a single score or usage gauge (`sweep={180}` with `centerLabel`), or a split of one total along a gauge (`stacked`). For one reading in a form or settings row, Meter's ring shape is lighter.",
		bestPractices: [
			{
				guidance: "do",
				description: "Set max to the goal, so a full ring means \"done\"."
			},
			{
				guidance: "do",
				description: "Pair a gauge with centerLabel stating the value in words or units."
			},
			{
				guidance: "dont",
				description: "Compare more than four rings — inner rings are shorter for the same value, which misleads; use BarChart."
			},
			{
				guidance: "dont",
				description: "Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks."
			}
		]
	},
	related: {
		components: [
			"Meter",
			"PieChart",
			"Progress",
			"Card"
		]
	},
	status: "beta",
	props: [
		{
			name: "data",
			type: "Record<string, unknown>[]",
			description: "One row per ring, outermost first."
		},
		{
			name: "index",
			type: "string",
			description: "The datum field naming each ring."
		},
		{
			name: "valueKey",
			type: "string",
			description: "The datum field holding each ring's amount."
		},
		{
			name: "label",
			type: "string",
			description: "What the chart shows. Its accessible name and the caption of the data table assistive tech reads."
		},
		{
			name: "categories",
			type: "Record<string, { label?: string; tone?: ChartTone; color?: string; icon?: string }>",
			description: "Labels, tones and icons per ring, keyed by the ring's name."
		},
		{
			name: "className",
			type: "string",
			default: "\"h-64\"",
			description: "Sizes the chart. Set a height."
		},
		{
			name: "max",
			type: "number",
			default: "the largest value (stacked: the total; labelled: the largest value ÷ 0.75, leaving room for the labels)",
			description: "The value a full ring stands for."
		},
		{
			name: "sweep",
			type: "number",
			default: "360",
			description: "How far round a full ring runs, in degrees: 360 for a circle, 180 for a gauge."
		},
		{
			name: "stacked",
			type: "boolean",
			default: "false",
			description: "Split ONE ring between the rows instead of a ring each."
		},
		{
			name: "track",
			type: "boolean",
			default: "true",
			description: "Draw each ring's full track behind it."
		},
		{
			name: "labels",
			type: "boolean",
			default: "false",
			description: "Name each ring at its start."
		},
		{
			name: "centerLabel",
			type: "{ value: string | number; label?: string }",
			description: "A value and caption in the middle. On a full ring the value holds the centre and the caption hangs below it. A number is formatted for you: in full up to 9,999, compact from 10,000 (10.2K); pass a string for units (\"7.2 GB\", \"72%\")."
		},
		{
			name: "legend",
			type: "boolean",
			default: "true unless rings are labelled",
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
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The draw-on, the ring morph and the rolling centre number are the flourish; the hover dim is the feedback `subtle` keeps."
		},
		{
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Draw the rings round from their start when the chart scrolls into view. `animate={false}` is `motion=\"subtle\"`.",
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
			part: "Ring",
			why: "Once on screen each ring draws round from its start (stroke-dashoffset on a round-capped arc), staggered outside in. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion=\"subtle\"` (or a subtle app policy) shows the finished chart while hover feedback stays."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Active ring",
			why: "The hovered ring stays full strength and the others dim at once — mixed toward the surface rather than faded, so a dimmed ring stays solid over its track instead of turning muddy. Essential: `subtle` keeps it."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Centre value",
			why: "A numeric centre value rolls to its new total digit by digit (NumberTicker) when the data changes, so the headline is seen moving with the rings instead of being found different afterwards. Expressive: under `subtle` it updates in place."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Ring",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "RadialChart",
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
			label: "Goal rings",
			code: "<RadialChart\n\tlabel=\"Weekly goals\"\n\tdata={[\n\t\t{ goal: \"Move\", progress: 82 },\n\t\t{ goal: \"Exercise\", progress: 64 },\n\t\t{ goal: \"Stand\", progress: 91 },\n\t]}\n\tindex=\"goal\"\n\tvalueKey=\"progress\"\n\tmax={100}\n\tlabels\n/>"
		},
		{
			label: "Gauge with a value",
			code: "<RadialChart\n\tlabel=\"Plan usage\"\n\tdata={[{ plan: \"Used\", gb: 7.2 }]}\n\tindex=\"plan\"\n\tvalueKey=\"gb\"\n\tmax={10}\n\tsweep={180}\n\tcenterLabel={{ value: \"7.2 GB\", label: \"of 10 GB\" }}\n\tlegend={false}\n/>"
		}
	]
}
