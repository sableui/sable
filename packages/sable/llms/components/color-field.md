# ColorField

**Status:** stable

A colour swatch that opens a themed picker — saturation/value area, hue and alpha sliders, hex entry, presets, and transparent as a value rather than a separate toggle.

**Keywords:** color, colour, color picker, swatch, hex, alpha, transparency, eyedropper, property, workspace

## Usage

Use ColorField wherever a colour is a property: a canvas background, an effect parameter, a stroke or fill. It is sized to the control ladder so it lines up inside a PropertyRow or PropertyPair. Deliberately not <input type="color">, which opens the OS dialog — that ignores the theme entirely, cannot show a transparency checkerboard, has no alpha channel, hosts no eyedropper or presets, and renders at whatever size the platform picks, so it never aligns in a property grid.

### Best practices

- Do: Use allowTransparent when "no colour" is a real value. It appears inside the picker as a value; a transparent switch sitting beside a colour control reads as two properties when it is one.
- Do: Pass swatches when a surface has a house palette. Presets are how most colour choices actually get made, and they cost one row.
- Do: Decide whether your persistence layer accepts 8-digit hex before enabling allowAlpha. The value format is the contract — see the tokens note.
- Don't: Put a separate opacity slider next to a ColorField that already has allowAlpha. Two controls writing one channel is how they drift out of sync.
- Don't: Re-derive hue from the committed value on every render. Grey has no hue, so dragging saturation to zero would snap the hue slider to red with no way back — ColorField keeps hue in its own state for exactly this reason.
- Don't: Hand-roll a transparency checkerboard. Use the `checkerboard` utility with `--checkerboard-size` (~16px for an artboard, ~8px for a 24px swatch); two hand-rolled copies had already drifted before it existed. Its colours come from --panel / --panel-raised, so it is correct in both modes. It is deliberately not named bg-checkerboard: a custom bg-* utility lands in tailwind-merge's background group and silently evicts, or is evicted by, a real bg-* colour class.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Trigger | yes | A swatch at --control-xs with a hairline ring, on a checkerboard so a translucent or transparent value reads as such. |
| Picker | yes | Saturation/value area over the current hue, a hue slider, an alpha slider when allowAlpha, and a hex field. |
| Presets | no | An optional swatch row, and the Transparent entry when allowTransparent. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | — | The current value: "transparent", "#rrggbb", or "#rrggbbaa". |
| onValueChange | (value: string) => void | — | Called with the new value on every commit, including mid-drag. |
| allowTransparent | boolean | false | Offers "transparent" as a value inside the picker. Colour → transparent → colour restores the colour you had. |
| allowAlpha | boolean | false | Enables the alpha slider, and therefore 8-digit hex output. Off by default because it widens the value format. |
| swatches | Array<string \| { value: string; label: string }> | — | Optional preset row. A bare hex is named by its hex; give a preset a label ("Brand red") when the hex says nothing to a listener. |
| label | string | "Colour" | Accessible name for the trigger; the current value is appended to it. |
| name | string | — | Submits the colour with a form under this name, through a hidden input: "#rrggbb" (lowercase), "#rrggbbaa" when allowAlpha and translucent, or "transparent" — the same shapes onValueChange emits. |
| form | string | — | Id of a form elsewhere on the page that the hidden input belongs to. |
| readOnly | boolean | false | Shows the colour and keeps it focusable, but the picker does not open. The value still submits. |
| required | boolean | — | Accepted so a Field marked required does not leak the attribute onto the button. A ColorField always holds a value, so there is nothing for it to block. |
| transparentLabel | string | "Transparent" | The transparent value's name, in the trigger's accessible name and on its toggle. |
| hexLabel | (label: string) => string | (label) => `${label} hex` | Accessible name of the hex input, given label. |
| eyedropperLabel | string | "Pick colour from screen" | Accessible name of the eyedropper button. |

## Tokens used

`panel`, `panel-raised`, `hairline`, `hairline-strong`, `ring`, `popover`

## Motion

- **arrival** · Popover · `motion-pop` — The picker grows out of the swatch it edits (PopoverContent's recipe, its origin on the anchor). In a property panel with a column of swatches, that origin is what tells you which colour you are now editing.
- **response** · Swatch · `motion-interactive` — Preset swatches lift slightly under the pointer. They are 20px chips of colour with no label, and the eased lift is what tells you which one a click will take.
- **transition** · Handles · _no motion_ — The saturation, hue and alpha handles follow the pointer exactly. A handle that trailed the drag would misreport the colour under the cursor, and a swatch or a typed hex moving them is the value changing, which the field should show at once.
- **activity** · Root · _no motion_ — Picking is synchronous. The EyeDropper is the browser's own modal, with its own feedback.

## Accessibility

- The trigger's accessible name includes the current value, so a screen reader announces the colour rather than just "button" — the swatch itself conveys nothing without sight.
- The Transparent entry is a toggle with aria-pressed, because it is a state of the value and not a navigation action.
- The hex field is the keyboard path to any colour. The saturation/value area and the sliders are pointer-driven and are NOT keyboard operable — a known gap, and the reason the hex field is never hidden.
- Preset swatches show a focus outline past their hairline, and are named by their label when given one, by their hex when not.
- Inside a Field, the id, aria-describedby and aria-invalid it clones land on the trigger, so the label, description and error belong to it.
- The eyedropper is only rendered where the EyeDropper API exists (Chromium), rather than shown and broken elsewhere.

## Related

- Components: PropertyRow, PropertyPair, ScrubField, Input, Popover

## Examples

### In a form, with named presets

```tsx
import { ColorField, Field } from "@sableui/react"

<Field label="Brand colour">
  <ColorField
    name="brand"
    value={brand}
    onValueChange={setBrand}
    swatches={[{ value: "#e11d48", label: "Brand red" }, { value: "#0f172a", label: "Ink" }]}
  />
</Field>
```

### Canvas background

```tsx
import { ColorField, PropertyRow } from "@sableui/react"

<PropertyRow label="Background">
  <ColorField value={background} onValueChange={setBackground} allowTransparent />
</PropertyRow>
```

### With alpha and a palette

```tsx
import { ColorField } from "@sableui/react"

<ColorField
  value={tint}
  onValueChange={setTint}
  allowAlpha
  swatches={["#f43f5e", "#facc15", "#22c55e", "#3b82f6", "#a855f7"]}
  label="Tint"
/>
```

### The value format is the contract

```tsx
import { isTransparent, parseHex } from "@sableui/react"

// ColorField only ever EMITS these three shapes:
//   "transparent" | "#rrggbb" | "#rrggbbaa"
// It accepts #rgb and #rgba on paste but never produces them, so a consumer's
// parser has three cases to handle rather than five.
//
// Alpha is omitted when fully opaque — "#3b82f6", never "#3b82f6ff" — so a
// parser written before alpha support keeps reading opaque colours correctly.
// Only enable allowAlpha once your parser and your persisted format accept the
// 8-digit form, or a document saved by a newer build degrades on an older one.

import { parseHex, isTransparent } from "@sableui/react"

const parsed = isTransparent(value) ? null : parseHex(value) // null = not a colour
```
