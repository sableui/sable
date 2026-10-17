import type { ComponentMeta } from "../../lib/meta"

export const radioMeta: ComponentMeta = {
	name: "Radio",
	summary:
		"Single-select control over Base UI RadioGroup + Radio (roving focus, arrow-key nav, ARIA radiogroup wiring, form integration). RadioGroup + Radio.",
	status: "stable",
	keywords: [
		"radio",
		"radio group",
		"single choice",
		"form control",
	],
	usage: {
		description: "Use Radio when a user must choose exactly one option from a visible set.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it when all options should be visible for comparison.",
			},
			{
				guidance: "do",
				description: "Keep option labels mutually exclusive and easy to understand.",
			},
			{
				guidance: "dont",
				description: "Do not use Radio for independent toggles or multiple selection; use Checkbox or Switch.",
				instead: ["Checkbox", "Switch"],
			},
			{
				guidance: "dont",
				description: "Do not use a radio group with only one option, and do not omit the Fieldset. Without the fieldset the options share no accessible name, so a screen reader reads the choices with no question attached.",
			},
		],
		anatomy: [
			{
				name: "RadioGroup",
				required: true,
				description: "The grouped set that manages one selected value.",
			},
			{
				name: "Radio",
				required: true,
				description: "One selectable option in the group.",
			},
		],
	},
	related: {
		components: [
			"Checkbox",
			"RadioCard",
			"Field",
			"Fieldset",
			"Select",
		],
	},
	props: [
		{
			name: "Radio",
			type: "Base UI Radio.Root props (value, disabled, readOnly, required) + className",
			description:
				"A single radio button. value pairs it with the group's selected value. Renders a native button with radio semantics, the ring and an inner Indicator dot. A custom non-button render must also set nativeButton={false}.",
		},
	],
	subcomponents: [
		{
			name: "RadioGroup",
			type: "Base UI RadioGroup props (value, defaultValue, onValueChange, name, disabled, readOnly, required) + className",
			description:
				"The group container that wraps Radio items and shares selection state across them. Controlled via value + onValueChange; uncontrolled via defaultValue. Lays its Radio items out in a vertical stack.",
		},
	],
	tokensUsed: ["input", "card", "primary", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "Radios arrive with the form they belong to. Animating each one in turns a question into a title sequence.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "The ring's edge and focus ring ease, so arrowing through a group — which moves the selection with focus — reads as one choice moving down the list.",
		},
		{
			slot: "transition",
			recipe: "motion-interactive",
			part: "Indicator",
			why: "The dot grows from the centre on a spring and shrinks out of the radio being left. A group's selection moves from one option to another, and the paired grow and shrink is what makes it read as moving rather than two dots blinking.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A radio commits instantly. A slow write belongs to the surrounding form's pending state, not the control.",
		},
	],
	a11y: [
		"Base UI provides the radiogroup/radio roles, aria-checked, hidden native inputs, and roving tabindex.",
		"Arrow keys move and select between items; Space selects the focused item; Tab enters/leaves the group.",
		"Checked state styling reads from the data-[checked] attribute; disabled items from the disabled state.",
		"Focus-visible draws a 2px ring on the focused item. Wrap each Radio in <Field label orientation=\"horizontal\"> so the label names it, is part of the hit target, sits on the first line, and dims with it when disabled — do not hand-build a <label> row.",
	],
	examples: [
		{
			label: "Basic",
			code: `<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Poll" orientation="horizontal"><Radio value="poll" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>`,
		},
		{
			label: "With a disabled option",
			code: `<Fieldset>
	<FieldsetLegend>Post type</FieldsetLegend>
	<FieldsetContent>
		<RadioGroup defaultValue="standard">
			<Field label="Standard" orientation="horizontal"><Radio value="standard" /></Field>
			<Field label="Poll" orientation="horizontal" disabled><Radio value="poll" /></Field>
		</RadioGroup>
	</FieldsetContent>
</Fieldset>`,
		},
	],
}
