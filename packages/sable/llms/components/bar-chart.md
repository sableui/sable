# BarChart

**Status:** beta

Bars comparing amounts across categories: grouped, stacked or stacked to 100%, vertical columns or horizontal bars, with value labels, per-category colours and a separate tone for negative values. Bars rise from the baseline in sequence as the chart scrolls into view.

**Keywords:** chart, bar, column, histogram, compare, stacked, grouped, horizontal, analytics, dashboard

## Usage

Use BarChart to compare amounts across categories — the default chart for "how much of each". Go horizontal (`orientation="horizontal"`) when category names are long or there are many of them; group series side by side to compare them, stack them to show a total. For parts of one whole, a stacked bar or PieChart; for a trend, AreaChart or LineChart.

### Best practices

- Do: Sort categories by value unless they have a natural order (months, steps).
- Do: Use negativeTone for diverging data (profit and loss), so a loss reads apart from a gain.
- Don't: Group more than three series side by side — the bars get too thin to compare; stack them or split the chart.
- Don't: Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, unknown>[] | — | The rows, in order along the category axis. |
| index | string | — | The datum field naming each row's category (a month, a day, a channel). |
| series | { key: string; label: string; tone?: ChartTone; color?: string; icon?: string }[] | — | The measures to plot: the datum field, its name in the legend/tooltip/table, and its colour (a tone by role, or any CSS colour). Omitted, series take the chart palette in order: --chart-1 … --chart-8, validated for colour-blind separation in light and dark; a theme may override the set. |
| label | string | — | What the chart shows. Its accessible name and the caption of the data table assistive tech reads. |
| className | string | "h-60" | Sizes the chart (plot + legend). Set a height: `h-72`, `aspect-video h-auto`. |
| valueFormatter | (value: number) => string | — | Format values everywhere (axis, labels, tooltip, table) — units like "$12,480". Default: compact on the axis, full elsewhere. |
| indexFormatter | (value: string) => string | — | Shorten category labels on the axis ("January" → "Jan"); the tooltip keeps the full value. |
| locale | string | runtime locale | BCP 47 locale for default number and date formatting. |
| tooltip | boolean \| { indicator?: "dot" \| "line" \| "dashed" \| "none"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean } | true | Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row. |
| legend | boolean | true when there is more than one series | Show the legend under the chart. |
| grid | boolean | true (false for horizontal bars) | Hairline gridlines along the value axis. |
| xAxis | boolean | true for columns; false for horizontal bars | The horizontal axis. |
| yAxis | boolean | false for columns; true for horizontal bars | The vertical axis. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The arrival (bars rising in sequence) and the data-change morph are the flourish; the hover dim and gliding cursor are the feedback `subtle` keeps. |
| animate | boolean | true | Play the arrival once the chart scrolls into view. Reduced motion shows the finished chart. `animate={false}` is `motion="subtle"`. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |
| orientation | "vertical" \| "horizontal" | "vertical" | `vertical` columns rise from the bottom; `horizontal` bars run from the left, for long category names. |
| stacked | boolean \| "expand" | false | Stack the series in one bar, or `"expand"` to show each category as 100%. Unstacked series sit side by side. |
| labels | boolean \| "inside" | false | Print each bar's value at its end, or (`"inside"`, horizontal) the category name inside the bar as well. |
| colorBy | "series" \| "index" | "series" | Colour by series, or give each category its own tone (one series). |
| negativeTone | "1" \| "2" \| "3" \| "info" \| "warning" \| "primary" \| "neutral" \| "success" \| "destructive" | — | Colour negative values with this tone. |
| radius | number | 4 | Corner radius of each bar's far end, in px. Stacks round only the outer segment. |
| barWidth | number | 24 | Maximum thickness of a bar, in px: the band's leftover is air, not a fatter bar. Raise it for a bolder presentation look. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`, `tone-warning-mark`, `tone-info-mark`, `tone-1-mark`, `tone-2-mark`, `tone-3-mark`

## Motion

- **arrival** · Bar · _custom (outside the recipe layer)_ — Once on screen, bars rise from the baseline in sequence on the emphasized easing (scale from the zero line) and their labels fade in. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion="subtle"` (or a subtle app policy) shows the finished chart while hover feedback stays.
- **response** · Cursor + tooltip · _no motion_ — The hovered category gets a band behind it and the other bars dim at once — a lagging highlight reads as a slow chart. The dim mixes each bar toward the surface instead of fading it, so gridlines never strike through a dimmed column and stacked segments stay solid. Essential: `subtle` keeps it.
- **transition** · Bar · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place.
- **activity** · BarChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: AreaChart, PieChart, SegmentedBar, Card

## Examples

### Grouped series

```tsx
import { BarChart } from "@sableui/react"

<BarChart
	label="Visitors by device"
	data={visitors}
	index="month"
	series={[
		{ key: "desktop", label: "Desktop" },
		{ key: "mobile", label: "Mobile" },
	]}
	indexFormatter={(m) => m.slice(0, 3)}
/>
```

### Horizontal, labelled inside

```tsx
import { BarChart } from "@sableui/react"

const browsers = [
	{ browser: "Chrome", visitors: 275 },
	{ browser: "Safari", visitors: 200 },
	{ browser: "Firefox", visitors: 187 },
	{ browser: "Edge", visitors: 173 },
]

<BarChart
	label="Visitors by browser"
	data={browsers}
	index="browser"
	series={[{ key: "visitors", label: "Visitors" }]}
	orientation="horizontal"
	labels="inside"
	yAxis={false}
	grid={false}
/>
```

### Profit and loss

```tsx
import { BarChart } from "@sableui/react"

<BarChart
	label="Net revenue by month"
	data={[
		{ month: "Jan", net: 186 },
		{ month: "Feb", net: -95 },
		{ month: "Mar", net: 137 },
		{ month: "Apr", net: -60 },
	]}
	index="month"
	series={[{ key: "net", label: "Net", tone: "success" }]}
	negativeTone="destructive"
	labels
/>
```
