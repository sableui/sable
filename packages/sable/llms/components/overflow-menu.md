# OverflowMenu

**Status:** stable

An overflow ellipsis icon button that opens a Menu. Composes our Menu + Button + Icon — pass MenuItems as children and it wires the ghost icon trigger, accessible label, and portal-rendered content. All keyboard, focus, and dismissal behavior comes through Menu.

**Keywords:** dots menu, more actions, ellipsis, kebab, responsive actions, responsive action menu, collapse actions, actions overflow on mobile

## Usage

Use OverflowMenu for compact overflow actions when the primary action is already visible elsewhere.

### Best practices

- Do: Use it for secondary commands that belong to a row, card, or toolbar item.
- Do: Keep labels explicit so the icon-only trigger does not obscure the command meaning.
- Do: For actions that fit inline on a wide screen but not a narrow one, render them twice: inline (a Row inside a wrapper shown from a container width; Row sets its own display, so the wrapper does the hiding), and as MenuItems in an OverflowMenu hidden from that width (`@container` + `@md:`). display:none takes the hidden copy out of the accessibility tree, so only one set is ever announced. Keep the primary action inline at every width.
- Don't: Do not hide the most important or most frequent action inside OverflowMenu.
- Don't: Do not use it as the only affordance on a touch surface. It is revealed on hover in most layouts, and hover does not exist on touch — pair it with a visible action or make it always-visible there.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| children | ReactNode | — | The menu rows — MenuItem / MenuSeparator / MenuGroup, etc. Rendered inside MenuContent. |
| align | 'start' \| 'center' \| 'end' | end | Alignment of the popup along its side. Overflow menus typically right-align under the trigger; 'start' anchors the popup's left edge to the trigger instead. |
| label | string | More actions | Accessible label (aria-label) for the icon-only trigger button. |
| icon | string | ellipsis | Semantic icon name rendered in the trigger, always at the solid weight. |
| size | 'icon' \| 'icon-sm' \| 'icon-xs' | icon | The trigger's rung on the icon-button ladder. 'icon' for a card or page header; 'icon-sm' or 'icon-xs' in a list row or dense toolbar, so the trigger does not set the row height. |

## Variants

- **size**: icon, icon-sm, icon-xs

## Tokens used

`popover`, `popover-foreground`, `border`, `accent`, `accent-foreground`, `muted-foreground`

## Accessibility

- The icon-only trigger is labeled via aria-label (label prop, default 'More actions').
- Menu provides role=menu/menuitem, roving tabindex, arrow-key navigation, and typeahead via Base UI.
- Esc and outside-press dismiss; focus returns to the trigger on close.

## Related

- Components: Menu, ContextMenu

## Examples

### Basic

```tsx
import { MenuItem, MenuSeparator, OverflowMenu } from "@sableui/react"

<OverflowMenu label="Post actions"><MenuItem>Edit</MenuItem><MenuItem>Share</MenuItem><MenuSeparator /><MenuItem variant="destructive">Delete</MenuItem></OverflowMenu>
```

### With leading icons

```tsx
import { Icon, MenuItem, MenuSeparator, OverflowMenu } from "@sableui/react"

<OverflowMenu><MenuItem><Icon name="check" className="text-sm" />Mark as read</MenuItem><MenuSeparator /><MenuItem variant="destructive"><Icon name="xmark" className="text-sm" />Delete</MenuItem></OverflowMenu>
```

### Responsive actions: inline when wide, in a menu when narrow

```tsx
import { Button, Icon, MenuItem, OverflowMenu, Row } from "@sableui/react"

<div className="@container/actions flex w-full justify-end">
	<Row gap={1} align="center">
		<div className="hidden @md/actions:block">
			<Row gap={1}>
				<Button variant="ghost" size="sm" iconStart={<Icon name="share" />}>Share</Button>
				<Button variant="ghost" size="sm" iconStart={<Icon name="download" />}>Export</Button>
			</Row>
		</div>
		<div className="@md/actions:hidden">
			<OverflowMenu label="Report actions" size="icon-sm">
				<MenuItem icon={<Icon name="share" />}>Share</MenuItem>
				<MenuItem icon={<Icon name="download" />}>Export</MenuItem>
			</OverflowMenu>
		</div>
		<Button size="sm" iconStart={<Icon name="edit" />}>Edit report</Button>
	</Row>
</div>
```
