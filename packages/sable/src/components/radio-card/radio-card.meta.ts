import type { ComponentMeta } from "../../lib/meta"

export const radioCardMeta: ComponentMeta = {
	name: "RadioCard",
	summary:
		"A selectable card option (radio-card) over Base UI RadioGroup + Radio. RadioGroup shares selection state; each RadioCard is a card with a radio indicator, title, and description. Add an icon to switch to the richer two-dimensional card, and a tone to give the selected state a semantic colour identity.",
	status: "stable",
	keywords: [
		"radio-card",
		"choice card",
		"selection",
		"option card",
	],
	usage: {
		description: "Use RadioCard for visual choice cards when users compare a small set of named options.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it when labels, descriptions, or icons make options easier to understand.",
			},
			{
				guidance: "do",
				description: "Make the selected state explicit and preserve keyboard access through the group.",
			},
			{
				guidance: "dont",
				description: "Do not use RadioCard for dense menus, long lists, or simple yes/no settings.",
			},
			{
				guidance: "dont",
				description: "Do not use a single RadioCard on its own. It is a radio, so one option cannot be deselected — a lone one is a switch, and should be a Switch.",
			},
		],
		anatomy: [
			{
				name: "RadioCard",
				required: true,
				description: "One selectable option card.",
			},
			{
				name: "RadioGroup",
				required: false,
				description: "A grouped set of related choice cards.",
			},
		],
	},
	related: {
		components: [
			"Radio",
			"CheckboxCard",
			"Select",
		],
	},
	props: [
		{
			name: "value",
			type: "string",
			description:
				"The unique value that pairs this card with the group's selected value.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "The card's primary label (rendered as text-title-sm).",
		},
		{
			name: "description",
			type: "ReactNode",
			description:
				"Optional supporting copy beneath the title (text-body-sm, muted).",
		},
		{
			name: "trailing",
			type: "ReactNode",
			description:
				"End-aligned on the title's line: a price, a delivery date, a count. The title takes the rest of the row.",
		},
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Leading icon (e.g. a solid <Icon>). Its presence switches to the two-dimensional card — icon top-left, indicator top-right, copy below — and the glyph is rendered as a solid-fill icon in the tone colour.",
		},
		{
			name: "tone",
			type: '"neutral" | "standard" | "collectible" | "edition" | "info" | "warning"',
			default: '"neutral"',
			description:
				"Semantic colour the selected state carries across the border, radio, and icon glyph. Neutral uses the primary ring with a muted wash.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description:
				"Dims the card and blocks selection. The group skips it during keyboard navigation.",
		},
		{
			name: "titleClassName",
			type: "string",
			description:
				"Merged onto the title span (default text-title-sm) — e.g. to tighten copy in a two-column layout.",
		},
		{
			name: "descriptionClassName",
			type: "string",
			description:
				"Merged onto the description span (default text-body-sm text-muted-foreground).",
		},
	],
	subcomponents: [
		{
			name: "RadioGroup",
			type: "Base UI RadioGroup props (value, defaultValue, onValueChange, name, disabled, readOnly, required) + className",
			description:
				"The group container that wraps the RadioCard cards and shares their selection state. Controlled via value + onValueChange; uncontrolled via defaultValue. Lays its cards out in a single column by default; override with className (e.g. 'grid sm:grid-cols-3') for a grid — the group is a flex column, so a grid-cols-* class alone does nothing.",
		},
	],
	variants: {
		tone: ["neutral", "standard", "collectible", "edition", "info", "warning"],
	},
	tokensUsed: [
		"input",
		"card",
		"foreground",
		"primary",
		"muted",
		"ring",
		"muted-foreground",
		"tone-standard",
		"tone-collectible",
		"tone-edition",
		"tone-info",
		"tone-warning",
	],
	a11y: [
		"Base UI provides the radiogroup/radio roles, aria-checked, hidden native inputs, and roving tabindex.",
		"Arrow keys move and select between cards; Space selects the focused card; Tab enters/leaves the group.",
		"Checked state styling reads from the data-[checked] attribute; disabled cards from data-disabled.",
		"focus-within draws a 2px ring on the focused card; the whole card is the hit target.",
		"The icon is decorative — the title labels the card — so selection meaning never relies on colour alone (the border ring and the filled radio both shift; the neutral tone adds a muted fill).",
	],
	examples: [
		{
			label: "Post type (tone + icon)",
			code: '<RadioGroup defaultValue="post" className="grid sm:grid-cols-3"><RadioCard value="post" tone="standard" icon={<Icon name="plus" />} title="Standard" description="Share without minting" /><RadioCard value="collectible" tone="collectible" icon={<Icon name="gem" />} title="Collectible" description="Free to collect as NFT" /><RadioCard value="edition" tone="edition" icon={<Icon name="image-stack" />} title="Edition" description="Sell as NFT editions" /></RadioGroup>',
		},
		{
			label: "Plan picker (plain)",
			code: '<RadioGroup defaultValue="pro"><RadioCard value="free" title="Free" description="For trying things out." /><RadioCard value="pro" title="Pro" description="For growing teams." /><RadioCard value="enterprise" title="Enterprise" description="Custom limits and support." /></RadioGroup>',
		},
		{
			label: "With a disabled option",
			code: '<RadioGroup defaultValue="free"><RadioCard value="free" title="Free" description="For trying things out." /><RadioCard value="enterprise" title="Enterprise" description="Contact sales to enable." disabled /></RadioGroup>',
		},
	],
}
