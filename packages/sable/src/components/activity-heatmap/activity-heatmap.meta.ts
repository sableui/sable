import type { ComponentMeta } from "../../lib/meta"

export const activityHeatmapMeta: ComponentMeta = {
	name: "ActivityHeatmap",
	summary:
		"A calendar heatmap: one value per day as a grid of weeks by weekdays — the GitHub contribution graph, for any daily measure. Levels by quartile, categories by source, a real ARIA grid with one tab stop, and a sideways scroll on narrow screens that opens on the latest week.",
	keywords: [
		"heatmap",
		"calendar heatmap",
		"contribution graph",
		"contributions",
		"activity",
		"github",
		"streak",
		"habit",
		"daily",
		"commits",
		"uptime",
	],
	usage: {
		description:
			"Use ActivityHeatmap to show how often something happened day by day over weeks or months: commits, habits kept, orders, uptime. Pass days as ISO dates with a value; levels, colours, labels, keyboard and tooltips work with no further props. Put it inside a Card and compose any totals beside it (NumberTicker, StatRowBlock). For a value over time that a reader needs to compare precisely, use AreaChart or BarChart; for a month calendar with marked days (a streak calendar), use Calendar.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pass dates as \"YYYY-MM-DD\" strings. The grid reads them as calendar days, so no time zone can shift a day — never build them with `new Date(...).toISOString()` from a local date.",
			},
			{
				guidance: "do",
				description:
					"Give it a `unit` (\"contribution\" / \"contributions\") so the tooltip and every cell's name say what the number counts.",
			},
			{
				guidance: "do",
				description:
					"Let the default quantile scale pick levels — one exceptional day then does not wash every other day out. Pass a day's own `level` when the source already has one (GitHub's API).",
			},
			{
				guidance: "dont",
				description:
					"Use it for a handful of values or for values a reader must compare exactly; a heatmap shows rhythm, not amounts. Use BarChart.",
				instead: ["BarChart", "AreaChart"],
			},
			{
				guidance: "dont",
				description:
					"Use it for a single month of marked days with a streak; that is Calendar with modifiers.",
				instead: ["Calendar"],
			},
			{
				guidance: "dont",
				description:
					"Fetch inside the component or call GitHub from the browser with a token. Fetch on your server and pass days in; `@sableui/react/adapters/github` converts GitHub's response.",
			},
		],
		anatomy: [
			{ name: "Weekday labels", required: false, description: "Short weekday names beside the rows, outside the scroller so the weeks never slide under them." },
			{ name: "Month labels", required: false, description: "Short month names over each month's first week; they scroll with their weeks." },
			{ name: "Cell grid", required: true, description: "A role=grid table, one gridcell per day, inside a horizontal Scroller that opens on the latest week." },
			{ name: "Tooltip", required: false, description: "The chart tooltip card, anchored to the hovered, focused or tapped day." },
			{ name: "Legend", required: false, description: "A Less–More ramp for intensity, or swatches for categories." },
		],
	},
	related: {
		components: ["Card", "NumberTicker", "BarChart", "Calendar", "Scroller"],
	},
	status: "stable",
	props: [
		{ name: "label", type: "string", description: "What the grid shows (\"Contributions in 2026\") — its caption and accessible name." },
		{
			name: "data",
			type: "ActivityDay[] | Record<string, number>",
			description:
				"The days: `{ date: \"YYYY-MM-DD\", value, level?, category? }[]`, or a map of date to value. Sparse is fine — a missing day is 0; duplicates sum.",
		},
		{ name: "start", type: "string", default: "53 weeks before end", description: "First day drawn, \"YYYY-MM-DD\". The default starts at the beginning of that week, as GitHub's does." },
		{ name: "end", type: "string", default: "today", description: "Last day drawn. Days after today inside the range are drawn hollow and skipped by the keyboard." },
		{ name: "year", type: "number", description: "Draw Jan 1 – Dec 31 of this year. Wins over start / end." },
		{ name: "weekStart", type: "0 | 1", default: "the locale's", description: "0 puts Sunday on the top row, 1 Monday." },
		{ name: "levels", type: "number", default: "5", description: "How many levels, including the empty level 0." },
		{
			name: "levelScale",
			type: '"quantile" | "linear" | number[] | ((value, stats) => number)',
			default: '"quantile"',
			description:
				"How a value becomes a level. Quantile splits the positive values evenly, as GitHub does; an array gives each level's lower bound from 1 up; a function decides. A day's own `level` always wins.",
		},
		{ name: "tone", type: "ChartTone", default: '"1"', description: "The hue of the intensity ramp. Decorative tones lead, as on every chart; \"success\" gives the GitHub look." },
		{ name: "categories", type: "ChartCategories", description: "Colour days by `day.category` (label, tone or colour per key). Pair with `levels={2}` for flat category colours." },
		{ name: "unit", type: "string | { one: string; other: string }", description: "Names the value in the tooltip and each cell's accessible name, pluralised with Intl.PluralRules." },
		{ name: "formatValue", type: "(value: number) => string", default: "full to 9,999, compact past", description: "Formats a value wherever it is shown or read." },
		{ name: "tooltip", type: "boolean | ((day: ActivityHeatmapDay) => ReactNode)", default: "true", description: "Show the tooltip on hover, focus and tap; a function replaces its content on the same card." },
		{ name: "legend", type: "boolean", default: "true", description: "The Less–More ramp for intensity, swatches for categories." },
		{ name: "legendLabels", type: "[string, string]", default: '["Less", "More"]', description: "The ramp's end words." },
		{ name: "monthLabels", type: "boolean", default: "true", description: "Short month names over each month's first week." },
		{ name: "weekdayLabels", type: '"alternate" | "all" | "none"', default: '"alternate"', description: "Which weekday names to show beside the rows; alternate is Mon, Wed, Fri." },
		{ name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The smallest a cell may get (10, 12, 14 px) before the grid scrolls instead of shrinking." },
		{ name: "stretch", type: "boolean", default: "true", description: "Grow cells to fill the width, up to 20 px. false keeps them at `size`." },
		{ name: "activeDate", type: "string | null", description: "The hovered or focused day, controlled. Pair with defaultActiveDate / onActiveDateChange." },
		{ name: "selectedDate", type: "string | null", description: "The selected day, controlled. Selection is on only when onSelectDate is set." },
		{ name: "onSelectDate", type: "(date: string) => void", description: "Called when a day is clicked or chosen with Enter / Space — to filter a feed below, as GitHub does." },
		{ name: "renderCell", type: "(day, cell) => ReactNode", description: "Draw something over a cell's fill — an icon for a milestone, a reward, an outage." },
		{ name: "loading", type: "boolean", default: "false", description: "Draw the empty grid, shimmering, while data loads." },
		{ name: "motion", type: '"full" | "subtle" | "off"', default: '"full"', description: "Turns the arrival down; `subtle` shows the finished grid at once." },
		{ name: "locale", type: "string", default: "runtime locale", description: "Month and weekday names, numbers and plurals." },
	],
	tokensUsed: ["foreground", "muted-foreground", "border-strong", "ring", "tone-1-mark", "tone-2-mark", "tone-3-mark", "success-mark", "tone-info-mark"],
	motion: [
		{
			slot: "arrival",
			recipe: "custom",
			part: "Cell grid",
			why: "Weeks fade in left to right as the grid first scrolls into view, staggered on the chart motion helpers; expressive, so subtle shows the finished grid.",
		},
		{
			slot: "response",
			recipe: "custom",
			part: "Cell",
			why: "The active day takes a ring outline at once and the tooltip glides to it; the other cells stay still — dimming hundreds of cells reads as a flash.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Cell",
			why: "When data or the range changes, each cell's fill cross-fades on the base duration token, so the reader sees which days changed.",
		},
		{ slot: "activity", recipe: "motion-shimmer", part: "Cell grid", why: "`loading` shimmers the empty grid until days arrive." },
	],
	a11y: [
		"The grid is a role=grid table, as GitHub's is: weekday row headers and month column headers carry full names for screen readers, and the caption is `label`.",
		"One tab stop. Arrows move a day or a week; Home / End go to the ends of the row, Page Up / Page Down to the ends of the column, Ctrl+Home / Ctrl+End to the first and last day. Enter or Space selects when onSelectDate is set; Escape hides the tooltip.",
		"Each cell is named with its date and value (\"Tuesday, October 14, 2026: 12 contributions\") and described by its level's words, which the legend repeats visually.",
		"Levels rise in lightness, so they read without colour; under forced colours each level draws as a larger inner square.",
	],
	examples: [
		{
			label: "Contributions, last year",
			code: 'const days = [\n\t{ date: "2026-10-12", value: 4 },\n\t{ date: "2026-10-13", value: 11 },\n\t{ date: "2026-10-14", value: 2 },\n]\n\n<ActivityHeatmap label="Contributions in the last year" data={days} tone="success" unit={{ one: "contribution", other: "contributions" }} />',
		},
		{
			label: "Two sources, in a card",
			code: 'const github = [{ date: "2026-10-13", value: 6 }]\nconst codex = [{ date: "2026-10-13", value: 1 }, { date: "2026-10-14", value: 3 }]\n\n<Card>\n\t<CardHeader>\n\t\t<CardTitle>Building, day by day</CardTitle>\n\t</CardHeader>\n\t<CardContent>\n\t\t<ActivityHeatmap\n\t\t\tlabel="GitHub and Codex activity in 2026"\n\t\t\tyear={2026}\n\t\t\tlevels={2}\n\t\t\tdata={mergeActivity({ github, codex })}\n\t\t\tcategories={{ github: { label: "GitHub", tone: "success" }, codex: { label: "Codex", tone: "info" }, both: { label: "Both", tone: "2" } }}\n\t\t/>\n\t</CardContent>\n</Card>',
		},
		{
			label: "Selecting a day",
			code: 'const [day, setDay] = useState<string | null>(null)\n\n<ActivityHeatmap label="Orders per day" data={{ "2026-10-13": 18, "2026-10-14": 25 }} unit="orders" selectedDate={day} onSelectDate={setDay} />',
		},
	],
}
