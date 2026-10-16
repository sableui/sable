# Radio

**Status:** stable

Single-select control over Base UI RadioGroup + Radio (roving focus, arrow-key nav, ARIA radiogroup wiring, form integration). RadioGroup + Radio.

**Keywords:** radio, radio group, single choice, form control

## Usage

Use Radio when a user must choose exactly one option from a visible set.

### Best practices

- Do: Use it when all options should be visible for comparison.
- Do: Keep option labels mutually exclusive and easy to understand.
- Don't: Do not use Radio for independent toggles or multiple selection; use Checkbox or Switch. → use **Checkbox**, **Switch**
- Don't: Do not use a radio group with only one option, and do not omit the Fieldset. Without the fieldset the options share no accessible name, so a screen reader reads the choices with no question attached.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| RadioGroup | yes | The grouped set that manages one selected value. |
| Radio | yes | One selectable option in the group. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| RadioGroup | Base UI RadioGroup props (value, defaultValue, onValueChange, name, disabled, readOnly, required) + className | The group container that wraps Radio items and shares selection state across them. Controlled via value + onValueChange; uncontrolled via defaultValue. Lays its Radio items out in a vertical stack. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Radio | Base UI Radio.Root props (value, disabled, readOnly, required) + className | — | A single radio button. value pairs it with the group's selected value. Renders a native button with radio semantics, the ring and an inner Indicator dot. A custom non-button render must also set nativeButton={false}. |

## Tokens used

`input`, `card`, `primary`, `ring`

## Accessibility

- Base UI provides the radiogroup/radio roles, aria-checked, hidden native inputs, and roving tabindex.
- Arrow keys move and select between items; Space selects the focused item; Tab enters/leaves the group.
- Checked state styling reads from the data-[checked] attribute; disabled items from the disabled state.
- Focus-visible draws a 2px ring on the focused item. Wrap each Radio in <Field label orientation="horizontal"> so the label names it, is part of the hit target, sits on the first line, and dims with it when disabled — do not hand-build a <label> row.

## Related

- Components: Checkbox, RadioCard, Field, Fieldset, Select

## Examples

### Basic

```tsx
import { Field, Fieldset, FieldsetContent, FieldsetLegend, Radio, RadioGroup } from "@sableui/react"

<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Poll" orientation="horizontal"><Radio value="poll" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>
```

### With a disabled option

```tsx
import { Field, Fieldset, FieldsetContent, FieldsetLegend, Radio, RadioGroup } from "@sableui/react"

<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Poll" orientation="horizontal" disabled><Radio value="poll" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>
```
