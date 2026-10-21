# Menu

**Status:** stable

Dropdown menu over Base UI Menu — roving focus, typeahead, ARIA menu/menuitem wiring, collision-aware positioning, Esc/outside dismissal. Trigger + portal-rendered popup with items, groups, and separators.

**Keywords:** menu, dropdown, actions, commands

## Usage

Use Menu for a compact list of actions opened from a visible trigger.

### Best practices

- Do: Use it for secondary or grouped commands that do not need to be visible all the time.
- Do: Keep item labels action-oriented and easy to scan.
- Do: Inside a <Workspace> a Menu adapts automatically — its popup re-applies the compact density across the portal, so items render on the chrome type tier and the control ladder resolves to workspace sizes. Do NOT override the size per call site; that was necessary before v0.41 and is now drift.
- Don't: Do not use Menu for complex forms, persistent navigation, or arbitrary rich content.
- Don't: Do not build a Select out of it. A menu fires actions and has no value; a Select holds one and reports changes. Swapping them loses form semantics and keyboard type-ahead. → use **Select**

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| MenuTrigger | yes | The control that opens the menu. |
| MenuContent | yes | The floating command surface. |
| MenuItem | yes | One selectable command. |
| MenuSeparator | no | A divider between groups. |
| MenuGroup | no | A grouped set of menu items. |
| MenuGroupLabel | no | A label for a group of items. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| MenuTrigger | Base UI Menu.Trigger props + render | The button that opens the menu. Compose with render={<Button … />}. |
| MenuContent | Base UI Popup props + side: 'top' \| 'right' \| 'bottom' \| 'left' + align: 'start' \| 'center' \| 'end' + sideOffset: number + className | Portal + Positioner + Popup. side picks which side of the trigger the popup renders against (auto-flips on collision; defaults to 'bottom'); align sets alignment along that side (defaults to 'start'); sideOffset is the gap in px between trigger and popup (defaults to 6). |
| MenuItem | Base UI Menu.Item props + className (disabled, closeOnClick, onClick) + variant?: "default" \| "destructive" + icon?: ReactNode + description?: ReactNode | An interactive row. Highlights via data-[highlighted]; dims via data-[disabled]. variant="destructive" for a delete or irreversible action: it keeps the destructive ink when highlighted (never className="text-destructive", which the highlight repaints). `icon` leads the row; `description` adds a quieter second line saying what the action does, and the icon then sits in a small tile spanning both lines. |
| MenuLinkItem | Base UI Menu.LinkItem props (href, target, closeOnClick) + className + icon?: ReactNode + description?: ReactNode | A row that navigates: a real <a>, so it opens in a new tab, middle-clicks and copies as a link. With target="_blank" it adds rel="noopener noreferrer" and a trailing ↗. Takes icon and description like MenuItem. |
| MenuSeparator | Base UI Separator props + className | Hairline rule between item runs. |
| MenuSubmenu | Base UI Menu.SubmenuRoot props | A nested menu. Wraps a MenuSubmenuTrigger and its own MenuContent — pass side="inline-end" to that content so the submenu opens away from its parent in RTL as well as LTR. |
| MenuSubmenuTrigger | Base UI Menu.SubmenuTrigger props + value: ReactNode + icon: ReactNode + className | The row that opens a submenu: item styling, a trailing chevron, and an optional `value` showing the current choice so the row reads "Effort  High ›" rather than making the reader open it to find out. `icon` leads the row as MenuItem's does; give it one whenever the items around it have icons, or its label starts a column to their left. |
| MenuRadioGroup | Base UI Menu.RadioGroup props (value, defaultValue, onValueChange) | A single-choice group inside a menu. Controlled via value/onValueChange, uncontrolled via defaultValue. |
| MenuRadioItem | Base UI Menu.RadioItem props + className (value, disabled) | One option in a MenuRadioGroup, rendered as menuitemradio with a real checked state. The check sits in a reserved leading column so labels never shift sideways as the highlight moves. |
| MenuCheckboxItem | Base UI Menu.CheckboxItem props + className + { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void; disabled?: boolean } | A toggling row, with the same reserved leading column as MenuRadioItem so a menu mixing the two keeps one text margin. |
| MenuGroup | Base UI Menu.Group props + className | Groups related items; pair with MenuGroupLabel for an accessible group name. |
| MenuGroupLabel | Base UI Menu.GroupLabel props + className | The label for a MenuGroup — auto-associated with the group for screen readers. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| Menu (Root) | Base UI Menu.Root props (open, defaultOpen, onOpenChange, modal, orientation, loopFocus) | — | Groups all parts and controls open state. Uncontrolled by default. |

## Tokens used

`popover`, `popover-foreground`, `border`, `accent`, `accent-foreground`, `muted-foreground`

## Accessibility

- Base UI provides role=menu/menuitem, roving tabindex, arrow-key navigation, and typeahead.
- Esc and outside-press dismiss; focus returns to the trigger on close.
- Animate open/close via data-[starting-style]/data-[ending-style] attributes.
- MenuGroupLabel is auto-associated with its MenuGroup for screen readers.
- A disabled MenuItem stays in the arrow-key order — Base UI keeps it focusable with aria-disabled so screen-reader users learn the command exists — but it cannot be activated, and it ignores the pointer.

## Related

- Components: ContextMenu, OverflowMenu

## Examples

### Basic

```tsx
import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@sableui/react"

<Menu><MenuTrigger render={<Button variant="secondary">Options</Button>} /><MenuContent><MenuItem>Edit</MenuItem><MenuItem>Duplicate</MenuItem><MenuSeparator /><MenuItem variant="destructive">Delete</MenuItem></MenuContent></Menu>
```

### Grouped

```tsx
import { Button, Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuTrigger } from "@sableui/react"

<Menu><MenuTrigger render={<Button variant="secondary">Account</Button>} /><MenuContent><MenuGroup><MenuGroupLabel>Signed in</MenuGroupLabel><MenuItem>Profile</MenuItem><MenuItem>Settings</MenuItem></MenuGroup><MenuSeparator /><MenuItem>Sign out</MenuItem></MenuContent></Menu>
```

### Nested, with a single-choice submenu

```tsx
import { Button, Menu, MenuContent, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSubmenu, MenuSubmenuTrigger, MenuTrigger } from "@sableui/react"

<Menu>
	<MenuTrigger render={<Button variant="secondary">View</Button>} />
	<MenuContent>
		<MenuItem>Reload</MenuItem>
		<MenuSubmenu>
			<MenuSubmenuTrigger value={density}>Density</MenuSubmenuTrigger>
			<MenuContent side="inline-end" align="start" sideOffset={4}>
				<MenuRadioGroup value={density} onValueChange={setDensity}>
					<MenuRadioItem value="Comfortable">Comfortable</MenuRadioItem>
					<MenuRadioItem value="Compact">Compact</MenuRadioItem>
				</MenuRadioGroup>
			</MenuContent>
		</MenuSubmenu>
	</MenuContent>
</Menu>
```

### Rows with icons and descriptions, and links

```tsx
import { Button, Icon, Menu, MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from "@sableui/react"

<Menu>
	<MenuTrigger render={<Button variant="outline" size="sm">Share</Button>} />
	<MenuContent align="end">
		<MenuItem icon={<Icon name="copy" />} description="Copy page as Markdown for LLMs" onClick={copy}>Copy page</MenuItem>
		<MenuLinkItem icon={<Icon name="file" />} description="View this page as plain text" href={markdownUrl} target="_blank">View as Markdown</MenuLinkItem>
	</MenuContent>
</Menu>
```

### Toggling rows

```tsx
import { Button, Menu, MenuCheckboxItem, MenuContent, MenuTrigger } from "@sableui/react"

<Menu>
	<MenuTrigger render={<Button variant="secondary">Columns</Button>} />
	<MenuContent>
		<MenuCheckboxItem checked={cols.status} onCheckedChange={(v) => setCol("status", v)}>Status</MenuCheckboxItem>
		<MenuCheckboxItem checked={cols.updated} onCheckedChange={(v) => setCol("updated", v)}>Updated</MenuCheckboxItem>
	</MenuContent>
</Menu>
```
