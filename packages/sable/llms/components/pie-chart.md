# PieChart

**Status:** beta

Parts of a whole as slices: a pie or donut, concentric rings for several measures, a total in the hole, slice labels inside or out, and an active slice that pulls outward. Slices sweep in clockwise as the chart scrolls into view.

**Keywords:** chart, pie, donut, doughnut, share, proportion, breakdown, parts, whole

## Usage

Use PieChart for a share of one total across two to six categories — traffic sources, a budget split, survey answers. A donut leaves room for the total in the middle (`centerLabel`). With more categories, or to compare values precisely, use BarChart; for a breakdown inside a stat card, SegmentedBar is lighter.

### Best practices

- Do: Put the total, or the headline slice, in a donut's centerLabel.
- Do: Configure slice names, tones and icons with categories, keyed by each slice's value in the data.
- Don't: Use more than six slices — merge the tail into "Other" or use BarChart.
- Don't: Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, unknown>[] | — | One row per slice. |
| index | string | — | The datum field naming each slice. |
| valueKey | string \| string[] | — | The datum field holding each slice's amount — or several fields, drawn as concentric rings, outer first. |
| label | string | — | What the chart shows. Its accessible name and the caption of the data table assistive tech reads. |
| categories | Record<string, { label?: string; tone?: ChartTone; color?: string; icon?: string }> | — | Labels, tones and icons per slice, keyed by the slice's name. Unlisted slices take the tones in order. |
| className | string | "h-64" | Sizes the chart. Set a height. |
| donut | boolean \| number | false | Cut out the middle: `true` for a ring at 60% of the radius, or a ratio (0–0.9). |
| centerLabel | { value: string \| number; label?: string } | — | A value and caption in the hole of a donut. The value holds the centre and the caption hangs below it. A number is formatted for you: in full up to 9,999, compact from 10,000 (10.2K, 102.1K, 1.2M); pass a string for units. |
| separator | boolean | true | A hairline in the surface colour between slices. |
| labels | "none" \| "outside" \| "inside" | "none" | Label each slice outside the pie or inside it. |
| labelContent | "value" \| "percent" \| "name" | "value" | What a slice label says. |
| legend | boolean | true unless slices are labelled | Show the legend. |
| tooltip | boolean \| { indicator?: "dot" \| "line" \| "dashed" \| "none"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean } | true | Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row. |
| valueFormatter | (value: number) => string | — | Format values everywhere (axis, labels, tooltip, table) — units like "$12,480". Default: compact on the axis, full elsewhere. |
| locale | string | runtime locale | BCP 47 locale for default number and date formatting. |
| animate | boolean | true | Sweep the slices in clockwise when the chart scrolls into view. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`

## Motion

- **arrival** · Slices · _custom (outside the recipe layer)_ — Once on screen the slices are revealed by a mask that sweeps clockwise from 12 o'clock — the whole is read as it fills. On the motion tokens; reduced motion shows the finished chart.
- **response** · Active slice · _no motion_ — The hovered slice pulls outward and the rest dim at once; the geometry change itself eases (see transition).
- **transition** · Slices · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place.
- **activity** · PieChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: SegmentedBar, RadialChart, BarChart, Card

## Examples

### Donut with a total

```tsx
import { PieChart } from "@sableui/react"

const sources = [
	{ source: "Search", visitors: 275 },
	{ source: "Direct", visitors: 200 },
	{ source: "Social", visitors: 187 },
	{ source: "Email", visitors: 90 },
]

<PieChart
	label="Visitors by source"
	data={sources}
	index="source"
	valueKey="visitors"
	donut
	centerLabel={{ value: 752, label: "Visitors" }}
/>
```

### Labelled slices

```tsx
import { PieChart } from "@sableui/react"

<PieChart
	label="Share of visitors by source"
	data={sources}
	index="source"
	valueKey="visitors"
	labels="outside"
	labelContent="percent"
	categories={{ Search: { tone: "primary" }, Email: { tone: "neutral" } }}
/>
```
