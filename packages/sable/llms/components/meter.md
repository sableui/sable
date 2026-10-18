# Meter

**Status:** stable

A role=meter reading over Base UI Meter, drawn as a bar or a ring — how full something is within a known range (storage, quota, strength), with a tone for good/caution/bad. Not task progress.

**Keywords:** meter, usage bar, storage, quota, capacity, limit, password strength, level, segmented, tick bar, score, credits, spend limit

## Usage

Use Meter to show a static measurement against a known maximum — storage used, seats taken, API quota, password strength. It is announced as a meter, not a progress bar, so a screen-reader user hears a level rather than a task underway.

### Best practices

- Do: Label it and show the reading in units people use ("7.2 of 10 GB"), with MeterLabel and MeterValue. The bar shows proportion; the number is what gets acted on.
- Do: Pick `tone` from thresholds you own and apply them consistently across the page — warning near the limit, destructive at or over it. The component does not guess where good becomes bad.
- Do: Use shape="ring" when the reading is a score that belongs in a small, glanceable spot on a card. It is the same measurement drawn as a circular gauge, not a different component.
- Do: Use `segments` (a tick bar, ▮▮▮▮▮▮▯▯▯▯) for a discrete budget, score or quota read at a glance — a spend limit, credits left, an ICP lead score, months of data coverage. Pick a count that matches the unit when there is one (10 for a score out of 10, 12 for months) and otherwise size it to the track: a tick reads as a tick when it is taller than it is wide, about one per 8px of track (40 across a card row, 20 in a narrow table cell). Any reading above min shows at least one tick.
- Don't: Do not use Meter for a task in flight — an upload, an install, a step count. That is Progress; Meter tells assistive tech nothing is happening. → use **Progress**
- Don't: Do not use it for a value without a meaningful maximum (followers, total spend). A bar implies a full scale; an unbounded count is a stat.
- Don't: Do not segment a fine-grained continuous value where the exact proportion matters (disk at 73.4%) — ticks round it to the nearest mark; use the continuous bar. And do not use a tick bar for a task in flight or steps completed: that is Progress, or a Stepper for named steps. → use **Progress**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| MeterTrack | yes | The rail that represents the full range. |
| MeterIndicator | yes | The fill, sized from value and coloured by tone. Not used with `segments`: the track draws its ticks instead. |
| MeterLabel | no | The visible name; also names the meter for assistive tech. |
| MeterValue | no | The formatted reading. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| MeterTrack | Base UI Track props + className + size | The rail. Rendered automatically when Meter has no children; renders a MeterIndicator by default — or, when the Meter has `segments`, its row of ticks (children are not rendered then). |
| MeterIndicator | Base UI Indicator props + className + tone | The fill. Inherits the Meter's tone unless given its own. |
| MeterLabel | Base UI Label props + className | Visible label; wires aria-labelledby on the root. |
| MeterValue | Base UI Value props + className | Formatted reading. Accepts a `(formatted, value) => ReactNode` child. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | — | The current reading, between min and max. Required. |
| min | number | 0 | The bottom of the range. |
| max | number | 100 | The top of the range. |
| tone | "primary" \| "3" \| "success" \| "warning" \| "destructive" | "primary" | Fill colour, mapped to a semantic token. Choose it from your own thresholds. |
| shape | "bar" \| "ring" | "bar" | bar is a horizontal track; ring is a circular gauge for a small, glanceable reading — the same value, min, max and tones. |
| size | "sm" \| "md" \| "lg" | "md" | Ring diameter (40 / 64 / 96px at the default spacing; the centre value steps with it), or bar thickness on the same sm / md / lg rails as Progress. |
| showValue | boolean | — | Print the value in the ring's centre (formatted like MeterValue). |
| segments | number | — | Draw the bar as this many separate ticks instead of a continuous fill (a quota, score or spend limit). Filled ticks = round(share × N), at least one for any reading above min, none at min. Ticks take the tone; empty ones sit on the rail colour. The segmented track has its own, taller sm / md / lg ladder. Bar only: ignored for shape="ring". |
| strokeWidth | number | 6 | Ring stroke width, in viewBox units of 100. |
| format | Intl.NumberFormatOptions | — | Formatting for MeterValue and aria-valuetext (percent, unit, currency). |
| getAriaValueText | (formatted: string, value: number) => string | — | Human-readable reading for assistive tech ("7.2 of 10 gigabytes used"). |
| locale | Intl.LocalesArgument | — | Locale for formatting. Defaults to the runtime locale. |

## Variants

- **tone**: primary, 3, success, warning, destructive
- **shape**: bar, ring
- **size**: sm, md, lg

## Tokens used

`secondary`, `primary`, `tone-3`, `success`, `tone-warning`, `destructive`, `foreground`, `muted-foreground`, `destructive-mark`, `success-mark`, `tone-warning-mark`, `tone-3-mark`

## Motion

- **arrival** · Meter · _no motion_ — A meter is a reading, present with the page that reports it. Animating the fill up from zero on load would act out a change that did not happen.
- **response** · Meter · _no motion_ — It reports and accepts no input. A bar that reacted to the pointer would read as a Slider the user could drag.
- **transition** · MeterIndicator · _custom (outside the recipe layer)_ — Width and colour ease on the motion tokens (no recipe animates width) when the reading changes — freeing space after a delete visibly shrinks the bar, so the user sees the cause and effect rather than a different bar.
- **transition** · MeterTrack (segments) · _custom (outside the recipe layer)_ — With segments, the fill runs through the ticks from the edge it is leaving — left to right as it grows, right to left as it shrinks — each tick easing its colour on the fast token after a stagger that is a share of the slow token (a full sweep is one slow duration) × --motion-expressive. Every tick switching at once would read as a different bar, not the same budget moving; `subtle` lands them together and off is instant.
- **activity** · Meter · _no motion_ — A meter has no indeterminate state; a reading is either known or not shown. Unknown-but-working is Progress with no value.

## Accessibility

- Base UI renders role=meter with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext — distinct from Progress's role=progressbar.
- Name it with MeterLabel or aria-label; an unnamed meter is announced as a bare number.
- Tone is colour only. Say the state in text too ("Almost full") when it matters, and use getAriaValueText to give units.

## Related

- Components: Progress, Badge

## Examples

### Ring

```tsx
import { Meter } from "@sableui/react"

<Meter shape="ring" value={72} showValue aria-label="Storage used" />
```

### Bare

```tsx
import { Meter } from "@sableui/react"

<Meter value={64} aria-label="Storage used" />
```

### Storage with label and reading

```tsx
import { Meter, MeterLabel, MeterTrack, MeterValue } from "@sableui/react"

<Meter value={7.2} max={10} tone="warning" getAriaValueText={(_, v) => `${v} of 10 gigabytes used`}>
	<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<MeterLabel>Storage</MeterLabel>
		<MeterValue>{(_, value) => `${value} of 10 GB`}</MeterValue>
	</div>
	<MeterTrack />
</Meter>
```

### Segmented spend limit

```tsx
import { Meter, MeterLabel, MeterTrack, MeterValue } from "@sableui/react"

<Meter value={1240} max={2000} segments={40} getAriaValueText={() => "€1,240 of €2,000 spent this month"}>
	<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<MeterLabel>Monthly spend limit</MeterLabel>
		<MeterValue>{() => "€1,240 / €2,000"}</MeterValue>
	</div>
	<MeterTrack />
</Meter>
```

### Segmented score cell

```tsx
import { Meter } from "@sableui/react"

<div className="flex items-center gap-3">
	<Meter value={8} max={10} segments={10} size="sm" tone="success" className="w-24" aria-label="ICP score" getAriaValueText={(_, v) => `${v} out of 10`} />
	<span className="text-mono-sm text-foreground">8/10</span>
</div>
```

### Tones

```tsx
import { Meter } from "@sableui/react"

<div className="flex flex-col gap-3">
	<Meter value={30} tone="success" aria-label="Seats used" />
	<Meter value={82} tone="warning" aria-label="API quota used" />
	<Meter value={100} tone="destructive" aria-label="Storage used" />
</div>
```
