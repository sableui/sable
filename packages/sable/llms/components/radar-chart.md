# RadarChart

**Status:** beta

Several measures compared around a centre: one polygon per series over a polygon or circular web, filled or outline only, with optional dots, a radius scale and a tinted web. Polygons grow from the centre as the chart scrolls into view.

**Keywords:** chart, radar, spider, web, profile, skills, comparison, polar

## Usage

Use RadarChart to compare the shape of a profile across five to eight dimensions — skills, product scores, a cycle of months — for one to three series. The shape is the message; for exact values or more than three series, BarChart is easier to read.

### Best practices

- Do: Keep every spoke on the same scale and direction (more is better on all of them).
- Do: Use filled={false} when two polygons overlap heavily, so both outlines stay visible.
- Don't: Use fewer than five spokes — three or four make a triangle or square that says little; use BarChart.
- Don't: Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, unknown>[] | — | One row per spoke. |
| index | string | — | The datum field naming each spoke. |
| series | { key: string; label: string; tone?: ChartTone; color?: string; icon?: string }[] | — | The measures to plot: the datum field, its name in the legend/tooltip/table, and its colour (a tone by role, or any CSS colour). Omitted, series take the chart palette in order: --chart-1 … --chart-8, validated for colour-blind separation in light and dark; a theme may override the set. |
| label | string | — | What the chart shows. Its accessible name and the caption of the data table assistive tech reads. |
| className | string | "h-72" | Sizes the chart. Set a height. |
| grid | "polygon" \| "circle" \| "none" | "polygon" | The web behind the polygons. |
| gridFill | boolean | false | Tint the web's outer area. |
| filled | boolean | true | Fill each polygon; `false` draws outlines only. |
| dots | boolean | false | Mark every vertex with a dot. |
| radiusAxis | boolean | false | Print the ring values along the top spoke. |
| legend | boolean | true when there is more than one series | Show the legend. |
| tooltip | boolean \| { indicator?: "dot" \| "line" \| "dashed" \| "none"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean } | true | Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row. |
| valueFormatter | (value: number) => string | — | Format values everywhere (axis, labels, tooltip, table) — units like "$12,480". Default: compact on the axis, full elsewhere. |
| locale | string | runtime locale | BCP 47 locale for default number and date formatting. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The polygons growing in and morphing are the flourish; the hover highlight is the feedback `subtle` keeps. |
| animate | boolean | true | Grow the polygons from the centre when the chart scrolls into view. `animate={false}` is `motion="subtle"`. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`, `tone-warning-mark`, `tone-info-mark`, `tone-1-mark`, `tone-2-mark`, `tone-3-mark`

## Motion

- **arrival** · Polygon · _custom (outside the recipe layer)_ — Once on screen each polygon grows from the centre and fades in, series staggered, on the emphasized easing. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion="subtle"` (or a subtle app policy) shows the finished chart while hover feedback stays.
- **response** · Active spoke · _no motion_ — The hovered spoke's vertices and label highlight at once.
- **transition** · Polygon · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place.
- **activity** · RadarChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: BarChart, LineChart, Card

## Examples

### Two profiles

```tsx
import { RadarChart } from "@sableui/react"

const scores = [
	{ skill: "Speed", a: 86, b: 65 },
	{ skill: "Quality", a: 72, b: 90 },
	{ skill: "Support", a: 64, b: 80 },
	{ skill: "Price", a: 90, b: 55 },
	{ skill: "Docs", a: 70, b: 85 },
	{ skill: "Ecosystem", a: 60, b: 75 },
]

<RadarChart
	label="Product scores compared"
	data={scores}
	index="skill"
	series={[
		{ key: "a", label: "Atlas" },
		{ key: "b", label: "Beacon" },
	]}
/>
```

### Circular web, outlines only

```tsx
import { RadarChart } from "@sableui/react"

<RadarChart
	label="Atlas scores"
	data={scores}
	index="skill"
	series={[{ key: "a", label: "Atlas" }]}
	grid="circle"
	gridFill
	filled={false}
	dots
/>
```
