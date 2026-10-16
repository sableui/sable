# Menubar

**Status:** stable

An application's row of menus — File, Edit, View — over Base UI's Menubar. Each menu is an ordinary Sable Menu with a MenubarTrigger as its title; the bar joins them into one tab stop with ←/→ between titles, and once one menu is open, pointing at a neighbour opens it.

**Keywords:** menubar, menu bar, app menu, file menu, edit menu, application menu, desktop menu

## Usage

Use Menubar for a tool or editor whose commands are too many for a toolbar and belong under named menus (File, Edit, View, Help). Use Toolbar for a row of direct actions, a single Menu or OverflowMenu for one set of options, and NavigationMenu-style links for site navigation.

### Best practices

- Do: Compose each menu from the Menu parts: `<Menu><MenubarTrigger>File</MenubarTrigger><MenuContent>…</MenuContent></Menu>`. Rows, groups, submenus, checkbox and radio items are the same parts a lone Menu uses.
- Do: Name the bar with aria-label ("Editor") so it is announced as the application's menus, not a list of buttons.
- Do: Keep titles to one short word each. A reader scans a menubar left to right; a phrase in the bar is a toolbar button.
- Don't: Do not use MenubarTrigger outside a Menubar, or a plain MenuTrigger inside one. The bar's arrow keys and hover-to-switch work on the triggers it owns; a Button trigger in the bar looks like a menu title and behaves like a stray button.
- Don't: Do not use a menubar for site navigation. Its items are commands in menus (role=menuitem), not links between pages. → use **NavigationMenu**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Menubar | yes | The bar: role=menubar, one tab stop, arrow keys between titles. |
| Menu | yes | One per title; the ordinary Menu root. |
| MenubarTrigger | yes | The title in the bar that opens its menu. |
| MenuContent | yes | The menu's popup, with MenuItem / MenuSubmenu / MenuCheckboxItem rows inside. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| MenubarTrigger | Base UI Menu.Trigger props + className | A menu's title in the bar. A small ghost Button in the control type tier, held in the accent wash while its menu is open (`sable-open:`), so the reader sees which title the popup belongs to. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | The bar's axis. Arrow keys follow it: ←/→ along a horizontal bar, ↑/↓ down a vertical one. |
| loopFocus | boolean | true | Wrap from the last title back to the first with the arrow keys. |
| modal | boolean | true | While a menu is open, block pointer interaction outside it and lock page scroll, like a lone Menu. |
| disabled | boolean | false | Disable every menu in the bar. |
| className | string | — | Layout classes for the bar. Titles take their look from MenubarTrigger. |

## Tokens used

`accent`, `accent-foreground`, `foreground`, `ring`

## Accessibility

- Base UI renders role="menubar" with aria-orientation; each title is a menuitem with aria-haspopup and aria-expanded.
- The bar is one tab stop. ←/→ move between titles (↑/↓ when vertical), ↓ or Enter opens a menu and moves into it, and Esc closes it and returns focus to its title.
- With one menu open, pointing at another title opens that menu instead, so a reader can sweep across the bar, as in a desktop application.
- Name the bar with aria-label; titles are their own text.

## Related

- Components: Menu, Toolbar, OverflowMenu, ContextMenu

## Examples

### Editor menus

```tsx
import { Menu, Menubar, MenubarTrigger, MenuContent, MenuItem, MenuSeparator } from "@sableui/react"

<Menubar aria-label="Editor">
	<Menu>
		<MenubarTrigger>File</MenubarTrigger>
		<MenuContent>
			<MenuItem>New</MenuItem>
			<MenuItem>Open…</MenuItem>
			<MenuSeparator />
			<MenuItem>Save</MenuItem>
		</MenuContent>
	</Menu>
	<Menu>
		<MenubarTrigger>Edit</MenubarTrigger>
		<MenuContent>
			<MenuItem>Undo</MenuItem>
			<MenuItem>Redo</MenuItem>
		</MenuContent>
	</Menu>
</Menubar>
```

### With a submenu and toggling rows

```tsx
import { Menu, Menubar, MenubarTrigger, MenuCheckboxItem, MenuContent, MenuRadioGroup, MenuRadioItem, MenuSubmenu, MenuSubmenuTrigger } from "@sableui/react"

<Menubar aria-label="Editor">
	<Menu>
		<MenubarTrigger>View</MenubarTrigger>
		<MenuContent>
			<MenuCheckboxItem checked={ruler} onCheckedChange={setRuler}>Show ruler</MenuCheckboxItem>
			<MenuSubmenu>
				<MenuSubmenuTrigger value={zoom}>Zoom</MenuSubmenuTrigger>
				<MenuContent side="inline-end" align="start" sideOffset={4}>
					<MenuRadioGroup value={zoom} onValueChange={setZoom}>
						<MenuRadioItem value="100%">100%</MenuRadioItem>
						<MenuRadioItem value="Fit">Fit</MenuRadioItem>
					</MenuRadioGroup>
				</MenuContent>
			</MenuSubmenu>
		</MenuContent>
	</Menu>
</Menubar>
```
