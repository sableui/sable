import type { ComponentMeta } from "../../lib/meta"

export const pillMeta: ComponentMeta = {
	name: "Pill",
	summary:
		"A chip someone clicks: a filter, a tag choice, an option in a row. Always a button with aria-pressed. appearance=\"solid\" (filters; selected lifts onto the primary surface) or \"outline\" (quiet chips that annotate content, like reactions); size md or sm. A static label is a Badge.",
	status: "stable",
	keywords: [
		"pill",
		"chip",
		"filter",
		"tag",
		"toggle chip",
		"category",
	],
	usage: {
		description: "Use Pill for a row of filters or choices a person clicks to narrow or toggle what they see. For a label that only describes something, use Badge.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use short text that names the filter or choice.",
			},
			{
				guidance: "do",
				description: "Reflect the current choice with selected, so the active filter reads at a glance.",
			},
			{
				guidance: "dont",
				description: "Do not use Pill as a static label. A pressable-looking chip that does nothing is the most common cause of dead clicks in a filter row — that is a Badge.",
				instead: ["Badge"],
			},
			{
				guidance: "dont",
				description: "Do not use Pill for primary actions or important system status.",
			},
			{
				guidance: "dont",
				description: "Do not restyle a Pill with border or background classes to get a quieter chip. That is appearance=\"outline\" (and size=\"sm\" for a small one); an override is a look that exists nowhere else in the system.",
			},
		],
	},
	related: {
		components: [
			"Badge",
			"ToggleGroup",
		],
	},
	props: [
		{
			name: "selected",
			type: "boolean",
			default: "false",
			description:
				"Marks the pill as chosen. Solid lifts onto the primary surface; outline takes a primary tint and soft primary edge. Sets aria-pressed.",
		},
		{
			name: "appearance",
			type: '"solid" | "outline"',
			default: '"solid"',
			description:
				"solid for a filter row; outline for quiet chips that annotate other content (a reaction under a message, a tag on a card), where a filled chip would compete with what it annotates.",
		},
		{
			name: "size",
			type: '"md" | "sm"',
			default: '"md"',
			description: "md sits on the density ladder's xs control height (28px); sm is 24px, for chips under or inside other content.",
		},
		{
			name: "tone",
			type: '"neutral" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description:
				"neutral is the chip as described. A palette family colours it as a category, like the choices in a tag picker: a wash at rest, the solid family colour when selected. Painted from the theme's generated palette.",
		},
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Optional leading glyph (e.g. <Icon name=\"lock\" />), rendered before the children with the base gap.",
		},
	],
	variants: {
		appearance: ["solid", "outline"],
		size: ["md", "sm"],
		selected: ["true", "false"],
		tone: ["neutral", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"],
	},
	tokensUsed: [
		"palette-wash",
		"palette-wash-strong",
		"palette-edge",
		"palette-solid",
		"palette-text",
		"palette-solid-ink",
		"secondary",
		"secondary-foreground",
		"accent",
		"accent-foreground",
		"primary",
		"primary-foreground",
		"card",
		"border",
		"muted-foreground",
		"foreground",
	],
	a11y: [
		"Renders a native <button type=\"button\"> for focus and keyboard activation.",
		"Selected state is exposed via aria-pressed.",
	],
	examples: [
		{
			label: "Tag picker",
			code: '<Row gap={1}><Pill tone="blue" selected onClick={() => {}}>Design</Pill><Pill tone="teal" onClick={() => {}}>Research</Pill><Pill tone="orange" onClick={() => {}}>Marketing</Pill></Row>',
		},
		{
			label: "Filter row",
			code: '<Row gap={1}><Pill selected onClick={() => {}}>All</Pill><Pill onClick={() => {}}>Projects</Pill><Pill onClick={() => {}}>Reports</Pill></Row>',
		},
		{
			label: "Outline, small (reactions)",
			code: '<Row gap={1}><Pill appearance="outline" size="sm" selected onClick={() => {}}>🎉 3</Pill><Pill appearance="outline" size="sm" onClick={() => {}}>👀</Pill></Row>',
		},
		{
			label: "With icon",
			code: '<Pill icon={<Icon name="lock" />} onClick={() => {}}>Locked</Pill>',
		},
	],
}
