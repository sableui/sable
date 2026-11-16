import type { ComponentMeta } from "../../lib/meta"

export const contextMenuMeta: ComponentMeta = {
	name: "ContextMenu",
	summary:
		"Right-click menu over Base UI ContextMenu — opens on the native contextmenu event or long press and positions at the pointer. Every part below the trigger is Menu's own part under a ContextMenu name (items with icon, description and shortcut; link items; submenus; radio and checkbox rows; groups), so the two menus cannot drift.",
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
			{
				name: "ContextMenuSubmenu",
				required: false,
				description: "A nested menu: a ContextMenuSubmenuTrigger row plus its own ContextMenuContent.",
			},
			{
				name: "ContextMenuRadioGroup",
				required: false,
				description: "A single-choice set of ContextMenuRadioItem rows.",
			},
			{
				name: "ContextMenuCheckboxItem",
				required: false,
				description: "A row that toggles a setting on and off.",
			},
			{
				name: "ContextMenuLinkItem",
				required: false,
				description: "A row that navigates: a real link.",
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
			type: "MenuContent props: Base UI Popup props + side?: 'top' | 'right' | 'bottom' | 'left' | 'inline-start' | 'inline-end' + align?: 'start' | 'center' | 'end' + sideOffset?: number + className?: string",
			description:
				"MenuContent (Portal + Positioner + Popup). Positions at the pointer; also the surface of a ContextMenuSubmenu (side=\"inline-end\"). side is which side of the anchor the popup renders against (auto-flips on collision), align its alignment along that side, sideOffset the gap in px. Defaults to side='bottom', align='start', sideOffset=6.",
		},
		{
			name: "ContextMenuItem",
			type: 'MenuItem props: Base UI Item props + variant?: "default" | "destructive" + icon?: ReactNode + description?: ReactNode + shortcut?: ReactNode + className (disabled, closeOnClick, onClick)',
			description:
				"MenuItem itself. An interactive row; `icon` leads it, and beside a `description` (a second, muted line) the icon sits in a small tile. Lays out as a flex row, so a leading Icon sits inline before the label. Highlights via data-[highlighted]; dims via data-[disabled], and disabled items are skipped by keyboard focus. variant=\"destructive\" marks a destructive command (Delete, Remove) and keeps its destructive ink while highlighted; never fake it with a text-destructive class, which the highlight repaints. `shortcut` ends the row with the command's key, muted and end-aligned, as on MenuItem.",
		},
		{
			name: "ContextMenuLinkItem",
			type: "MenuLinkItem props: Base UI LinkItem props (href, target) + icon? + description? + newTabLabel?: string + className",
			description:
				"MenuLinkItem itself: a row that is a real <a>. With target=\"_blank\" it gets rel=noopener noreferrer, a trailing ↗, and a visually hidden newTabLabel (default \"(opens in new tab)\") so a screen reader announces the new tab.",
		},
		{
			name: "ContextMenuSubmenu",
			type: "Base UI SubmenuRoot props",
			description: "MenuSubmenu itself. Wraps a ContextMenuSubmenuTrigger and a ContextMenuContent with side=\"inline-end\".",
		},
		{
			name: "ContextMenuSubmenuTrigger",
			type: "MenuSubmenuTrigger props: Base UI SubmenuTrigger props + value?: ReactNode + icon?: ReactNode + className",
			description: "MenuSubmenuTrigger itself: a row with a trailing chevron and, optionally, the current value before it.",
		},
		{
			name: "ContextMenuRadioGroup",
			type: "Base UI RadioGroup props (value, defaultValue, onValueChange)",
			description: "MenuRadioGroup itself: a single-choice group.",
		},
		{
			name: "ContextMenuRadioItem",
			type: 'MenuRadioItem props: Base UI RadioItem props (value) + indicatorSide?: "start" | "end" + className',
			description: "MenuRadioItem itself: one option, with its check in a reserved column so labels never shift.",
		},
		{
			name: "ContextMenuCheckboxItem",
			type: "MenuCheckboxItem props: Base UI CheckboxItem props (checked, defaultChecked, onCheckedChange) + shortcut? + className",
			description: "MenuCheckboxItem itself: a toggling row; the menu stays open when it is clicked.",
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
		"Radio and checkbox rows expose menuitemradio / menuitemcheckbox with aria-checked; a submenu trigger opens with ArrowRight (ArrowLeft in RTL) and closes back to its row.",
		"An external ContextMenuLinkItem announces that it opens a new tab through its newTabLabel.",
	],
	examples: [
		{
			label: "Icons, a submenu and view options",
			code: `<ContextMenu>
	<ContextMenuTrigger className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-muted-foreground">Right-click the file</ContextMenuTrigger>
	<ContextMenuContent>
		<ContextMenuItem icon={<Icon name="edit" />} shortcut="F2">Rename</ContextMenuItem>
		<ContextMenuItem icon={<Icon name="copy" />}>Duplicate</ContextMenuItem>
		<ContextMenuSubmenu>
			<ContextMenuSubmenuTrigger icon={<Icon name="folder" />} value="Desktop">Move to</ContextMenuSubmenuTrigger>
			<ContextMenuContent side="inline-end">
				<ContextMenuItem>Desktop</ContextMenuItem>
				<ContextMenuItem>Documents</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenuSubmenu>
		<ContextMenuSeparator />
		<ContextMenuGroup>
			<ContextMenuGroupLabel>View</ContextMenuGroupLabel>
			<ContextMenuCheckboxItem defaultChecked>Show extension</ContextMenuCheckboxItem>
			<ContextMenuRadioGroup defaultValue="name">
				<ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
				<ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
			</ContextMenuRadioGroup>
		</ContextMenuGroup>
		<ContextMenuSeparator />
		<ContextMenuLinkItem href="https://example.com/help" target="_blank">Help</ContextMenuLinkItem>
		<ContextMenuItem variant="destructive" icon={<Icon name="trash" />}>Delete</ContextMenuItem>
	</ContextMenuContent>
</ContextMenu>`,
		},
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
