import type { ComponentMeta } from "../../lib/meta"

export const menubarMeta: ComponentMeta = {
	name: "Menubar",
	summary:
		"An application's row of menus — File, Edit, View — over Base UI's Menubar. Each menu is an ordinary Sable Menu with a MenubarTrigger as its title; the bar joins them into one tab stop with ←/→ between titles, and once one menu is open, pointing at a neighbour opens it.",
	status: "stable",
	keywords: ["menubar", "menu bar", "app menu", "file menu", "edit menu", "application menu", "desktop menu"],
	usage: {
		description:
			"Use Menubar for a tool or editor whose commands are too many for a toolbar and belong under named menus (File, Edit, View, Help). Use Toolbar for a row of direct actions, a single Menu or OverflowMenu for one set of options, and NavigationMenu-style links for site navigation.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Compose each menu from the Menu parts: `<Menu><MenubarTrigger>File</MenubarTrigger><MenuContent>…</MenuContent></Menu>`. Rows, groups, submenus, checkbox and radio items are the same parts a lone Menu uses.",
			},
			{
				guidance: "do",
				description: "Name the bar with aria-label (\"Editor\") so it is announced as the application's menus, not a list of buttons.",
			},
			{
				guidance: "do",
				description: "Keep titles to one short word each. A reader scans a menubar left to right; a phrase in the bar is a toolbar button.",
			},
			{
				guidance: "dont",
				description:
					"Do not use MenubarTrigger outside a Menubar, or a plain MenuTrigger inside one. The bar's arrow keys and hover-to-switch work on the triggers it owns; a Button trigger in the bar looks like a menu title and behaves like a stray button.",
			},
			{
				guidance: "dont",
				description: "Do not use a menubar for site navigation. Its items are commands in menus (role=menuitem), not links between pages.",
				instead: ["NavigationMenu"],
			},
		],
		anatomy: [
			{ name: "Menubar", required: true, description: "The bar: role=menubar, one tab stop, arrow keys between titles." },
			{ name: "Menu", required: true, description: "One per title; the ordinary Menu root." },
			{ name: "MenubarTrigger", required: true, description: "The title in the bar that opens its menu." },
			{ name: "MenuContent", required: true, description: "The menu's popup, with MenuItem / MenuSubmenu / MenuCheckboxItem rows inside." },
		],
	},
	related: {
		components: ["Menu", "Toolbar", "OverflowMenu", "ContextMenu"],
	},
	props: [
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "The bar's axis. Arrow keys follow it: ←/→ along a horizontal bar, ↑/↓ down a vertical one.",
		},
		{
			name: "loopFocus",
			type: "boolean",
			default: "true",
			description: "Wrap from the last title back to the first with the arrow keys.",
		},
		{
			name: "modal",
			type: "boolean",
			default: "true",
			description: "While a menu is open, block pointer interaction outside it and lock page scroll, like a lone Menu.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disable every menu in the bar.",
		},
		{
			name: "className",
			type: "string",
			description: "Layout classes for the bar. Titles take their look from MenubarTrigger.",
		},
	],
	subcomponents: [
		{
			name: "MenubarTrigger",
			type: "Base UI Menu.Trigger props + className",
			description:
				"A menu's title in the bar. A small ghost Button in the control type tier, held in the accent wash while its menu is open (`sable-open:`), so the reader sees which title the popup belongs to.",
		},
	],
	tokensUsed: ["accent", "accent-foreground", "foreground", "ring"],
	a11y: [
		"Base UI renders role=\"menubar\" with aria-orientation; each title is a menuitem with aria-haspopup and aria-expanded.",
		"The bar is one tab stop. ←/→ move between titles (↑/↓ when vertical), ↓ or Enter opens a menu and moves into it, and Esc closes it and returns focus to its title.",
		"With one menu open, pointing at another title opens that menu instead, so a reader can sweep across the bar, as in a desktop application.",
		"Name the bar with aria-label; titles are their own text.",
	],
	examples: [
		{
			label: "Editor menus",
			code: '<Menubar aria-label="Editor">\n\t<Menu>\n\t\t<MenubarTrigger>File</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem>New</MenuItem>\n\t\t\t<MenuItem>Open…</MenuItem>\n\t\t\t<MenuSeparator />\n\t\t\t<MenuItem>Save</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n\t<Menu>\n\t\t<MenubarTrigger>Edit</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem>Undo</MenuItem>\n\t\t\t<MenuItem>Redo</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n</Menubar>',
		},
		{
			label: "With a submenu and toggling rows",
			code: '<Menubar aria-label="Editor">\n\t<Menu>\n\t\t<MenubarTrigger>View</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuCheckboxItem checked={ruler} onCheckedChange={setRuler}>Show ruler</MenuCheckboxItem>\n\t\t\t<MenuSubmenu>\n\t\t\t\t<MenuSubmenuTrigger value={zoom}>Zoom</MenuSubmenuTrigger>\n\t\t\t\t<MenuContent side="inline-end" align="start" sideOffset={4}>\n\t\t\t\t\t<MenuRadioGroup value={zoom} onValueChange={setZoom}>\n\t\t\t\t\t\t<MenuRadioItem value="100%">100%</MenuRadioItem>\n\t\t\t\t\t\t<MenuRadioItem value="Fit">Fit</MenuRadioItem>\n\t\t\t\t\t</MenuRadioGroup>\n\t\t\t\t</MenuContent>\n\t\t\t</MenuSubmenu>\n\t\t</MenuContent>\n\t</Menu>\n</Menubar>',
		},
	],
}
