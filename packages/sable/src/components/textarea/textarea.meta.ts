import type { ComponentMeta } from "../../lib/meta"

export const textareaMeta: ComponentMeta = {
	name: "Textarea",
	summary:
		"Styled native multi-line text control. Soft-square, card surface, --ring focus, and an aria-invalid destructive error state.",
	status: "stable",
	keywords: [
		"textarea",
		"multi line input",
		"form",
		"text",
	],
	usage: {
		description: "Use Textarea for multi-line freeform text entry such as notes, descriptions, or messages.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use labels, helper text, and character limits when expectations are specific.",
			},
			{
				guidance: "do",
				description: "Size it to the expected amount of input without making the page feel blocked.",
			},
			{
				guidance: "do",
				description:
					"Keep a focusable field at 16px or larger on mobile. iOS Safari zooms the whole page when a focused textarea computes under 16px and never zooms back out. Textarea handles this itself — below the sm breakpoint it renders text-body-lg (17px) and returns to text-body-md at sm and up. Build a custom field the same way: a second paired tier under a max-sm: variant, never a hand-set font-size.",
			},
			{
				guidance: "dont",
				description:
					"Do not override the type with a page tier below 16px (text-body-md, text-body-sm) without a >=16px mobile arm — that reintroduces the iOS focus zoom.",
			},
			{
				guidance: "dont",
				description: "Do not use Textarea for short single-line values; use Input.",
			},
			{
				guidance: "dont",
				description: "Do not leave it at the default height for long-form input. A two-row textarea for a paragraph forces the user to write through a letterbox.",
			},
		],
	},
	related: {
		components: [
			"Input",
			"Form",
			"Label",
		],
	},
	props: [
		{
			name: "aria-invalid",
			type: "boolean",
			description:
				"When true, swaps the input border to the destructive token to signal a validation error.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the control to 50% and blocks pointer interaction.",
		},
		{
			name: "rows",
			type: "number",
			description: "Native textarea row count. The floor is min-h-20 on the spacing scale, so it moves with density.",
		},
		{
			name: "autoResize",
			type: "boolean",
			default: "false",
			description:
				"Grows to fit content via CSS field-sizing: content (no JS). The min-height stays the floor; browsers without field-sizing fall back to the fixed min-height.",
		},
		{
			name: "...props",
			type: 'ComponentPropsWithRef<"textarea">',
			description:
				"All native textarea attributes (value, placeholder, onChange, name, ref, …).",
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
		"Renders a native <textarea> — label association, keyboard, and screen-reader semantics come for free.",
		"Renders through Base UI's Field.Control: inside a Field it picks up the label, description, error and validity wiring from context.",
		"Pair with a <label htmlFor> (or aria-label) for an accessible name.",
		"Set aria-invalid and reference an error message via aria-describedby to announce validation failures.",
		"Focus-visible draws a 2px ring in the --ring token.",
	],
	examples: [
		{
			label: "Default",
			code: '<Textarea placeholder="Write a caption…" />',
		},
		{
			label: "With rows",
			code: '<Textarea rows={6} placeholder="Tell the story behind this edition…" />',
		},
		{
			label: "Auto-resize",
			code: '<Textarea autoResize placeholder="Grows as you type…" />',
		},
		{
			label: "Invalid",
			code: '<Textarea aria-invalid defaultValue="Too long" />',
		},
		{
			label: "Disabled",
			code: '<Textarea disabled defaultValue="Captions lock once the edition is minted." />',
		},
	],
}
