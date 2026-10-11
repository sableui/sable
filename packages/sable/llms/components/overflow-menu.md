# OverflowMenu

**Status:** stable

An overflow ellipsis icon button that opens a Menu. Composes our Menu + Button + Icon — pass MenuItems as children and it wires the ghost icon trigger, accessible label, and portal-rendered content. All keyboard, focus, and dismissal behavior comes through Menu.

**Keywords:** dots menu, more actions, ellipsis, kebab

## Usage

Use OverflowMenu for compact overflow actions when the primary action is already visible elsewhere.

### Best practices

- Do: Use it for secondary commands that belong to a row, card, or toolbar item.
- Do: Keep labels explicit so the icon-only trigger does not obscure the command meaning.
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
