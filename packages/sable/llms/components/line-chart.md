# LineChart

**Status:** beta

Lines over a sequence — for comparing how measures move. Smooth, linear or step curves, optional dots (coloured by series or by category) and value labels. Lines draw on as the chart scrolls into view.

**Keywords:** chart, line, trend, time series, graph, compare, analytics, dashboard

## Usage

Use LineChart to compare how two or more measures change over the same sequence, or to show one trend precisely (with dots and labels). Unlike AreaChart, its value axis is fitted to the data rather than forced to zero, so small movements stay visible — say so if the axis is shown.

### Best practices

- Do: Turn on dots and labels for six or fewer points, when the exact values are the story.
- Do: Use curve="step" for values that hold until they change — prices, plan tiers, headcount.
- Don't: Plot unordered categories (channels, products) as a line — the line implies a path between them; use BarChart.
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
| animate | boolean | true | Play the arrival once the chart scrolls into view. Reduced motion shows the finished chart. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |
| curve | "smooth" \| "linear" \| "step" | "smooth" | How the line runs between points. `smooth` is monotone: it never overshoots a value the data does not contain. |
| dots | boolean | false | Mark every data point with a dot. |
| colorBy | "series" \| "index" | "series" | Colour the dots by series, or each by its category. |
| labels | boolean | false | Print each point's value above it. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`

## Motion

- **arrival** · Line · _custom (outside the recipe layer)_ — Once on screen each line draws on from the first point (stroke-dashoffset), series staggered, then the dots and labels fade in. On the motion tokens; reduced motion shows the finished chart.
- **response** · Cursor + tooltip · _no motion_ — Hover and focus move the cursor and tooltip instantly — a lagging cursor reads as a slow chart.
- **transition** · Line + dots · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place.
- **activity** · LineChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: AreaChart, BarChart, Sparkline, Card

## Examples

### Compare two series

```tsx
import { LineChart } from "@sableui/react"

<LineChart
	label="Desktop and mobile visitors"
	data={visitors}
	index="month"
	series={[
		{ key: "desktop", label: "Desktop", tone: "primary" },
		{ key: "mobile", label: "Mobile", tone: "info" },
	]}
	indexFormatter={(m) => m.slice(0, 3)}
/>
```

### Dots and labels

```tsx
import { LineChart } from "@sableui/react"

<LineChart
	label="Desktop visitors"
	data={visitors}
	index="month"
	series={[{ key: "desktop", label: "Desktop" }]}
	curve="linear"
	dots
	labels
	grid={false}
/>
```
