import type { ComponentMeta } from "../../lib/meta"

export const contextMenuMeta: ComponentMeta = {
	name: "ContextMenu",
	summary:
		"Right-click menu over Base UI ContextMenu — opens on the native contextmenu event or long press and positions at the pointer. Shares Menu's roving focus, typeahead, ARIA menu/menuitem wiring, collision-aware positioning, and Esc/outside dismissal.",
	status: "stable",
	keywords: [
		"context menu",
		"right click",
		"overflow",
		"menu",
	],
	usage: {
		description: "Use ContextMenu for actions that are specific to the object or area the user invoked.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for secondary object actions such as rename, duplicate, move, or delete.",
			},
			{
				guidance: "do",
				description: "Group destructive or uncommon actions away from frequent safe actions.",
			},
			{
				guidance: "dont",
				description: "Do not make ContextMenu the only way to access a primary or required action.",
			},
			{
				guidance: "dont",
				description: "Do not rely on it for touch. There is no right-click on a touchscreen — the long-press fallback is discoverable by nobody, so anything in here needs a visible route too.",
			},
		],
		anatomy: [
			{
				name: "ContextMenuTrigger",
				required: true,
				description: "The target area or element that opens the menu.",
			},
			{
				name: "ContextMenuContent",
				required: true,
				description: "The menu surface.",
			},
			{
				name: "ContextMenuItem",
				required: true,
				description: "One actionable command.",
			},
			{
				name: "ContextMenuSeparator",
				required: false,
				description: "A divider between command groups.",
			},
			{
				name: "ContextMenuGroup",
				required: false,
				description: "A semantic group of related commands.",
			},
			{
				name: "ContextMenuGroupLabel",
				required: false,
				description: "An optional label for a command group.",
			},
		],
	},
	related: {
		components: [
			"Menu",
			"OverflowMenu",
		],
	},
	props: [
		{
			name: "ContextMenu (Root)",
			type: "Base UI ContextMenu.Root props (open, defaultOpen, onOpenChange, orientation, loopFocus)",
			default: "—",
			description:
				"Groups all parts and controls open state. Renders no element. Uncontrolled by default.",
		},
	],
	subcomponents: [
		{
			name: "ContextMenuTrigger",
			type: "Base UI ContextMenu.Trigger props + className + render",
			description:
				"The right-clickable area that opens the menu on contextmenu (right click) or long press. Renders a <div>.",
		},
		{
			name: "ContextMenuContent",
			type: "Base UI Popup props + { side, align, sideOffset, className }",
			description:
				"Portal + Positioner + Popup. Positions at the pointer. side is which side of the anchor the popup renders against (auto-flips on collision), align its alignment along that side, sideOffset the gap in px. Defaults to side='bottom', align='start', sideOffset=6.",
		},
		{
			name: "ContextMenuItem",
			type: 'Base UI ContextMenu.Item props + variant?: "default" | "destructive" + shortcut?: ReactNode + className (disabled, closeOnClick, onClick)',
			description:
				"An interactive row. Lays out as a flex row, so a leading Icon sits inline before the label. Highlights via data-[highlighted]; dims via data-[disabled], and disabled items are skipped by keyboard focus. variant=\"destructive\" marks a destructive command (Delete, Remove) and keeps its destructive ink while highlighted; never fake it with a text-destructive class, which the highlight repaints. `shortcut` ends the row with the command's key, muted and end-aligned, as on MenuItem.",
		},
		{
			name: "ContextMenuSeparator",
			type: "Base UI Separator props + className",
			description: "Hairline rule between item runs.",
		},
		{
			name: "ContextMenuGroup",
			type: "Base UI ContextMenu.Group props + className",
			description:
				"Groups related items under an accessible label auto-associated with the group.",
		},
		{
			name: "ContextMenuGroupLabel",
			type: "Base UI ContextMenu.GroupLabel props + className",
			description:
				"The label for a ContextMenuGroup. Auto-associated with the group it sits in.",
		},
	],
	tokensUsed: [
		"popover",
		"popover-foreground",
		"border",
		"accent",
		"accent-foreground",
		"muted-foreground",
	],
	a11y: [
		"Base UI provides role=menu/menuitem, roving tabindex, arrow-key navigation, and typeahead.",
		"Opens on right click (contextmenu) or long press; Esc and outside-press dismiss and restore focus.",
		"Animate open/close via data-[starting-style]/data-[ending-style] attributes.",
		"ContextMenuGroupLabel is auto-associated with its ContextMenuGroup for screen readers.",
	],
	examples: [
		{
			label: "Basic",
			code: '<ContextMenu><ContextMenuTrigger className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-muted-foreground">Right-click here</ContextMenuTrigger><ContextMenuContent><ContextMenuItem shortcut="Ctrl X">Cut</ContextMenuItem><ContextMenuItem shortcut="Ctrl C">Copy</ContextMenuItem><ContextMenuItem shortcut="Ctrl V">Paste</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem variant="destructive">Delete</ContextMenuItem></ContextMenuContent></ContextMenu>',
		},
		{
			label: "Grouped",
			code: '<ContextMenu><ContextMenuTrigger className="rounded-md border border-dashed border-border p-8">Right-click here</ContextMenuTrigger><ContextMenuContent><ContextMenuGroup><ContextMenuGroupLabel>Layout</ContextMenuGroupLabel><ContextMenuItem>Move up</ContextMenuItem><ContextMenuItem>Move down</ContextMenuItem></ContextMenuGroup><ContextMenuSeparator /><ContextMenuItem>Duplicate</ContextMenuItem></ContextMenuContent></ContextMenu>',
		},
	],
}
