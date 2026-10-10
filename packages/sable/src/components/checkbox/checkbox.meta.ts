import type { ComponentMeta } from "../../lib/meta"

export const checkboxMeta: ComponentMeta = {
	name: "Checkbox",
	summary:
		"Square toggle (18px at rest, on the spacing scale) over Base UI's Checkbox. Checked/indeterminate/disabled states; controlled or uncontrolled; form-ready via the hidden native input.",
	status: "stable",
	keywords: [
		"checkbox",
		"boolean",
		"multi select",
		"form control",
	],
	usage: {
		description: "Use Checkbox for independent boolean choices or for selecting multiple options in a set.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use Checkbox when each option can be toggled independently.",
			},
			{
				guidance: "do",
				description: "Attach a visible label that explains the consequence of checking the control.",
			},
			{
				guidance: "dont",
				description: "Do not use Checkbox for mutually exclusive choices; use Radio or Select instead.",
			},
			{
				guidance: "dont",
				description: "Do not use it without a label or an aria-label. An 18px square with no accessible name is announced as just \"checkbox\", which tells a screen-reader user nothing about what they are agreeing to.",
			},
			{
				guidance: "dont",
				description: "Do not phrase the label as a negative, such as \"Don't send read receipts\". Paired with an unchecked box it becomes a double negative the reader has to solve before they can answer. Label the state being turned on.",
			},
		],
	},
	related: {
		components: [
			"CheckboxCard",
			"Switch",
			"Radio",
		],
	},
	props: [
		{
			name: "checked",
			type: "boolean",
			description:
				"Controlled checked state. Pair with onCheckedChange. Omit for uncontrolled.",
		},
		{
			name: "defaultChecked",
			type: "boolean",
			default: "false",
			description: "Initial checked state for an uncontrolled checkbox.",
		},
		{
			name: "onCheckedChange",
			type: "(checked: boolean, eventDetails) => void",
			description:
				"Fires when the checkbox is ticked or unticked. Note: Base UI passes a second eventDetails arg — not the common (checked) => void, so a single-arg handler must widen its signature.",
		},
		{
			name: "indeterminate",
			type: "boolean",
			default: "false",
			description:
				"Mixed state (neither checked nor unchecked). Renders a dash instead of the check. For a \"select all\" box inside a CheckboxGroup, use `parent` instead and the group sets this for you.",
		},
		{
			name: "parent",
			type: "boolean",
			default: "false",
			description:
				"Makes this the \"select all\" box of a CheckboxGroup that has `allValues`. It checks or clears every child, and shows the dash when only some are checked. Only works inside a CheckboxGroup.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Ignores user interaction and dims the control.",
		},
		{
			name: "name",
			type: "string",
			description: "Field name for the hidden input on form submit.",
		},
		{
			name: "value",
			type: "string",
			description: "Value submitted with the form when checked. Inside a group-owned CheckboxGroup, it is the name the group's value array uses for this checkbox.",
		},
		{
			name: "render",
			type: "ReactElement | (props, state) => ReactElement",
			description:
				"Compose the root with another element through the Base UI render prop.",
		},
	],
	tokensUsed: [
		"card",
		"input",
		"primary",
		"primary-foreground",
		"ring",
	],
	a11y: [
		"Base UI renders a hidden native <input type=checkbox> for keyboard, focus, and form semantics.",
		"Space toggles; focus-visible draws a 2px ring in the --ring token.",
		"indeterminate sets aria-checked=mixed automatically; a `parent` checkbox in a CheckboxGroup gets aria-checked=mixed and aria-controls for its children from the group.",
		"Label it with Field orientation=\"horizontal\": it wires the label's htmlFor to the checkbox, so the label text joins the click target, and adds the description and error plumbing.",
	],
	examples: [
		{ label: "Default", code: "<Checkbox defaultChecked />" },
		{
			label: "Controlled",
			code: "<Checkbox checked={value} onCheckedChange={setValue} />",
		},
		{ label: "Indeterminate", code: "<Checkbox indeterminate />" },
		{
			label: "Select all in a group",
			code: '<CheckboxGroup allValues={["email", "sms"]} defaultValue={["email"]} className="gap-3"><Field label="All channels" orientation="horizontal"><Checkbox parent /></Field><Field label="Email" orientation="horizontal" className="ps-7"><Checkbox value="email" /></Field><Field label="SMS" orientation="horizontal" className="ps-7"><Checkbox value="sms" /></Field></CheckboxGroup>',
		},
		{
			label: "With label",
			code: '<Field label="Remember me" orientation="horizontal"><Checkbox /></Field>',
		},
	],
}
