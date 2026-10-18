# NumberField

**Status:** stable

Numeric input with decrement/increment steppers over Base UI NumberField — keyboard arrows, scroll, scrub-to-change, min/max clamping, locale formatting, and form integration. Styled like Input; drops straight into a Field.

**Keywords:** number field, numeric input, stepper, form

## Usage

Use NumberField for numeric values that benefit from validation, min/max bounds, or step controls.

### Best practices

- Do: Use it for quantities, thresholds, percentages, and other real numeric values.
- Do: Set sensible min, max, and step behavior when the domain has bounds.
- Don't: Do not use NumberField for identifiers such as phone numbers, ZIP codes, or credit card numbers.
- Don't: Do not use it in a property grid with steppers left on. Its two 32px stepper buttons (36px each with their inset) put a ~110px floor on a control that needs ~44px there — pass steppers={false}, or use ScrubField.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| min | number | — | Lower bound. Clamps typing, arrows, scroll and scrub alike, so the value cannot leave the range by any route. |
| max | number | — | Upper bound, clamped on every input route the same way as `min`. |
| value / defaultValue | number | — | Controlled / uncontrolled numeric value. |
| onValueChange | (value: number \| null, event) => void | — | Fired when the value changes (null when cleared). |
| step / smallStep / largeStep | number | — | Increment amount; smallStep applies with the meta key, largeStep with shift. |
| format | Intl.NumberFormatOptions | — | Locale formatting (currency, percent, units, …). |
| steppers | boolean | true | Show the decrement / increment buttons. Turn off in a dense property grid — the two 32px stepper buttons (36px with their inset) put a ~110px floor on the control; without them the value left-aligns. |
| disabled / readOnly / required / name / id | — | — | Standard form-control props. Base UI applies id + required to the input, so it labels and validates correctly. |

## Tokens used

`field-border`, `field`, `foreground`, `muted-foreground`, `accent`, `accent-foreground`, `ring`

## Accessibility

- Decrement / Increment are labelled buttons (Decrease / Increase); the input is a spinbutton with aria-valuenow/min/max from Base UI.
- Routes aria-describedby / aria-invalid onto the input, so a Field's helper + error are announced for it.

## Related

- Components: Input, Slider

## Examples

### Bounded

```tsx
import { NumberField } from "@sableui/react"

<NumberField defaultValue={1} min={0} max={99} />
```

### In a field

```tsx
import { Field, NumberField } from "@sableui/react"

<Field label="Quantity"><NumberField min={1} defaultValue={1} /></Field>
```

### Currency

```tsx
import { NumberField } from "@sableui/react"

<NumberField defaultValue={9.99} format={{ style: "currency", currency: "USD" }} />
```
