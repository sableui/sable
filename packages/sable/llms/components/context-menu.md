# ContextMenu

**Status:** stable

Right-click menu over Base UI ContextMenu — opens on the native contextmenu event or long press and positions at the pointer. Shares Menu's roving focus, typeahead, ARIA menu/menuitem wiring, collision-aware positioning, and Esc/outside dismissal.

**Keywords:** context menu, right click, overflow, menu

## Usage

Use ContextMenu for actions that are specific to the object or area the user invoked.

### Best practices

- Do: Use it for secondary object actions such as rename, duplicate, move, or delete.
- Do: Group destructive or uncommon actions away from frequent safe actions.
- Don't: Do not make ContextMenu the only way to access a primary or required action.
- Don't: Do not rely on it for touch. There is no right-click on a touchscreen — the long-press fallback is discoverable by nobody, so anything in here needs a visible route too.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| ContextMenuTrigger | yes | The target area or element that opens the menu. |
| ContextMenuContent | yes | The menu surface. |
| ContextMenuItem | yes | One actionable command. |
| ContextMenuSeparator | no | A divider between command groups. |
| ContextMenuGroup | no | A semantic group of related commands. |
| ContextMenuGroupLabel | no | An optional label for a command group. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ContextMenuTrigger | Base UI ContextMenu.Trigger props + className + render | The right-clickable area that opens the menu on contextmenu (right click) or long press. Renders a <div>. |
| ContextMenuContent | Base UI Popup props + { side, align, sideOffset, className } | Portal + Positioner + Popup. Positions at the pointer. side is which side of the anchor the popup renders against (auto-flips on collision), align its alignment along that side, sideOffset the gap in px. Defaults to side='bottom', align='start', sideOffset=6. |
| ContextMenuItem | Base UI ContextMenu.Item props + variant?: "default" \| "destructive" + shortcut?: ReactNode + className (disabled, closeOnClick, onClick) | An interactive row. Lays out as a flex row, so a leading Icon sits inline before the label. Highlights via data-[highlighted]; dims via data-[disabled], and disabled items are skipped by keyboard focus. variant="destructive" marks a destructive command (Delete, Remove) and keeps its destructive ink while highlighted; never fake it with a text-destructive class, which the highlight repaints. `shortcut` ends the row with the command's key, muted and end-aligned, as on MenuItem. |
| ContextMenuSeparator | Base UI Separator props + className | Hairline rule between item runs. |
| ContextMenuGroup | Base UI ContextMenu.Group props + className | Groups related items under an accessible label auto-associated with the group. |
| ContextMenuGroupLabel | Base UI ContextMenu.GroupLabel props + className | The label for a ContextMenuGroup. Auto-associated with the group it sits in. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ContextMenu (Root) | Base UI ContextMenu.Root props (open, defaultOpen, onOpenChange, orientation, loopFocus) | — | Groups all parts and controls open state. Renders no element. Uncontrolled by default. |

## Tokens used

`popover`, `popover-foreground`, `border`, `accent`, `accent-foreground`, `muted-foreground`

## Accessibility

- Base UI provides role=menu/menuitem, roving tabindex, arrow-key navigation, and typeahead.
- Opens on right click (contextmenu) or long press; Esc and outside-press dismiss and restore focus.
- Animate open/close via data-[starting-style]/data-[ending-style] attributes.
- ContextMenuGroupLabel is auto-associated with its ContextMenuGroup for screen readers.

## Related

- Components: Menu, OverflowMenu

## Examples

### Basic

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@sableui/react"

<ContextMenu><ContextMenuTrigger className="rounded-md border border-dashed border-border p-8 text-center text-body-sm text-muted-foreground">Right-click here</ContextMenuTrigger><ContextMenuContent><ContextMenuItem shortcut="Ctrl X">Cut</ContextMenuItem><ContextMenuItem shortcut="Ctrl C">Copy</ContextMenuItem><ContextMenuItem shortcut="Ctrl V">Paste</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem variant="destructive">Delete</ContextMenuItem></ContextMenuContent></ContextMenu>
```

### Grouped

```tsx
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@sableui/react"

<ContextMenu><ContextMenuTrigger className="rounded-md border border-dashed border-border p-8">Right-click here</ContextMenuTrigger><ContextMenuContent><ContextMenuGroup><ContextMenuGroupLabel>Layout</ContextMenuGroupLabel><ContextMenuItem>Move up</ContextMenuItem><ContextMenuItem>Move down</ContextMenuItem></ContextMenuGroup><ContextMenuSeparator /><ContextMenuItem>Duplicate</ContextMenuItem></ContextMenuContent></ContextMenu>
```
