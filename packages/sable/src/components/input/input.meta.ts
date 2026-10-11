import type { ComponentMeta } from "../../lib/meta"

export const inputMeta: ComponentMeta = {
	name: "Input",
	summary:
		"Styled native text input. Soft-square (rounded-sm), card surface, 2px focus ring; aria-invalid raises the destructive error treatment.",
	keywords: [
		"input",
		"text input",
		"field",
		"form",
		"email",
		"search",
		"file",
		"invalid",
		"validation",
	],
	usage: {
		description:
			"Use Input for short freeform text, search, email, password, file, and native input types. In forms, wrap Input in Field so label, description, required state, and validation messaging stay accessible and consistent.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pair every Input with a visible label through Field or an explicit label/htmlFor connection.",
			},
			{
				guidance: "do",
				description:
					"Use type, inputMode, autoComplete, and placeholder as progressive hints, not as the only label.",
			},
			{
				guidance: "do",
				description:
					"Set aria-invalid or use Field error copy when validation fails.",
			},
			{
				guidance: "do",
				description:
					"Keep a focusable field at 16px or larger on mobile. iOS Safari zooms the whole page when a focused input computes under 16px and never zooms back out. Input handles this itself — below the sm breakpoint it renders text-body-lg (17px) and returns to text-body-md at sm and up. Build a custom field the same way: a second paired tier under a max-sm: variant, never a hand-set font-size.",
			},
			{
				guidance: "dont",
				description:
					"Override an Input's type with a page tier below 16px (text-body-md, text-body-sm, text-label-*) without a >=16px mobile arm — that reintroduces the iOS focus zoom.",
			},
			{
				guidance: "dont",
				description:
					"Use placeholder text as the label; it disappears once the user types and is not enough context.",
			},
			{
				guidance: "dont",
				description:
					"Use Input for long body copy. Use Textarea for multi-line content.",
			},
		],
		anatomy: [
			{
				name: "Input",
				required: true,
				description:
					"The native input element with Sable surface, disabled, focus, and invalid styling.",
			},
			{
				name: "Label",
				required: true,
				description:
					"Usually provided by Field or a separate Label. It gives the input its visible purpose.",
			},
			{
				name: "Description",
				required: false,
				description:
					"Optional helper copy connected through aria-describedby when using Field.",
			},
			{
				name: "Error",
				required: false,
				description:
					"Validation message paired with aria-invalid and destructive styling.",
			},
		],
	},
	related: {
		components: ["Field", "Form", "Textarea", "SearchInput", "NumberField"],
		patterns: ["SettingsPage", "AuthPage"],
	},
	status: "stable",
	props: [
		{
			name: "size",
			type: '"md" | "xs"',
			default: '"md"',
			description: "md is the form field. xs is the dense inset field of a tool panel (an inset panel-field fill, no outline, tight padding) — the same ladder as Select and Combobox. Use it instead of overriding the height with className.",
		},
		{
			name: "type",
			type: "string",
			default: '"text"',
			description:
				'Native input type (text, email, password, search, number, file, …). type="file" themes the native selector button via file: token utilities.',
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control and blocks pointer interaction.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description:
				"Surfaces the destructive border + ring. Base UI form fields set this automatically.",
		},
		{
			name: "...props",
			type: 'ComponentPropsWithRef<"input">',
			description:
				"All native input attributes (placeholder, value, onChange, ref, …) pass through.",
		},
	],
	tokensUsed: [
		"input",
		"card",
		"foreground",
		"muted-foreground",
		"ring",
		"destructive",
	],
	a11y: [
		"Renders a native <input> — labels, keyboard, and form semantics come for free.",
		"Renders through Base UI's Input (Field.Control): inside a Field it picks up the label, description, error and validity wiring from context, even when nested in a wrapper.",
		"Always associate a <label htmlFor> (or wrap) — placeholder text is not a label.",
		"Focus-visible ring uses the --ring token at 40% opacity.",
		"Set aria-invalid='true' on error so the destructive treatment is conveyed, not color-only.",
	],
	variants: {
		size: ["md", "xs"],
	},
	examples: [
		{ label: "Default", code: '<Input placeholder="Search posts" />' },
		{
			label: "With a label",
			code: '<Field label="Email"><Input type="email" placeholder="you@example.com" /></Field>',
		},
		{
			label: "Field with helper text",
			code: '<Field label="Display name" description="Shown on your public profile."><Input placeholder="Nova Reed" /></Field>',
		},
		{
			label: "Field error",
			code: '<Field label="Email" error="Enter a valid email address."><Input type="email" defaultValue="not-an-email" /></Field>',
		},
		{
			label: "Search input",
			code: '<Field label="Search posts"><Input type="search" placeholder="Search by title, creator, or tag" /></Field>',
		},
		{
			label: "Invalid",
			code: '<Input aria-invalid defaultValue="not-an-email" />',
		},
		{
			label: "File",
			code: '<Input type="file" accept="image/*" />',
		},
		{ label: "Disabled", code: '<Input disabled placeholder="Disabled" />' },
	],
}
