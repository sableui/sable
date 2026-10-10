import type { ComponentMeta } from "../../lib/meta"

export const labelMeta: ComponentMeta = {
	name: "Label",
	summary:
		"Styled native <label>. Paired label typography via a size step (xs / sm / md / lg, all sentence case) or an uppercase eyebrow (eyebrow), non-selectable, dims when its peer control is disabled. Optional hint adds a dotted-underline tooltip affordance.",
	status: "stable",
	keywords: [
		"label",
		"form label",
		"control",
		"accessibility",
	],
	usage: {
		description: "Use Label to name a form control and create a clear accessible relationship with that control.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use explicit, persistent labels for inputs, selects, textareas, and grouped controls.",
			},
			{
				guidance: "do",
				description: "Place helper text separately so the label stays short and direct.",
			},
			{
				guidance: "dont",
				description: "Do not rely on placeholder text as the only label for a control.",
			},
			{
				guidance: "dont",
				description: "Do not use it as a bare styled span. A Label without htmlFor or a wrapped control looks like a label and does nothing — clicking it will not focus the field, which is the entire point.",
			},
		],
	},
	related: {
		components: [
			"Input",
			"Textarea",
			"Fieldset",
			"Form",
			"Field",
		],
	},
	props: [
		{
			name: "htmlFor",
			type: "string",
			description:
				"Associates the label with a control by its id (native <label for>).",
		},
		{
			name: "size",
			type: '"xs" | "sm" | "md" | "lg"',
			default: '"lg"',
			description:
				"Paired label typography step, all sentence case. xs is simply the smallest; for an uppercase eyebrow use eyebrow.",
		},
		{
			name: "eyebrow",
			type: "boolean",
			default: "false",
			description:
				"Set the label as an eyebrow: the uppercase, letter-spaced text-overline tier (themeable to sentence case). Replaces size. For a kicker above a group, not an ordinary field label.",
		},
		{
			name: "hint",
			type: "ReactNode",
			description:
				"When set, the label gets a dotted-underline affordance and reveals this content in a tooltip on hover/focus.",
		},
		{
			name: "className",
			type: "string",
			description: "Merge or override classes via cn().",
		},
	],
	variants: {
		size: ["xs", "sm", "md", "lg"],
	},
	tokensUsed: ["foreground", "muted-foreground"],
	a11y: [
		"Renders a native <label> — clicking it focuses/activates the associated control.",
		"Associate with a control via htmlFor (matching the control's id) or by wrapping the control.",
		"In a form, use Field: it renders this Label, wires htmlFor/id, and dims the label when the field is disabled. Hand-wired outside a Field, the label only dims via peer-disabled when the control carries `peer` AND precedes the Label in the DOM (Tailwind peer-* only matches a later sibling).",
		"With `hint`, the label becomes focusable and the help text is announced via the tooltip's aria-describedby — so the affordance works for keyboard and screen-reader users, not just hover.",
	],
	examples: [
		{
			label: "With control",
			code: '<Stack gap={1}><Label htmlFor="name">Display name</Label><Input id="name" /></Stack>',
		},
		{
			label: "In a form",
			code: '<Field label="Display name" disabled><Input /></Field>',
		},
		{
			label: "With hint",
			code: '<Label htmlFor="royalty" hint="A percentage of every resale, paid to you.">Royalty</Label>',
		},
	],
}
