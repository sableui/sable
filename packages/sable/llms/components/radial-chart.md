# RadialChart

**Status:** beta

Progress or share as rings: one ring per row against a muted track, a full circle or a gauge (`sweep`), one ring split between rows (`stacked`), ring labels and a value in the middle. Rings draw round as the chart scrolls into view.

**Keywords:** chart, radial, ring, gauge, progress, goal, score, activity rings, donut

## Usage

Use RadialChart for progress toward goals (several rings), a single score or usage gauge (`sweep={180}` with `centerLabel`), or a split of one total along a gauge (`stacked`). For one reading in a form or settings row, Meter's ring shape is lighter.

### Best practices

- Do: Set max to the goal, so a full ring means "done".
- Do: Pair a gauge with centerLabel stating the value in words or units.
- Don't: Compare more than four rings — inner rings are shorter for the same value, which misleads; use BarChart.
- Don't: Use it for data-heavy views — streaming or real-time data, thousands of points, zoom and brushing, trading charts. Those belong on a charting library (Recharts, visx, ECharts); Sable's charts are for dashboards, landing pages and decks.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | Record<string, unknown>[] | — | One row per ring, outermost first. |
| index | string | — | The datum field naming each ring. |
| valueKey | string | — | The datum field holding each ring's amount. |
| label | string | — | What the chart shows. Its accessible name and the caption of the data table assistive tech reads. |
| categories | Record<string, { label?: string; tone?: ChartTone; color?: string; icon?: string }> | — | Labels, tones and icons per ring, keyed by the ring's name. |
| className | string | "h-64" | Sizes the chart. Set a height. |
| max | number | the largest value (stacked: the total; labelled: the largest value ÷ 0.75, leaving room for the labels) | The value a full ring stands for. |
| sweep | number | 360 | How far round a full ring runs, in degrees: 360 for a circle, 180 for a gauge. |
| stacked | boolean | false | Split ONE ring between the rows instead of a ring each. |
| track | boolean | true | Draw each ring's full track behind it. |
| labels | boolean | false | Name each ring at its start. |
| centerLabel | { value: string \| number; label?: string } | — | A value and caption in the middle. On a full ring the value holds the centre and the caption hangs below it. A number is formatted for you: in full up to 9,999, compact from 10,000 (10.2K); pass a string for units ("7.2 GB", "72%"). |
| legend | boolean | true unless rings are labelled | Show the legend. |
| tooltip | boolean \| { indicator?: "dot" \| "line" \| "dashed" \| "none"; hideLabel?: boolean; labelFormatter?: (label, datum) => ReactNode; showTotal?: boolean } | true | Show a tooltip on hover and keyboard focus, or configure it: the row marker, hiding the heading, rewriting it, adding a Total row. |
| valueFormatter | (value: number) => string | — | Format values everywhere (axis, labels, tooltip, table) — units like "$12,480". Default: compact on the axis, full elsewhere. |
| locale | string | runtime locale | BCP 47 locale for default number and date formatting. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. The draw-on, the ring morph and the rolling centre number are the flourish; the hover dim is the feedback `subtle` keeps. |
| animate | boolean | true | Draw the rings round from their start when the chart scrolls into view. `animate={false}` is `motion="subtle"`. |
| activeIndex | number \| null | — | The highlighted row (controlled); `null` for none. |
| defaultActiveIndex | number \| null | — | The row highlighted at first — a tooltip already open before anyone hovers. |
| onActiveIndexChange | (index: number \| null) => void | — | Called as the pointer or keyboard moves between rows. |

## Tokens used

`tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `primary`, `muted-foreground`, `border`, `popover`, `popover-foreground`, `foreground`, `background`

## Motion

- **arrival** · Ring · _custom (outside the recipe layer)_ — Once on screen each ring draws round from its start (stroke-dashoffset on a round-capped arc), staggered outside in. On the motion tokens; reduced motion shows the finished chart. The arrival is expressive: it plays at the full motion level only, so `motion="subtle"` (or a subtle app policy) shows the finished chart while hover feedback stays.
- **response** · Active ring · _no motion_ — The hovered ring stays full strength and the others dim at once — mixed toward the surface rather than faded, so a dimmed ring stays solid over its track instead of turning muddy. Essential: `subtle` keeps it.
- **transition** · Centre value · _custom (outside the recipe layer)_ — A numeric centre value rolls to its new total digit by digit (NumberTicker) when the data changes, so the headline is seen moving with the rings instead of being found different afterwards. Expressive: under `subtle` it updates in place.
- **transition** · Ring · _custom (outside the recipe layer)_ — Geometry eases from the old shape to the new one through a CSS `d` transition on the motion tokens (no recipe animates path geometry); browsers without `d` transitions update in place. Expressive, like the arrival: under `subtle` new data swaps in place.
- **activity** · RadialChart · _no motion_ — A chart has no indeterminate state; show a Skeleton while the data loads.

## Accessibility

- The drawing is aria-hidden; the same numbers are in a visually hidden data table (captioned by `label`) that the chart is aria-describedby, so assistive tech reads values, not shapes.
- With a tooltip, the chart is one tab stop (role=group, aria-roledescription="chart"): arrow keys, Home and End step through the data, Escape clears, and each step is announced in a polite live region.
- Colour is never the only key: series are named in the legend, tooltip and table.

## Related

- Components: Meter, PieChart, Progress, Card

## Examples

### Goal rings

```tsx
import { RadialChart } from "@sableui/react"

<RadialChart
	label="Weekly goals"
	data={[
		{ goal: "Move", progress: 82 },
		{ goal: "Exercise", progress: 64 },
		{ goal: "Stand", progress: 91 },
	]}
	index="goal"
	valueKey="progress"
	max={100}
	labels
/>
```

### Gauge with a value

```tsx
import { RadialChart } from "@sableui/react"

<RadialChart
	label="Plan usage"
	data={[{ plan: "Used", gb: 7.2 }]}
	index="plan"
	valueKey="gb"
	max={10}
	sweep={180}
	centerLabel={{ value: "7.2 GB", label: "of 10 GB" }}
	legend={false}
/>
```
