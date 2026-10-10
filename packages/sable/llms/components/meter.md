# Meter

**Status:** stable

A role=meter reading over Base UI Meter, drawn as a bar or a ring — how full something is within a known range (storage, quota, strength), with a tone for good/caution/bad. Not task progress.

**Keywords:** meter, usage bar, storage, quota, capacity, limit, password strength, level

## Usage

Use Meter to show a static measurement against a known maximum — storage used, seats taken, API quota, password strength. It is announced as a meter, not a progress bar, so a screen-reader user hears a level rather than a task underway.

### Best practices

- Do: Label it and show the reading in units people use ("7.2 of 10 GB"), with MeterLabel and MeterValue. The bar shows proportion; the number is what gets acted on.
- Do: Pick `tone` from thresholds you own and apply them consistently across the page — warning near the limit, destructive at or over it. The component does not guess where good becomes bad.
- Do: Use shape="ring" when the reading is a score that belongs in a small, glanceable spot on a card. It is the same measurement drawn as a circular gauge, not a different component.
- Don't: Do not use Meter for a task in flight — an upload, an install, a step count. That is Progress; Meter tells assistive tech nothing is happening.
- Don't: Do not use it for a value without a meaningful maximum (followers, total spend). A bar implies a full scale; an unbounded count is a stat.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| MeterTrack | yes | The rail that represents the full range. |
| MeterIndicator | yes | The fill, sized from value and coloured by tone. |
| MeterLabel | no | The visible name; also names the meter for assistive tech. |
| MeterValue | no | The formatted reading. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| MeterTrack | Base UI Track props + className + size | The rail. Rendered automatically when Meter has no children; renders a MeterIndicator by default. |
| MeterIndicator | Base UI Indicator props + className + tone | The fill. Inherits the Meter's tone unless given its own. |
| MeterLabel | Base UI Label props + className | Visible label; wires aria-labelledby on the root. |
| MeterValue | Base UI Value props + className | Formatted reading. Accepts a `(formatted, value) => ReactNode` child. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | number | — | The current reading, between min and max. Required. |
| min | number | 0 | The bottom of the range. |
| max | number | 100 | The top of the range. |
| tone | "primary" \| "standard" \| "success" \| "warning" \| "destructive" | "primary" | Fill colour, mapped to a semantic token. Choose it from your own thresholds. |
| shape | "bar" \| "ring" | "bar" | bar is a horizontal track; ring is a circular gauge for a small, glanceable reading — the same value, min, max and tones. |
| size | "sm" \| "md" \| "lg" | "md" | Ring diameter (40 / 64 / 96px at the default spacing; the centre value steps with it), or bar thickness on the same sm / md / lg rails as Progress. |
| showValue | boolean | — | Print the value in the ring's centre (formatted like MeterValue). |
| strokeWidth | number | 6 | Ring stroke width, in viewBox units of 100. |
| format | Intl.NumberFormatOptions | — | Formatting for MeterValue and aria-valuetext (percent, unit, currency). |
| getAriaValueText | (formatted: string, value: number) => string | — | Human-readable reading for assistive tech ("7.2 of 10 gigabytes used"). |
| locale | Intl.LocalesArgument | — | Locale for formatting. Defaults to the runtime locale. |

## Variants

- **tone**: primary, standard, success, warning, destructive
- **shape**: bar, ring
- **size**: sm, md, lg

## Tokens used

`secondary`, `primary`, `success`, `tone-warning`, `destructive`, `foreground`, `muted-foreground`

## Motion

- **arrival** · Meter · _no motion_ — A meter is a reading, present with the page that reports it. Animating the fill up from zero on load would act out a change that did not happen.
- **response** · Meter · _no motion_ — It reports and accepts no input. A bar that reacted to the pointer would read as a Slider the user could drag.
- **transition** · MeterIndicator · _custom (outside the recipe layer)_ — Width and colour ease on the motion tokens (no recipe animates width) when the reading changes — freeing space after a delete visibly shrinks the bar, so the user sees the cause and effect rather than a different bar.
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

### Tones

```tsx
import { Meter } from "@sableui/react"

<div className="flex flex-col gap-3">
	<Meter value={30} tone="success" aria-label="Seats used" />
	<Meter value={82} tone="warning" aria-label="API quota used" />
	<Meter value={100} tone="destructive" aria-label="Storage used" />
</div>
```
