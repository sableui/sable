# Switch

**Status:** stable

Binary on/off toggle for immediate-effect settings. Track fills with the primary tone when checked; the thumb slides on a spring-eased transform (mirrored in RTL).

**Keywords:** switch, toggle setting, on off, form control

## Usage

Use Switch for immediate on/off settings that take effect as a persistent preference or mode.

### Best practices

- Do: Use it for binary settings where the label describes the enabled state.
- Do: Make the current state obvious through both position and accessible text.
- Don't: Do not phrase the label as a negative, such as "Don't send read receipts". Turning off a negative is a double negative, and the user has to solve it before they can act.
- Don't: Do not use Switch for one-time agreement, multi-select choices, or submit-only booleans.
- Don't: Do not use a Switch whose effect is not immediately visible somewhere. A toggle flipped with no observable consequence gives no confirmation it worked, so the user flips it again to check.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| checked | boolean | — | Controlled on/off state. Pair with onCheckedChange. Omit for an uncontrolled switch. |
| defaultChecked | boolean | false | Initial state for an uncontrolled switch. |
| onCheckedChange | (checked: boolean, eventDetails) => void | — | Fired when the switch is toggled. Note: Base UI passes a second eventDetails arg — not the common (checked) => void, so a single-arg handler must widen its signature. |
| disabled | boolean | false | Dims the control and ignores user interaction. |
| readOnly | boolean | false | Prevents toggling while keeping the control fully visible. |
| required | boolean | false | Marks the switch as required when inside a form. |
| name | string | — | Identifies the field when the enclosing form is submitted. |

## Tokens used

`input`, `primary`, `primary-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — Switches arrive as part of a settings list. Animating each one in turns a form into a title sequence.
- **response** · Root · `motion-interactive` — The track is small and its hover change is subtle; without the ease the colour shift reads as a rendering glitch rather than a reaction.
- **transition** · Thumb · `motion-interactive` — The thumb sliding IS the affordance — it shows the control has two ends and which one you are now at. Teleporting the thumb makes on and off two unrelated pictures, and users re-read the label to work out which they are looking at. motion-interactive is the right recipe because it declares `translate`, so the thumb transform and the track colour ease on one timeline instead of two.
- **activity** · Root · _no motion_ — A switch commits instantly. If the write is slow enough to need a pending state, the surrounding form owns that, not the control.

## Accessibility

- Renders Base UI's Switch with a hidden native <input> — role, ARIA, and keyboard (Space/Enter) toggling come for free.
- Focus-visible draws a 2px ring in the --ring token.
- Disabled state sets cursor-not-allowed and 50% opacity; readOnly keeps full contrast but blocks changes.
- Give it an accessible name: wrap it in <Field label=… orientation="horizontal">, which wires the label for you.

## Related

- Components: Checkbox, Toggle, ThemeSwitcher

## Examples

### Default (uncontrolled)

```tsx
import { Switch } from "@sableui/react"

<Switch defaultChecked />
```

### Controlled

```tsx
import { Switch } from "@sableui/react"

<Switch checked={on} onCheckedChange={setOn} />
```

### Disabled

```tsx
import { Switch } from "@sableui/react"

<Switch disabled defaultChecked />
```

### With a label

```tsx
import { Field, Switch } from "@sableui/react"

<Field label="Reduce motion" orientation="horizontal"><Switch defaultChecked /></Field>
```
