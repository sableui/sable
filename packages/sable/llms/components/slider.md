# Slider

**Status:** stable

Slider over Base UI Slider — pointer + keyboard control, ARIA slider wiring, and range support via multiple thumbs. The default export composes Root + Control + Track + Indicator + Thumb; pass an array value for a range.

**Keywords:** slider, range, value, input

## Usage

Use Slider for bounded numeric choices where approximate adjustment is faster than typing.

### Best practices

- Do: Use visible labels, min/max context, and value output when precision matters.
- Do: Choose steps that match the real granularity of the setting.
- Don't: Do not use Slider when users must enter an exact arbitrary number; use NumberField.
- Don't: Do not use it without showing the value. A slider with no numeric readout makes any precise choice guesswork — pair it with a ScrubField or a NumberField.
- Don't: Do not resize the thumb's box on hover, focus, or drag. The thumb is a fixed-size hit target wrapping a decorative dot; only the dot scales. A target that grows under the cursor is a target nobody can learn, and WCAG 2.5.8 measures target size at rest. Restyle the dot, not the box.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| SliderRoot | yes | The controlled slider wrapper. |
| SliderControl | yes | The interactive slider control region. |
| SliderTrack | yes | The visible value range. |
| SliderIndicator | no | The filled portion of the track. |
| SliderThumb | yes | The draggable handle. |
| SliderValue | no | A readable value display. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| SliderRoot | Base UI Slider.Root props | The unstyled Base UI Root for custom composition — owns the value state and forwards value / defaultValue / onValueChange / min / max / step. Drag state surfaces via data-[dragging]. The default Slider export wires all the parts for you. |
| SliderControl | Base UI Control props + className | The interactive track lane — the positioning context the indicator and thumbs sit in; dims when disabled. |
| SliderTrack | Base UI Track props + className | The full-range rail beneath the indicator. |
| SliderIndicator | Base UI Indicator props + className | The filled portion from min (or the lower thumb) to the current value. |
| SliderThumb | Base UI Thumb props + className | A draggable handle: a fixed-size hit target wrapping a decorative dot. The dot rests small and scales to full size on hover, keyboard focus, and drag; the box never changes, so row metrics and the tap target hold. Range sliders render one per value; pass index for SSR. Interaction state surfaces via data-[dragging]. |
| SliderValue | Base UI Value props | Formatted value readout for custom compositions (e.g. a live number beside the control). |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | number \| number[] | — | Controlled value. An array renders a range slider with one thumb per entry. |
| defaultValue | number \| number[] | — | Uncontrolled initial value. An array renders a range slider. |
| onValueChange | (value, eventDetails) => void | — | Fires on every value change. value is a number (or number[] for a range). |
| min | number | 0 | Minimum allowed value. |
| max | number | 100 | Maximum allowed value. |
| step | number | 1 | Granularity the slider steps through. Snaps to multiples. |
| disabled | boolean | false | Ignore user interaction and dim the control. |
| orientation | 'horizontal' \| 'vertical' | horizontal | Axis the slider tracks along. A vertical slider has no intrinsic length — give it a height (h-40, or flex-1 in a column). |
| aria-label | string | — | Accessible name, applied to each thumb's input (the element with role=slider). A range also names its group with it. |
| getAriaLabel | (index) => string | — | Per-thumb name for a range ("Minimum price" / "Maximum price"). Wins over aria-label on the thumbs. |
| getAriaValueText | (formattedValue, value, index) => string | — | What a screen reader announces for the value when the number alone is wrong — a seek bar's "1:23 of 3:45". For units or percent, `format` (Intl.NumberFormatOptions) is enough. |

## Tokens used

`secondary`, `primary`, `background`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It arrives with the form or panel it sits in.
- **response** · Thumb · `motion-interactive` — The thumb's dot grows from 12px to full size on hover and keyboard focus, and a little past it while dragging, on a spring. Only the paint resizes, never the hit target, so the growth says the thumb is live without moving where you have to aim.
- **transition** · Thumb · _no motion_ — The thumb and the filled range follow the pointer one-to-one, and keyboard steps land at once. An eased position would trail the drag and show a value the user has already moved past.
- **activity** · Root · _no motion_ — A slider commits as it moves; there is nothing to wait for.

## Accessibility

- Base UI provides role=slider, aria-valuemin/max/now, and arrow-key / Page Up-Down / Home-End control.
- Each thumb is a focusable input[type=range] nested in the thumb element; keyboard focus raises a 2px ring on the thumb via has-[:focus-visible] (a bare focus-visible: on the thumb never fires, since the div itself is not focusable).
- The thumb's hit area is a fixed 16px box at every state. Only the decorative inner dot resizes — rest 12px, full 16px on hover, keyboard focus, and drag — so the target a pointer or finger must land on never moves or changes size. Keyboard users, who never hover, get the enlarged dot from focus-visible.
- The rest-to-full transition uses the motion duration/easing tokens, so it collapses to an instant state change under prefers-reduced-motion or MotionProvider off. The size change itself still happens: it reports interaction state, it is not decoration.
- Range sliders get one thumb per value with minStepsBetweenValues honored.
- Pass aria-label (or getAriaLabel for a range) so each handle has an accessible name. On Slider it reaches the thumb inputs; on a bare SliderRoot it only names the role=group — when composing, put aria-label / getAriaLabel on each SliderThumb, or label the Root with aria-labelledby or a Field, which Base UI does carry to the thumbs.
- getAriaValueText sets aria-valuetext for values a number misreads (time, named steps).

## Related

- Components: NumberField, Progress

## Examples

### Single value

```tsx
import { Slider } from "@sableui/react"

<Slider defaultValue={50} aria-label="Volume" />
```

### Range

```tsx
import { Slider } from "@sableui/react"

const [range, setRange] = useState([20, 60])
<Slider value={range} onValueChange={setRange} aria-label="Price range" getAriaLabel={(i) => (i ? "Maximum price" : "Minimum price")} />
```

### Seek bar with spoken time

```tsx
import { Slider } from "@sableui/react"

<Slider value={position} max={duration} onValueChange={seek} aria-label="Seek" getAriaValueText={(_, v) => `${formatTime(v)} of ${formatTime(duration)}`} />
```

### Stepped

```tsx
import { Slider } from "@sableui/react"

<Slider defaultValue={40} min={0} max={100} step={10} />
```

### Vertical

```tsx
import { Slider } from "@sableui/react"

<div className="h-40"><Slider orientation="vertical" defaultValue={40} aria-label="Level" /></div>
```

### Composed with a value readout

```tsx
import { Field, SliderControl, SliderIndicator, SliderRoot, SliderThumb, SliderTrack, SliderValue } from "@sableui/react"

<Field label="Volume"><SliderRoot defaultValue={40} className="flex items-center gap-3"><SliderControl><SliderTrack><SliderIndicator /><SliderThumb /></SliderTrack></SliderControl><SliderValue className="text-mono-sm" /></SliderRoot></Field>
```
