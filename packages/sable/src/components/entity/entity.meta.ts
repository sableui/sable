import type { ComponentMeta } from "../../lib/meta"

export const entityMeta: ComponentMeta = {
	name: "Entity",
	summary:
		"A list-row record: leading visual + title/subtitle column + trailing action, with truncating text. Presentational by default (no hover); `interactive` rows gain the hover highlight, focus ring, and keyboard activation, and `selected` marks the current one. Compact/comfortable density.",
	status: "stable",
	keywords: [
		"entity",
		"identity",
		"object",
		"avatar row",
	],
	usage: {
		description: "Use Entity to show a compact identity block for a person, organization, file, project, or other object.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use a clear title and one or two useful metadata lines.",
			},
			{
				guidance: "do",
				description: "Pair with Avatar or Badge (dot for a status) when identity needs state or type.",
			},
			{
				guidance: "do",
				description: "For a list, stack Entity rows directly in a column; each row owns its padding. For a list in a card, put the rows in CardList, which insets them to the card's own padding and divides them, so the rows line up with the card's header instead of being tuned by hand with px-* classes.",
			},
			{
				guidance: "dont",
				description: "Do not use Entity for long descriptions, editable fields, or full card content.",
			},
			{
				guidance: "dont",
				description: "Do not make the whole row a link when it also carries a trailing action. Nesting an interactive element inside a link is invalid, and the action becomes unreachable by keyboard.",
			},
		],
	},
	related: {
		components: ["Avatar", "Badge"],
	},
	props: [
		{
			name: "leading",
			type: "ReactNode",
			description: "Leading visual — typically an Avatar or an Icon.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "Primary line (text-title-sm, truncated). Required.",
		},
		{
			name: "subtitle",
			type: "ReactNode",
			description: "Secondary line (text-body-sm muted, truncated).",
		},
		{
			name: "action",
			type: "ReactNode",
			description: "Trailing slot — typically a ghost icon Button or a StatusDot.",
		},
		{
			name: "interactive",
			type: "boolean",
			default: "false",
			description:
				"Make the whole row a target: the leading visual and text become a native <button> whose hit area stretches over the row (focus ring, Enter/Space). The action stays outside it. Requires onSelect.",
		},
		{
			name: "onSelect",
			type: "() => void",
			description:
				"Activation handler for an interactive row (fired on click and Enter/Space). Required when interactive.",
		},
		{
			name: "selected",
			type: "boolean",
			default: "false",
			description:
				"Interactive rows only: the current row of a selectable list (the record open in a list–detail view). Sets aria-current=\"true\" on the row's button and paints the selected fill, a step off the surface the row sits on, which holds on hover.",
		},
		{
			name: "density",
			type: '"compact" | "comfortable"',
			default: '"compact"',
			description:
				"Row padding: compact (12px × 10px, the default) or comfortable (16px × 12px), on the spacing scale. The insets read --entity-px / --entity-py first, which CardList sets from the card's own padding so rows in a card line up with its header.",
		},
	],
	variants: {
		density: ["compact", "comfortable"],
	},
	tokensUsed: ["accent", "accent-foreground", "foreground", "muted-foreground", "ring"],
	a11y: [
		"Default rows are presentational layout; semantics come from the content you place in title/subtitle/action.",
		"interactive rows render a real <button> around the leading visual and text, with its ::after stretched over the whole row — native focus, a focus-visible ring, and Enter/Space. The action slot sits outside that button and above the overlay, so a Button there stays valid HTML and keeps its own clicks.",
		"Give any interactive action an accessible label (e.g. aria-label on a ghost icon Button).",
		"A selected row announces aria-current=\"true\" on its button, so the current record is spoken, not only shown by its fill.",
	],
	examples: [
		{
			label: "Person row",
			code: '<Entity leading={<Avatar fallback="AM" />} title="Alex Morgan" subtitle="@alex" action={<Button variant="ghost" size="icon" aria-label="More"><Icon name="ellipsis" /></Button>} />',
		},
		{
			label: "Interactive (selectable) row",
			code: '<Entity interactive onSelect={() => selectUser(user)} leading={<Avatar fallback="AM" />} title="Alex Morgan" subtitle="@alex" />',
		},
	],
}
