# Checkbox

**Status:** stable

Square toggle (18px at rest, on the spacing scale) over Base UI's Checkbox. Checked/indeterminate/disabled states; controlled or uncontrolled; form-ready via the hidden native input.

**Keywords:** checkbox, boolean, multi select, form control

## Usage

Use Checkbox for independent boolean choices or for selecting multiple options in a set.

### Best practices

- Do: Use Checkbox when each option can be toggled independently.
- Do: Attach a visible label that explains the consequence of checking the control.
- Don't: Do not use Checkbox for mutually exclusive choices; use Radio or Select instead.
- Don't: Do not use it without a label or an aria-label. An 18px square with no accessible name is announced as just "checkbox", which tells a screen-reader user nothing about what they are agreeing to.
- Don't: Do not phrase the label as a negative, such as "Don't send read receipts". Paired with an unchecked box it becomes a double negative the reader has to solve before they can answer. Label the state being turned on.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| checked | boolean | — | Controlled checked state. Pair with onCheckedChange. Omit for uncontrolled. |
| defaultChecked | boolean | false | Initial checked state for an uncontrolled checkbox. |
| onCheckedChange | (checked: boolean, eventDetails) => void | — | Fires when the checkbox is ticked or unticked. Note: Base UI passes a second eventDetails arg — not the common (checked) => void, so a single-arg handler must widen its signature. |
| indeterminate | boolean | false | Mixed state (neither checked nor unchecked). Renders a dash instead of the check. For a "select all" box inside a CheckboxGroup, use `parent` instead and the group sets this for you. |
| parent | boolean | false | Makes this the "select all" box of a CheckboxGroup that has `allValues`. It checks or clears every child, and shows the dash when only some are checked. Only works inside a CheckboxGroup. |
| disabled | boolean | false | Ignores user interaction and dims the control. |
| name | string | — | Field name for the hidden input on form submit. |
| value | string | — | Value submitted with the form when checked. Inside a group-owned CheckboxGroup, it is the name the group's value array uses for this checkbox. |
| render | ReactElement \| (props, state) => ReactElement | — | Compose the root with another element through the Base UI render prop. |

## Tokens used

`card`, `input`, `primary`, `primary-foreground`, `ring`

## Accessibility

- Base UI renders a hidden native <input type=checkbox> for keyboard, focus, and form semantics.
- Space toggles; focus-visible draws a 2px ring in the --ring token.
- indeterminate sets aria-checked=mixed automatically; a `parent` checkbox in a CheckboxGroup gets aria-checked=mixed and aria-controls for its children from the group.
- Label it with Field orientation="horizontal": it wires the label's htmlFor to the checkbox, so the label text joins the click target, and adds the description and error plumbing.

## Related

- Components: CheckboxCard, Switch, Radio

## Examples

### Default

```tsx
import { Checkbox } from "@sableui/react"

<Checkbox defaultChecked />
```

### Controlled

```tsx
import { Checkbox } from "@sableui/react"

<Checkbox checked={value} onCheckedChange={setValue} />
```

### Indeterminate

```tsx
import { Checkbox } from "@sableui/react"

<Checkbox indeterminate />
```

### Select all in a group

```tsx
import { Checkbox, CheckboxGroup, Field } from "@sableui/react"

<CheckboxGroup allValues={["email", "sms"]} defaultValue={["email"]} className="gap-3"><Field label="All channels" orientation="horizontal"><Checkbox parent /></Field><Field label="Email" orientation="horizontal" className="ps-7"><Checkbox value="email" /></Field><Field label="SMS" orientation="horizontal" className="ps-7"><Checkbox value="sms" /></Field></CheckboxGroup>
```

### With label

```tsx
import { Checkbox, Field } from "@sableui/react"

<Field label="Remember me" orientation="horizontal"><Checkbox /></Field>
```
