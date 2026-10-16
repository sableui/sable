import type { ComponentMeta } from "../../lib/meta"

export const menuMeta: ComponentMeta = {
	name: "Menu",
	summary:
		"Dropdown menu over Base UI Menu — roving focus, typeahead, ARIA menu/menuitem wiring, collision-aware positioning, Esc/outside dismissal. Trigger + portal-rendered popup with items, groups, and separators.",
	status: "stable",
	keywords: [
		"menu",
		"dropdown",
		"actions",
		"commands",
	],
	usage: {
		description: "Use Menu for a compact list of actions opened from a visible trigger.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for secondary or grouped commands that do not need to be visible all the time.",
			},
			{
				guidance: "do",
				description: "Keep item labels action-oriented and easy to scan.",
			},
			{
				guidance: "dont",
				description: "Do not use Menu for complex forms, persistent navigation, or arbitrary rich content.",
			},
			{
				guidance: "dont",
				description: "Do not build a Select out of it. A menu fires actions and has no value; a Select holds one and reports changes. Swapping them loses form semantics and keyboard type-ahead.",
				instead: ["Select"],
			},
			{
				guidance: "do",
				description:
					"Inside a <Workspace> a Menu adapts automatically — its popup re-applies the compact density across the portal, so items render on the chrome type tier and the control ladder resolves to workspace sizes. Do NOT override the size per call site; that was necessary before v0.41 and is now drift.",
			},
		],
		anatomy: [
			{
				name: "MenuTrigger",
				required: true,
				description: "The control that opens the menu.",
			},
			{
				name: "MenuContent",
				required: true,
				description: "The floating command surface.",
			},
			{
				name: "MenuItem",
				required: true,
				description: "One selectable command.",
			},
			{
				name: "MenuSeparator",
				required: false,
				description: "A divider between groups.",
			},
			{
				name: "MenuGroup",
				required: false,
				description: "A grouped set of menu items.",
			},
			{
				name: "MenuGroupLabel",
				required: false,
				description: "A label for a group of items.",
			},
		],
	},
	related: {
		components: [
			"ContextMenu",
			"OverflowMenu",
		],
	},
	props: [
		{
			name: "Menu (Root)",
			type: "Base UI Menu.Root props (open, defaultOpen, onOpenChange, modal, orientation, loopFocus)",
			default: "—",
			description: "Groups all parts and controls open state. Uncontrolled by default.",
		},
	],
	subcomponents: [
		{
			name: "MenuTrigger",
			type: "Base UI Menu.Trigger props + render",
			description:
				"The button that opens the menu. Compose with render={<Button … />}.",
		},
		{
			name: "MenuContent",
			type: "Base UI Popup props + side: 'top' | 'right' | 'bottom' | 'left' + align: 'start' | 'center' | 'end' + sideOffset: number + className",
			description:
				"Portal + Positioner + Popup. side picks which side of the trigger the popup renders against (auto-flips on collision; defaults to 'bottom'); align sets alignment along that side (defaults to 'start'); sideOffset is the gap in px between trigger and popup (defaults to 6).",
		},
		{
			name: "MenuItem",
			type: 'Base UI Menu.Item props + className (disabled, closeOnClick, onClick) + variant?: "default" | "destructive" + icon?: ReactNode + description?: ReactNode',
			description:
				"An interactive row. Highlights via data-[highlighted]; dims via data-[disabled]. variant=\"destructive\" for a delete or irreversible action: it keeps the destructive ink when highlighted (never className=\"text-destructive\", which the highlight repaints). `icon` leads the row; `description` adds a quieter second line saying what the action does, and the icon then sits in a small tile spanning both lines.",
		},
		{
			name: "MenuLinkItem",
			type: "Base UI Menu.LinkItem props (href, target, closeOnClick) + className + icon?: ReactNode + description?: ReactNode",
			description:
				"A row that navigates: a real <a>, so it opens in a new tab, middle-clicks and copies as a link. With target=\"_blank\" it adds rel=\"noopener noreferrer\" and a trailing ↗. Takes icon and description like MenuItem.",
		},
		{
			name: "MenuSeparator",
			type: "Base UI Separator props + className",
			description: "Hairline rule between item runs.",
		},
		{
			name: "MenuSubmenu",
			type: "Base UI Menu.SubmenuRoot props",
			description:
				"A nested menu. Wraps a MenuSubmenuTrigger and its own MenuContent — pass side=\"inline-end\" to that content so the submenu opens away from its parent in RTL as well as LTR.",
		},
		{
			name: "MenuSubmenuTrigger",
			type: "Base UI Menu.SubmenuTrigger props + value: ReactNode + className",
			description:
				"The row that opens a submenu: item styling, a trailing chevron, and an optional `value` showing the current choice so the row reads \"Effort  High ›\" rather than making the reader open it to find out.",
		},
		{
			name: "MenuRadioGroup",
			type: "Base UI Menu.RadioGroup props (value, defaultValue, onValueChange)",
			description:
				"A single-choice group inside a menu. Controlled via value/onValueChange, uncontrolled via defaultValue.",
		},
		{
			name: "MenuRadioItem",
			type: "Base UI Menu.RadioItem props + className (value, disabled)",
			description:
				"One option in a MenuRadioGroup, rendered as menuitemradio with a real checked state. The check sits in a reserved leading column so labels never shift sideways as the highlight moves.",
		},
		{
			name: "MenuCheckboxItem",
			type: "Base UI Menu.CheckboxItem props + className + { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; disabled?: boolean }",
			description:
				"A toggling row, with the same reserved leading column as MenuRadioItem so a menu mixing the two keeps one text margin.",
		},
		{
			name: "MenuGroup",
			type: "Base UI Menu.Group props + className",
			description:
				"Groups related items; pair with MenuGroupLabel for an accessible group name.",
		},
		{
			name: "MenuGroupLabel",
			type: "Base UI Menu.GroupLabel props + className",
			description:
				"The label for a MenuGroup — auto-associated with the group for screen readers.",
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
		"Esc and outside-press dismiss; focus returns to the trigger on close.",
		"Animate open/close via data-[starting-style]/data-[ending-style] attributes.",
		"MenuGroupLabel is auto-associated with its MenuGroup for screen readers.",
		"A disabled MenuItem stays in the arrow-key order — Base UI keeps it focusable with aria-disabled so screen-reader users learn the command exists — but it cannot be activated, and it ignores the pointer.",
	],
	examples: [
		{
			label: "Basic",
			code: '<Menu><MenuTrigger render={<Button variant="secondary">Options</Button>} /><MenuContent><MenuItem>Edit</MenuItem><MenuItem>Duplicate</MenuItem><MenuSeparator /><MenuItem variant="destructive">Delete</MenuItem></MenuContent></Menu>',
		},
		{
			label: "Grouped",
			code: '<Menu><MenuTrigger render={<Button variant="secondary">Account</Button>} /><MenuContent><MenuGroup><MenuGroupLabel>Signed in</MenuGroupLabel><MenuItem>Profile</MenuItem><MenuItem>Settings</MenuItem></MenuGroup><MenuSeparator /><MenuItem>Sign out</MenuItem></MenuContent></Menu>',
		},
		{
			label: "Nested, with a single-choice submenu",
			code: '<Menu>\n\t<MenuTrigger render={<Button variant="secondary">View</Button>} />\n\t<MenuContent>\n\t\t<MenuItem>Reload</MenuItem>\n\t\t<MenuSubmenu>\n\t\t\t<MenuSubmenuTrigger value={density}>Density</MenuSubmenuTrigger>\n\t\t\t<MenuContent side="inline-end" align="start" sideOffset={4}>\n\t\t\t\t<MenuRadioGroup value={density} onValueChange={setDensity}>\n\t\t\t\t\t<MenuRadioItem value="Comfortable">Comfortable</MenuRadioItem>\n\t\t\t\t\t<MenuRadioItem value="Compact">Compact</MenuRadioItem>\n\t\t\t\t</MenuRadioGroup>\n\t\t\t</MenuContent>\n\t\t</MenuSubmenu>\n\t</MenuContent>\n</Menu>',
		},
		{
			label: "Rows with icons and descriptions, and links",
			code: '<Menu>\n\t<MenuTrigger render={<Button variant="outline" size="sm">Share</Button>} />\n\t<MenuContent align="end">\n\t\t<MenuItem icon={<Icon name="copy" />} description="Copy page as Markdown for LLMs" onClick={copy}>Copy page</MenuItem>\n\t\t<MenuLinkItem icon={<Icon name="file" />} description="View this page as plain text" href={markdownUrl} target="_blank">View as Markdown</MenuLinkItem>\n\t</MenuContent>\n</Menu>',
		},
		{
			label: "Toggling rows",
			code: '<Menu>\n\t<MenuTrigger render={<Button variant="secondary">Columns</Button>} />\n\t<MenuContent>\n\t\t<MenuCheckboxItem checked={cols.status} onCheckedChange={(v) => setCol("status", v)}>Status</MenuCheckboxItem>\n\t\t<MenuCheckboxItem checked={cols.updated} onCheckedChange={(v) => setCol("updated", v)}>Updated</MenuCheckboxItem>\n\t</MenuContent>\n</Menu>',
		},
	],
}
