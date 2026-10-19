# ActivityHeatmap

**Status:** stable

A calendar heatmap: one value per day as a grid of weeks by weekdays — the GitHub contribution graph, for any daily measure. Levels by quartile, categories by source, a real ARIA grid with one tab stop, and a sideways scroll on narrow screens that opens on the latest week.

**Keywords:** heatmap, calendar heatmap, contribution graph, contributions, activity, github, streak, habit, daily, commits, uptime

## Usage

Use ActivityHeatmap to show how often something happened day by day over weeks or months: commits, habits kept, orders, uptime. Pass days as ISO dates with a value; levels, colours, labels, keyboard and tooltips work with no further props. Put it inside a Card and compose any totals beside it (NumberTicker, StatRowBlock). For a value over time that a reader needs to compare precisely, use AreaChart or BarChart; for a month calendar with marked days (a streak calendar), use Calendar.

### Best practices

- Do: Pass dates as "YYYY-MM-DD" strings. The grid reads them as calendar days, so no time zone can shift a day — never build them with `new Date(...).toISOString()` from a local date.
- Do: Give it a `unit` ("contribution" / "contributions") so the tooltip and every cell's name say what the number counts.
- Do: Let the default quantile scale pick levels — one exceptional day then does not wash every other day out. Pass a day's own `level` when the source already has one (GitHub's API).
- Don't: Use it for a handful of values or for values a reader must compare exactly; a heatmap shows rhythm, not amounts. Use BarChart. → use **BarChart**, **AreaChart**
- Don't: Use it for a single month of marked days with a streak; that is Calendar with modifiers. → use **Calendar**
- Don't: Fetch inside the component or call GitHub from the browser with a token. Fetch on your server and pass days in; `@sableui/react/adapters/github` converts GitHub's response.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Weekday labels | no | Short weekday names beside the rows, outside the scroller so the weeks never slide under them. |
| Month labels | no | Short month names over each month's first week; they scroll with their weeks. |
| Cell grid | yes | A role=grid table, one gridcell per day, inside a horizontal Scroller that opens on the latest week. |
| Tooltip | no | The chart tooltip card, anchored to the hovered, focused or tapped day. |
| Legend | no | A Less–More ramp for intensity, or swatches for categories. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | string | — | What the grid shows ("Contributions in 2026") — its caption and accessible name. |
| data | ActivityDay[] \| Record<string, number> | — | The days: `{ date: "YYYY-MM-DD", value, level?, category? }[]`, or a map of date to value. Sparse is fine — a missing day is 0; duplicates sum. |
| start | string | 53 weeks before end | First day drawn, "YYYY-MM-DD". The default starts at the beginning of that week, as GitHub's does. |
| end | string | today | Last day drawn. Days after today inside the range are drawn hollow and skipped by the keyboard. |
| year | number | — | Draw Jan 1 – Dec 31 of this year. Wins over start / end. |
| weekStart | 0 \| 1 | the locale's | 0 puts Sunday on the top row, 1 Monday. |
| levels | number | 5 | How many levels, including the empty level 0. |
| levelScale | "quantile" \| "linear" \| number[] \| ((value, stats) => number) | "quantile" | How a value becomes a level. Quantile splits the positive values evenly, as GitHub does; an array gives each level's lower bound from 1 up; a function decides. A day's own `level` always wins. |
| tone | ChartTone | "1" | The hue of the intensity ramp. Decorative tones lead, as on every chart; "success" gives the GitHub look. |
| categories | ChartCategories | — | Colour days by `day.category` (label, tone or colour per key). Pair with `levels={2}` for flat category colours. |
| unit | string \| { one: string; other: string } | — | Names the value in the tooltip and each cell's accessible name, pluralised with Intl.PluralRules. |
| formatValue | (value: number) => string | full to 9,999, compact past | Formats a value wherever it is shown or read. |
| tooltip | boolean \| ((day: ActivityHeatmapDay) => ReactNode) | true | Show the tooltip on hover, focus and tap; a function replaces its content on the same card. |
| legend | boolean | true | The Less–More ramp for intensity, swatches for categories. |
| legendLabels | [string, string] | ["Less", "More"] | The ramp's end words. |
| monthLabels | boolean | true | Short month names over each month's first week. |
| weekdayLabels | "alternate" \| "all" \| "none" | "alternate" | Which weekday names to show beside the rows; alternate is Mon, Wed, Fri. |
| size | "sm" \| "md" \| "lg" | "md" | The smallest a cell may get (10, 12, 14 px) before the grid scrolls instead of shrinking. |
| stretch | boolean | true | Grow cells to fill the width, up to 20 px. false keeps them at `size`. |
| activeDate | string \| null | — | The hovered or focused day, controlled. Pair with defaultActiveDate / onActiveDateChange. |
| selectedDate | string \| null | — | The selected day, controlled. Selection is on only when onSelectDate is set. |
| onSelectDate | (date: string) => void | — | Called when a day is clicked or chosen with Enter / Space — to filter a feed below, as GitHub does. |
| renderCell | (day, cell) => ReactNode | — | Draw something over a cell's fill — an icon for a milestone, a reward, an outage. |
| loading | boolean | false | Draw the empty grid, shimmering, while data loads. |
| motion | "full" \| "subtle" \| "off" | "full" | Turns the arrival down; `subtle` shows the finished grid at once. |
| locale | string | runtime locale | Month and weekday names, numbers and plurals. |

## Tokens used

`foreground`, `muted-foreground`, `border-strong`, `ring`, `tone-1-mark`, `tone-2-mark`, `tone-3-mark`, `success-mark`, `tone-info-mark`

## Motion

- **arrival** · Cell grid · _custom (outside the recipe layer)_ — Weeks fade in left to right as the grid first scrolls into view, staggered on the chart motion helpers; expressive, so subtle shows the finished grid.
- **response** · Cell · _custom (outside the recipe layer)_ — The active day takes a ring outline at once and the tooltip glides to it; the other cells stay still — dimming hundreds of cells reads as a flash.
- **transition** · Cell · _custom (outside the recipe layer)_ — When data or the range changes, each cell's fill cross-fades on the base duration token, so the reader sees which days changed.
- **activity** · Cell grid · `motion-shimmer` — `loading` shimmers the empty grid until days arrive.

## Accessibility

- The grid is a role=grid table, as GitHub's is: weekday row headers and month column headers carry full names for screen readers, and the caption is `label`.
- One tab stop. Arrows move a day or a week; Home / End go to the ends of the row, Page Up / Page Down to the ends of the column, Ctrl+Home / Ctrl+End to the first and last day. Enter or Space selects when onSelectDate is set; Escape hides the tooltip.
- Each cell is named with its date and value ("Tuesday, October 14, 2026: 12 contributions") and described by its level's words, which the legend repeats visually.
- Levels rise in lightness, so they read without colour; under forced colours each level draws as a larger inner square.

## Related

- Components: Card, NumberTicker, BarChart, Calendar, Scroller

## Examples

### Contributions, last year

```tsx
import { ActivityHeatmap } from "@sableui/react"

const days = [
	{ date: "2026-10-12", value: 4 },
	{ date: "2026-10-13", value: 11 },
	{ date: "2026-10-14", value: 2 },
]

<ActivityHeatmap label="Contributions in the last year" data={days} tone="success" unit={{ one: "contribution", other: "contributions" }} />
```

### Two sources, in a card

```tsx
import { ActivityHeatmap, Card, CardContent, CardHeader, CardTitle, mergeActivity } from "@sableui/react"

const github = [{ date: "2026-10-13", value: 6 }]
const codex = [{ date: "2026-10-13", value: 1 }, { date: "2026-10-14", value: 3 }]

<Card>
	<CardHeader>
		<CardTitle>Building, day by day</CardTitle>
	</CardHeader>
	<CardContent>
		<ActivityHeatmap
			label="GitHub and Codex activity in 2026"
			year={2026}
			levels={2}
			data={mergeActivity({ github, codex })}
			categories={{ github: { label: "GitHub", tone: "success" }, codex: { label: "Codex", tone: "info" }, both: { label: "Both", tone: "2" } }}
		/>
	</CardContent>
</Card>
```

### Selecting a day

```tsx
import { ActivityHeatmap } from "@sableui/react"

const [day, setDay] = useState<string | null>(null)

<ActivityHeatmap label="Orders per day" data={{ "2026-10-13": 18, "2026-10-14": 25 }} unit="orders" selectedDate={day} onSelectDate={setDay} />
```
