# AreaChart

**Status:** beta

A trend over a sequence, filled to the baseline: overlapping translucent series, stacked, or stacked to 100%, with smooth, linear or step curves and optional gradient fills. The line draws on and the fill rises as it scrolls into view.

**Keywords:** chart, area, trend, time series, stacked, graph, analytics, dashboard, visitors, revenue

## Usage

Use AreaChart for volume over time — visitors, revenue, usage — where the filled shape helps the eye read the size of the total. Stack the series to show a total and its parts; `stacked="expand"` shows each category as 100%. For comparing how measures move relative to each other, LineChart is cleaner; for amounts per category, BarChart.

### Best practices

- Do: Keep to one to three series; past that the tints muddy — stack them or switch to LineChart.
- Do: Leave a value out with null, never 0: a gap breaks the line, and a zero is a claim about the data. A forecast is a second, dashed series with values only where it runs.
- Do: Set a height on className (h-72, aspect-video h-auto); the chart fills the box it is given.
- Don't: Overlap more than two unstacked series — the translucent tints blend into a colour no series has.
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
| yAxisSide | "left" \| "right" | "left" | Which edge the value axis sits on, on a vertical chart. |
| yAxisWidth | number | — | The vertical axis's label width, in px. Left unset it follows the longest label, so the plot slides sideways when new data changes the labels; set it where a chart swaps data in place, such as tabs. |
| categoryTicks | number | — | At most this many category labels. They already thin to fit, from the latest back; this asks for fewer. |
| domain | "auto" \| [number, number] | — | The value axis's range. "auto" fits the data, so a price line uses the plot instead of sitting at the top of an axis from zero. A [min, max] pair fixes the range, and values past it stop at the plot's edge. Defaults to zero up to the data. |
| referenceLines | ChartReferenceLine[] | — | Mark positions on the plot, each { category } or { value }, with an optional label and tone: a Today line, a target. |
| axisFormatter | (value: number) => string | — | Format values on the axis alone, when it needs less than valueFormatter prints: $50K beside $41,746.08. |
| lineWidth | number | 2 | The line's weight, in px. |
| fillStrength | number | — | How strong the fill is, from 0 to 1: the tint's opacity, or the top of the gradient. Lower it when stacked bands read as one wall of colour. Defaults to 0.14, or 0.32 stacked; with gradient, 0.22, or 0.5 stacked. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The arrival (draw-on, rising fill) and the data-change morph are the flourish; the gliding cursor and tooltip are the feedback `subtle` keeps. |
| animate | boolean | true | Play the arrival once the chart scrolls into view. Reduced motion shows the finished chart. `animate={false}` is `motion="subtle"`. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |
| curve | "smooth" \| "linear" \| "step" | "smooth" | How the line runs between points. `smooth` is monotone: it never overshoots a value the data does not contain. |
| stacked | boolean \| "expand" | false | Stack the series, or `"expand"` to show each category as 100%. |
| gradient | boolean | false | Fill each area with a fade from its colour to transparent instead of a flat tint. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`, `tone-warning-mark`, `tone-info-mark`, `tone-1-mark`, `tone-2-mark`, `tone-3-mark`

## Motion

- **arrival** · Area + line · _custom (outside the recipe layer)_ — Once on screen, each line draws on (stroke-dashoffset) and its fill rises from the baseline, series staggered — the trend is read as it is drawn. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion="subtle"` (or a subtle app policy) shows the finished chart while hover feedback stays.
- **response** · Cursor + tooltip · _no motion_ — Hover and focus move the cursor and tooltip instantly — a lagging cursor reads as a slow chart.
- **transition** · Area + line · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place.
- **activity** · AreaChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: LineChart, BarChart, Sparkline, Card

## Examples

### A forecast and a Today line

```tsx
import { AreaChart } from "@sableui/react"

const prices = [
	{ day: "Mon", price: 41200, forecast: null },
	{ day: "Tue", price: 41900, forecast: null },
	{ day: "Wed", price: 42300, forecast: 42300 },
	{ day: "Thu", price: null, forecast: 43100 },
	{ day: "Fri", price: null, forecast: 44200 },
]

<AreaChart
	label="Price"
	data={prices}
	index="day"
	series={[
		{ key: "price", label: "Price" },
		{ key: "forecast", label: "Forecast", dashed: true },
	]}
	domain="auto"
	gradient
	yAxis
	yAxisSide="right"
	yAxisWidth={48}
	axisFormatter={(v) => `$${Math.round(v / 1000)}K`}
	valueFormatter={(v) => `$${v.toLocaleString()}`}
	referenceLines={[{ category: "Wed", label: "Today" }]}
/>
```

### Two series with a legend

```tsx
import { AreaChart } from "@sableui/react"

const visitors = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
]

<AreaChart
	label="Visitors, January to June"
	data={visitors}
	index="month"
	series={[
		{ key: "desktop", label: "Desktop" },
		{ key: "mobile", label: "Mobile" },
	]}
	indexFormatter={(m) => m.slice(0, 3)}
	gradient
/>
```

### Stacked to 100%

```tsx
import { AreaChart } from "@sableui/react"

<AreaChart
	label="Share of visitors by device"
	data={visitors}
	index="month"
	series={[
		{ key: "desktop", label: "Desktop" },
		{ key: "mobile", label: "Mobile" },
	]}
	stacked="expand"
	yAxis
	tooltip={{ indicator: "line", showTotal: true }}
/>
```
