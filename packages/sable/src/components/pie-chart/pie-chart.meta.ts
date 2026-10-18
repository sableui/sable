import type { ComponentMeta } from "../../lib/meta"

export const pieChartMeta: ComponentMeta = {
	name: "PieChart",
	summary: "Parts of a whole as slices: a pie or donut, concentric rings for several measures, a total in the hole, slice labels inside or out, and an active slice that pulls outward. Slices sweep in clockwise as the chart scrolls into view.",
	keywords: [
		"chart",
		"pie",
		"donut",
		"doughnut",
		"share",
		"proportion",
		"breakdown",
		"parts",
		"whole"
	],
	usage: {
		description: "Use PieChart for a share of one total across two to six categories — traffic sources, a budget split, survey answers. A donut leaves room for the total in the middle (`centerLabel`). With more categories, or to compare values precisely, use BarChart; for a breakdown inside a stat card, SegmentedBar is lighter.",
		bestPractices: [
			{
				guidance: "do",
				description: "Put the total, or the headline slice, in a donut's centerLabel."
			},
			{
				guidance: "do",
				description: "Configure slice names, tones and icons with categories, keyed by each slice's value in the data."
			},
			{
				guidance: "dont",
				description: "Use more than six slices — merge the tail into \"Other\" or use BarChart."
			},
			{
				guidance: "dont",
				description: "Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks."
			}
		]
	},
	related: {
		components: [
			"SegmentedBar",
			"RadialChart",
			"BarChart",
			"Card"
		]
	},
	status: "beta",
	props: [
		{
			name: "data",
			type: "Record<string, unknown>[]",
			description: "One row per slice."
		},
		{
			name: "index",
			type: "string",
			description: "The datum field naming each slice."
		},
		{
			name: "valueKey",
			type: "string | string[]",
			description: "The datum field holding each slice's amount — or several fields, drawn as concentric rings, outer first."
		},
		{
			name: "label",
			type: "string",
			description: "What the chart shows. Its accessible name and the caption of the data table assistive tech reads."
		},
		{
			name: "categories",
			type: "Record<string, { label?: string; tone?: ChartTone; color?: string; icon?: string }>",
			description: "Labels, tones and icons per slice, keyed by the slice's name. Unlisted slices take the tones in order."
		},
		{
			name: "className",
			type: "string",
			default: "\"h-64\"",
			description: "Sizes the chart. Set a height."
		},
		{
			name: "donut",
			type: "boolean | number",
			default: "false",
			description: "Cut out the middle: `true` for a ring at 60% of the radius, or a ratio (0–0.9)."
		},
		{
			name: "centerLabel",
			type: "{ value: string | number; label?: string }",
			description: "A value and caption in the hole of a donut. The value holds the centre and the caption hangs below it. A number is formatted for you: in full up to 9,999, compact from 10,000 (10.2K, 102.1K, 1.2M); pass a string for units."
		},
		{
			name: "separator",
			type: "boolean",
			default: "true",
			description: "A hairline in the surface colour between slices."
		},
		{
			name: "labels",
			type: "\"none\" | \"outside\" | \"inside\"",
			default: "\"none\"",
			description: "Label each slice outside the pie or inside it."
		},
		{
			name: "labelContent",
			type: "\"value\" | \"percent\" | \"name\"",
			default: "\"value\"",
			description: "What a slice label says."
		},
		{
			name: "legend",
			type: "boolean",
			default: "true unless slices are labelled",
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
			description: "How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The sweep, the slice morph and the rolling centre number are the flourish; the hover pull-out and dim are the feedback `subtle` keeps."
		},
		{
			name: "animate",
			type: "boolean",
			default: "true",
			description: "Sweep the slices in clockwise when the chart scrolls into view. `animate={false}` is `motion=\"subtle\"`.",
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
			part: "Slices",
			why: "Once on screen the slices are revealed by a mask that sweeps clockwise from 12 o'clock — the whole is read as it fills. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion=\"subtle\"` (or a subtle app policy) shows the finished chart while hover feedback stays."
		},
		{
			slot: "response",
			recipe: "none",
			part: "Active slice",
			why: "The hovered slice pulls outward and the rest dim at once (mixed toward the surface, not faded); the geometry change itself eases (see transition). Essential: `subtle` keeps it."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Centre value",
			why: "A numeric centre value rolls to its new total digit by digit (NumberTicker) when the data changes, so the headline is seen moving with the slices instead of being found different afterwards. Expressive: under `subtle` it updates in place."
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Slices",
			why: "Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place."
		},
		{
			slot: "activity",
			recipe: "none",
			part: "PieChart",
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
			label: "Donut with a total",
			code: "const sources = [\n\t{ source: \"Search\", visitors: 275 },\n\t{ source: \"Direct\", visitors: 200 },\n\t{ source: \"Social\", visitors: 187 },\n\t{ source: \"Email\", visitors: 90 },\n]\n\n<PieChart\n\tlabel=\"Visitors by source\"\n\tdata={sources}\n\tindex=\"source\"\n\tvalueKey=\"visitors\"\n\tdonut\n\tcenterLabel={{ value: 752, label: \"Visitors\" }}\n/>"
		},
		{
			label: "Labelled slices",
			code: "<PieChart\n\tlabel=\"Share of visitors by source\"\n\tdata={sources}\n\tindex=\"source\"\n\tvalueKey=\"visitors\"\n\tlabels=\"outside\"\n\tlabelContent=\"percent\"\n\tcategories={{ Search: { tone: \"primary\" }, Email: { tone: \"neutral\" } }}\n/>"
		}
	]
}
