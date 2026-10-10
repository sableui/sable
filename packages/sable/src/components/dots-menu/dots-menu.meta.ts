import type { ComponentMeta } from "../../lib/meta"

export const dotsMenuMeta: ComponentMeta = {
	name: "DotsMenu",
	summary:
		"An overflow ellipsis icon button that opens a Menu. Composes our Menu + Button + Icon — pass MenuItems as children and it wires the ghost icon trigger, accessible label, and portal-rendered content. All keyboard, focus, and dismissal behavior comes through Menu.",
	status: "stable",
	keywords: [
		"dots menu",
		"more actions",
		"overflow",
		"kebab",
	],
	usage: {
		description: "Use DotsMenu for compact overflow actions when the primary action is already visible elsewhere.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for secondary commands that belong to a row, card, or toolbar item.",
			},
			{
				guidance: "do",
				description: "Keep labels explicit so the icon-only trigger does not obscure the command meaning.",
			},
			{
				guidance: "dont",
				description: "Do not hide the most important or most frequent action inside DotsMenu.",
			},
			{
				guidance: "dont",
				description: "Do not use it as the only affordance on a touch surface. It is revealed on hover in most layouts, and hover does not exist on touch — pair it with a visible action or make it always-visible there.",
			},
		],
	},
	related: {
		components: [
			"Menu",
			"ContextMenu",
		],
	},
	props: [
		{
			name: "children",
			type: "ReactNode",
			default: "—",
			description:
				"The menu rows — MenuItem / MenuSeparator / MenuGroup, etc. Rendered inside MenuContent.",
		},
		{
			name: "align",
			type: "'start' | 'center' | 'end'",
			default: "end",
			description:
				"Alignment of the popup along its side. Overflow menus typically right-align under the trigger; 'start' anchors the popup's left edge to the trigger instead.",
		},
		{
			name: "label",
			type: "string",
			default: "More actions",
			description: "Accessible label (aria-label) for the icon-only trigger button.",
		},
		{
			name: "icon",
			type: "string",
			default: "ellipsis",
			description: "Semantic icon name rendered in the trigger.",
		},
		{
			name: "size",
			type: "'icon' | 'icon-sm' | 'icon-xs'",
			default: "icon",
			description:
				"The trigger's rung on the icon-button ladder. 'icon' for a card or page header; 'icon-sm' or 'icon-xs' in a list row or dense toolbar, so the trigger does not set the row height.",
		},
	],
	variants: {
		size: ["icon", "icon-sm", "icon-xs"],
	},
	tokensUsed: [
		"popover",
		"popover-foreground",
		"border",
		"accent",
		"accent-foreground",
		"muted-foreground",
	],
	a11y: [
		"The icon-only trigger is labeled via aria-label (label prop, default 'More actions').",
		"Menu provides role=menu/menuitem, roving tabindex, arrow-key navigation, and typeahead via Base UI.",
		"Esc and outside-press dismiss; focus returns to the trigger on close.",
	],
	examples: [
		{
			label: "Basic",
			code: '<DotsMenu label="Post actions"><MenuItem>Edit</MenuItem><MenuItem>Share</MenuItem><MenuSeparator /><MenuItem variant="destructive">Delete</MenuItem></DotsMenu>',
		},
		{
			label: "With leading icons",
			code: '<DotsMenu><MenuItem><Icon name="check" className="text-sm" />Mark as read</MenuItem><MenuSeparator /><MenuItem variant="destructive"><Icon name="xmark" className="text-sm" />Delete</MenuItem></DotsMenu>',
		},
	],
}
