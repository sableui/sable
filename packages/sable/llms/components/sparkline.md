# Sparkline

**Status:** beta

A word-sized trend with no axes — a line, a line over a soft fill, or columns — sized by its container, for stat cards, table cells and sentences. Draws on as it scrolls into view.

**Keywords:** sparkline, trend, mini chart, inline chart, micro chart, kpi, stat

## Usage

Use Sparkline next to a number to show where it has been — a KPI's last 30 days in a stat card, a row's trend in a table. It has no axes, tooltip or values to read off; when the reader needs those, use AreaChart or LineChart.

### Best practices

- Do: Pair it with the current value and its change in text; the sparkline shows only the shape.
- Do: Give it a label that names the measure and the period — the spoken summary adds the range and latest value.
- Don't: Put two sparklines on one shared axis to compare them — each scales to its own data; use LineChart.
- Don't: Use it as the only place a number appears; a shape without a value cannot be read off.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | number[] | — | The values, oldest first. |
| label | string | — | What the line tracks ("Revenue, last 30 days"). The spoken summary adds the first and last values, low and high. |
| variant | "line" \| "area" \| "bar" | "line" | A line, a line over a soft fill, or columns. |
| tone | "1" \| "2" \| "3" \| "info" \| "warning" \| "primary" \| "neutral" \| "success" \| "destructive" | "primary" | Colour by role. |
| className | string | "h-8 w-24" | Sizes it; the drawing stretches to fit. |
| motion | "full" \| "subtle" \| "off" | "full" | How much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting. Drawing on (or rising) is the flourish, so `subtle` and `off` show the finished line. |
| animate | boolean | true | Draw on (or rise) when it scrolls into view. `animate={false}` is `motion="subtle"`. |
| locale | string | runtime locale | BCP 47 locale for default number and date formatting. |

## Variants

- **variant**: line, area, bar

## Tokens used

`primary`, `tone-1`, `tone-2`, `tone-3`, `tone-info`, `tone-warning`, `muted-foreground`, `success`, `destructive`

## Motion

- **arrival** · Line / bars · _custom (outside the recipe layer)_ — Once on screen the line draws on (or the bars rise, in sequence). On the motion tokens; reduced motion shows the finished drawing. The arrival is expressive: it plays at the full motion level only, so `motion="subtle"` (or a subtle app policy) shows the finished line.
- **response** · Sparkline · _no motion_ — Not interactive: it has no tooltip or focus.
- **transition** · Sparkline · _no motion_ — New data redraws in place; a word-sized chart animating on every update would distract from the number beside it.
- **activity** · Sparkline · _no motion_ — No indeterminate state.

## Accessibility

- Rendered role=img with an aria-label built from `label` and the data: "Revenue, last 30 days: from 120 to 184, low 96, high 190".
- It is not focusable and has no tooltip, so the number it accompanies must be in text beside it.

## Related

- Components: AreaChart, LineChart, Card, Table

## Examples

### In a stat card

```tsx
import { Card, CardAction, CardDescription, CardHeader, CardTitle, Sparkline } from "@sableui/react"

<Card>
	<CardHeader>
		<CardDescription>Revenue</CardDescription>
		<CardTitle className="text-mono-xl">$18,240</CardTitle>
		<CardAction>
			<Sparkline label="Revenue, last 12 weeks" data={[12, 14, 13, 17, 16, 19, 18, 21, 20, 24, 23, 26]} variant="area" tone="success" />
		</CardAction>
	</CardHeader>
</Card>
```

### Columns in a table cell

```tsx
import { Sparkline } from "@sableui/react"

<Sparkline label="Daily signups, last 14 days" data={[4, 6, 3, 8, 7, 9, 5, 6, 10, 8, 7, 11, 9, 12]} variant="bar" className="h-6 w-20" />
```
