# Progress

**Status:** stable

Linear progress bar over Base UI Progress — value 0–100 drives the fill; omit value (or pass null) for an indeterminate, pulsing bar.

**Keywords:** progress, task progress, meter, loading

## Usage

Use Progress to communicate determinate or indeterminate completion for a task or process.

### Best practices

- Do: Use determinate values when progress can be measured.
- Do: Pair the visual indicator with text when users need context or exact values.
- Don't: Do not use Progress as a decorative divider or status color bar.
- Don't: Do not use a determinate Progress for an unknown duration. A bar that sits at 90% is worse than a Spinner, because it makes a promise about time that you cannot keep.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| ProgressTrack | yes | The background track that defines the range. |
| ProgressIndicator | yes | The filled or animated progress indicator. |
| ProgressLabel | no | A text label for the progress task. |
| ProgressValue | no | A readable value such as 45 percent. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ProgressTrack | Base UI Track props + className | The rail. Rendered automatically when Progress has no children; renders a ProgressIndicator child by default. Takes `size` (inherited from Progress) for its thickness — use that rather than a className height. |
| ProgressIndicator | Base UI Indicator props + className | The fill. Width is set by Base UI from the value; spans full width and pulses while indeterminate. |
| ProgressLabel | Base UI Label props + className | Accessible label; wires aria-labelledby on the Root. |
| ProgressValue | Base UI Value props + className | Formatted value readout. Accepts a render-function child for custom formatting. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | number \| null | null | Current value between min and max. null (or omitted) renders the indeterminate state. |
| min | number | 0 | The minimum value of the range. |
| max | number | 100 | The maximum value of the range. |
| format | Intl.NumberFormatOptions | — | Formatting options for ProgressValue (e.g. style: 'percent', or a currency). |
| getAriaValueText | (formatted, value) => string | — | Returns a human-readable text alternative for aria-valuenow. |
| size | "sm" \| "md" \| "lg" | "md" | Bar thickness, on the same three rails as Meter so the two match on one page. ProgressTrack inherits it. |

## Variants

- **size**: sm, md, lg

## Tokens used

`secondary`, `primary`, `foreground`, `muted-foreground`

## Motion

- **arrival** · Root · _no motion_ — A progress bar appears because work started. Staging its entrance delays the one piece of information the reader is waiting for.
- **response** · Root · _no motion_ — It reports; it does not accept input. A bar that reacted to the pointer would read as a Slider, which is a control the reader can drag.
- **transition** · ProgressIndicator · _custom (outside the recipe layer)_ — Fill width eases between values on the motion tokens (no recipe animates width), so the bar reads as filling rather than as a series of unrelated widths. It matters most where progress arrives in coarse jumps — four chunked upload callbacks look like a glitching bar without it.
- **activity** · ProgressIndicator · `motion-pulse` — Indeterminate (value null) has no width to animate, so the pulse carries the whole signal that work is still happening. Without it the indeterminate state is a static bar — indistinguishable from a stalled determinate one.

## Accessibility

- Base UI sets role=progressbar with aria-valuenow / aria-valuemin / aria-valuemax and reports status to screen readers.
- Indeterminate state (value null) omits aria-valuenow per the ARIA spec.
- Pair ProgressLabel with the bar for a visible, associated name; ProgressValue exposes the formatted value.

## Related

- Components: Spinner, Skeleton

## Examples

### Determinate

```tsx
import { Progress } from "@sableui/react"

<Progress value={64} aria-label="Upload" />
```

### Indeterminate

```tsx
import { Progress } from "@sableui/react"

<Progress aria-label="Preparing export" />
```

### With label and value

```tsx
import { Progress, ProgressLabel, ProgressTrack, ProgressValue } from "@sableui/react"

<Progress value={40}><div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><ProgressLabel>Uploading</ProgressLabel><ProgressValue /></div><ProgressTrack /></Progress>
```
