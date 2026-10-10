import type { ComponentMeta } from "../../lib/meta"

export const separatorMeta: ComponentMeta = {
	name: "Separator",
	summary:
		"A hairline divider. Horizontal full-width rule or vertical 1px column, tinted with the border token. Optional centered label (horizontal) for a captioned section divider.",
	status: "stable",
	keywords: [
		"separator",
		"divider",
		"section break",
		"rule",
	],
	usage: {
		description: "Use Separator to divide related groups where spacing alone does not provide enough structure.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it sparingly between sections, menu groups, or dense rows.",
			},
			{
				guidance: "do",
				description: "Choose orientation based on the layout direction it separates.",
			},
			{
				guidance: "dont",
				description: "Do not use Separator as decoration when hierarchy, spacing, or headings would explain the layout better.",
			},
			{
				guidance: "dont",
				description: "Do not use it where space would do. A page whose every section is divided by a rule reads as a form; the rule should mark a real change of subject.",
			},
		],
	},
	related: {
		components: [
			"Menu",
			"ContextMenu",
			"Card",
		],
	},
	props: [
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description:
				"Axis of the rule. Vertical stretches to its flex parent's height.",
		},
		{
			name: "label",
			type: "ReactNode",
			description:
				"When set (horizontal only), centers a muted caption between two hairline rules.",
		},
		{
			name: "render",
			type: "ReactElement | (props, state) => ReactElement",
			description:
				"Compose with another element/component through the Base UI render prop. Ignored on the labeled variant.",
		},
	],
	variants: {
		orientation: ["horizontal", "vertical"],
	},
	tokensUsed: ["border", "muted-foreground"],
	a11y: [
		"Base UI sets role=separator and aria-orientation for assistive tech.",
		"The labeled variant renders a div with explicit role=separator + aria-orientation (the caption is the visible context).",
		"Purely decorative dividers can carry aria-hidden when adjacent content already conveys the grouping.",
	],
	examples: [
		{
			label: "Horizontal",
			code: "<Separator />",
		},
		{
			label: "Labeled section divider",
			code: '<Separator label="Other holdings" />',
		},
		{
			label: "Vertical (inside a flex row)",
			code: '<Row gap={3} className="h-6 items-center"><span>Edit</span><Separator orientation="vertical" /><span>Delete</span></Row>',
		},
	],
}
