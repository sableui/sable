import type { ComponentMeta } from "../../lib/meta"

export const overflowMenuMeta: ComponentMeta = {
	name: "OverflowMenu",
	summary:
		"An overflow ellipsis icon button that opens a Menu. Composes our Menu + Button + Icon — pass MenuItems as children and it wires the ghost icon trigger, accessible label, and portal-rendered content. All keyboard, focus, and dismissal behavior comes through Menu.",
	status: "stable",
	keywords: [
		"dots menu",
		"more actions",
		"ellipsis",
		"kebab",
		"responsive actions",
		"responsive action menu",
		"collapse actions",
		"actions overflow on mobile",
	],
	usage: {
		description: "Use OverflowMenu for compact overflow actions when the primary action is already visible elsewhere.",
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
				guidance: "do",
				description: "For actions that fit inline on a wide screen but not a narrow one, render them twice: inline (a Row inside a wrapper shown from a container width; Row sets its own display, so the wrapper does the hiding), and as MenuItems in an OverflowMenu hidden from that width (`@container` + `@md:`). display:none takes the hidden copy out of the accessibility tree, so only one set is ever announced. Keep the primary action inline at every width.",
			},
			{
				guidance: "dont",
				description: "Do not hide the most important or most frequent action inside OverflowMenu.",
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
			description: "Semantic icon name rendered in the trigger, always at the solid weight.",
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
			code: '<OverflowMenu label="Post actions"><MenuItem>Edit</MenuItem><MenuItem>Share</MenuItem><MenuSeparator /><MenuItem variant="destructive">Delete</MenuItem></OverflowMenu>',
		},
		{
			label: "With leading icons",
			code: '<OverflowMenu><MenuItem><Icon name="check" className="text-sm" />Mark as read</MenuItem><MenuSeparator /><MenuItem variant="destructive"><Icon name="xmark" className="text-sm" />Delete</MenuItem></OverflowMenu>',
		},
		{
			label: "Responsive actions: inline when wide, in a menu when narrow",
			code: '<div className="@container/actions flex w-full justify-end">\n\t<Row gap={1} align="center">\n\t\t<div className="hidden @md/actions:block">\n\t\t\t<Row gap={1}>\n\t\t\t\t<Button variant="ghost" size="sm" iconStart={<Icon name="share" />}>Share</Button>\n\t\t\t\t<Button variant="ghost" size="sm" iconStart={<Icon name="download" />}>Export</Button>\n\t\t\t</Row>\n\t\t</div>\n\t\t<div className="@md/actions:hidden">\n\t\t\t<OverflowMenu label="Report actions" size="icon-sm">\n\t\t\t\t<MenuItem icon={<Icon name="share" />}>Share</MenuItem>\n\t\t\t\t<MenuItem icon={<Icon name="download" />}>Export</MenuItem>\n\t\t\t</OverflowMenu>\n\t\t</div>\n\t\t<Button size="sm" iconStart={<Icon name="edit" />}>Edit report</Button>\n\t</Row>\n</div>',
		},
	],
}
