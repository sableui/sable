# Label

**Status:** stable

Styled native <label>. Paired label typography via a size step (xs / sm / md / lg, all sentence case) or an uppercase eyebrow (eyebrow), non-selectable, dims when its peer control is disabled. Optional hint adds a dotted-underline tooltip affordance.

**Keywords:** label, form label, control, accessibility

## Usage

Use Label to name a form control and create a clear accessible relationship with that control.

### Best practices

- Do: Use explicit, persistent labels for inputs, selects, textareas, and grouped controls.
- Do: Place helper text separately so the label stays short and direct.
- Don't: Do not rely on placeholder text as the only label for a control.
- Don't: Do not use it as a bare styled span. A Label without htmlFor or a wrapped control looks like a label and does nothing — clicking it will not focus the field, which is the entire point.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| htmlFor | string | — | Associates the label with a control by its id (native <label for>). |
| size | "xs" \| "sm" \| "md" \| "lg" | "lg" | Paired label typography step, all sentence case. xs is simply the smallest; for an uppercase eyebrow use eyebrow. |
| eyebrow | boolean | false | Set the label as an eyebrow: the uppercase, letter-spaced text-overline tier (themeable to sentence case). Replaces size. For a kicker above a group, not an ordinary field label. |
| hint | ReactNode | — | When set, the label gets a dotted-underline affordance and reveals this content in a tooltip on hover/focus. |
| className | string | — | Merge or override classes via cn(). |

## Variants

- **size**: xs, sm, md, lg

## Tokens used

`foreground`, `muted-foreground`

## Accessibility

- Renders a native <label> — clicking it focuses/activates the associated control.
- Associate with a control via htmlFor (matching the control's id) or by wrapping the control.
- In a form, use Field: it renders this Label, wires htmlFor/id, and dims the label when the field is disabled. Hand-wired outside a Field, the label only dims via peer-disabled when the control carries `peer` AND precedes the Label in the DOM (Tailwind peer-* only matches a later sibling).
- With `hint`, the label becomes focusable and the help text is announced via the tooltip's aria-describedby — so the affordance works for keyboard and screen-reader users, not just hover.

## Related

- Components: Input, Textarea, Fieldset, Form, Field

## Examples

### With control

```tsx
import { Input, Label, Stack } from "@sableui/react"

<Stack gap={1}><Label htmlFor="name">Display name</Label><Input id="name" /></Stack>
```

### In a form

```tsx
import { Field, Input } from "@sableui/react"

<Field label="Display name" disabled><Input /></Field>
```

### With hint

```tsx
import { Label } from "@sableui/react"

<Label htmlFor="discount" hint="Taken off every order this code is used on.">Discount</Label>
```
