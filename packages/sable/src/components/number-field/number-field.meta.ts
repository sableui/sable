import type { ComponentMeta } from "../../lib/meta"

export const numberFieldMeta: ComponentMeta = {
	name: "NumberField",
	summary:
		"Numeric input with decrement/increment steppers over Base UI NumberField — keyboard arrows, scroll, scrub-to-change, min/max clamping, locale formatting, and form integration. Styled like Input; drops straight into a Field.",
	status: "stable",
	keywords: [
		"number field",
		"numeric input",
		"stepper",
		"form",
	],
	usage: {
		description: "Use NumberField for numeric values that benefit from validation, min/max bounds, or step controls.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for quantities, thresholds, percentages, and other real numeric values.",
			},
			{
				guidance: "do",
				description: "Set sensible min, max, and step behavior when the domain has bounds.",
			},
			{
				guidance: "dont",
				description: "Do not use NumberField for identifiers such as phone numbers, ZIP codes, or credit card numbers.",
			},
			{
				guidance: "dont",
				description: "Do not use it in a property grid with steppers left on. Its two 32px stepper buttons (36px each with their inset) put a ~110px floor on a control that needs ~44px there — pass steppers={false}, or use ScrubField.",
			},
		],
	},
	related: {
		components: [
			"Input",
			"Slider",
		],
	},
	props: [
		{
			name: "min",
			type: "number",
			description:
				"Lower bound. Clamps typing, arrows, scroll and scrub alike, so the value cannot leave the range by any route.",
		},
		{
			name: "max",
			type: "number",
			description: "Upper bound, clamped on every input route the same way as `min`.",
		},
		{
			name: "value / defaultValue",
			type: "number",
			description: "Controlled / uncontrolled numeric value.",
		},
		{
			name: "onValueChange",
			type: "(value: number | null, event) => void",
			description: "Fired when the value changes (null when cleared).",
		},
		{
			name: "step / smallStep / largeStep",
			type: "number",
			description:
				"Increment amount; smallStep applies with the meta key, largeStep with shift.",
		},
		{
			name: "format",
			type: "Intl.NumberFormatOptions",
			description: "Locale formatting (currency, percent, units, …).",
		},
		{
			name: "steppers",
			type: "boolean",
			default: "true",
			description:
				"Show the decrement / increment buttons. Turn off in a dense property grid — the two 32px stepper buttons (36px with their inset) put a ~110px floor on the control; without them the value left-aligns.",
		},
		{
			name: "disabled / readOnly / required / name / id",
			type: "—",
			description:
				"Standard form-control props. Base UI applies id + required to the input, so it labels and validates correctly.",
		},
	],
	tokensUsed: [
		"field-border",
		"field",
		"foreground",
		"muted-foreground",
		"accent",
		"accent-foreground",
		"ring",
	],
	a11y: [
		"Decrement / Increment are labelled buttons (Decrease / Increase); the input is a spinbutton with aria-valuenow/min/max from Base UI.",
		"Routes aria-describedby / aria-invalid onto the input, so a Field's helper + error are announced for it.",
	],
	examples: [
		{ label: "Bounded", code: "<NumberField defaultValue={1} min={0} max={99} />" },
		{
			label: "In a field",
			code: '<Field label="Quantity"><NumberField min={1} defaultValue={1} /></Field>',
		},
		{
			label: "Currency",
			code: '<NumberField defaultValue={9.99} format={{ style: "currency", currency: "USD" }} />',
		},
	],
}
