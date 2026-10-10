# Toolbar

**Status:** stable

A row or column of controls that is one tab stop, with arrow-key movement between its items (role="toolbar"), over Base UI Toolbar. Items reuse Button's ghost variants and Input, so they follow density like every other control.

**Keywords:** toolbar, action bar, button row, icon buttons, formatting bar, roving focus, arrow keys, tool chrome, editor toolbar

## Usage

Use Toolbar when three or more related controls sit together and act on the same thing — a text selection, a canvas, a document, a table. Tab lands on the toolbar once and the arrow keys move along it, so a keyboard user crosses an editor's twelve buttons in one keystroke instead of twelve. It works in both registers: ghost sm buttons on a page, compact icon-xs buttons inside a Workspace.

### Best practices

- Do: Give every Toolbar an aria-label that names what it acts on ("Text formatting", "Canvas"). With more than one toolbar on screen, that label is the only way a screen-reader user tells them apart.
- Do: Use size="icon-sm" (page) or size="icon-xs" (workspace) with an aria-label for icon-only ToolbarButtons, and keep one size across the row so the controls line up.
- Do: Split a long row into ToolbarGroups with a ToolbarSeparator between them — undo/redo, text style, insert. Groups give the eye the same structure the arrow keys already cross.
- Do: Compose triggers and toggles through ToolbarButton's render prop — render={<MenuTrigger />}, render={<PopoverTrigger />}, or render={<Toggle value="bold" />} inside a ToggleGroup — so they join the toolbar's arrow-key order.
- Don't: Put a bare Button, Toggle or Input inside a Toolbar. It renders, but it is not a toolbar item: the arrow keys skip it and it takes its own tab stop, which is the inconsistency Toolbar exists to remove. Use ToolbarButton, ToolbarInput, or render through ToolbarButton.
- Don't: Wrap one or two buttons, or a dialog's Cancel/Confirm pair, in a Toolbar. Those are independent actions; arrow-key movement there is a surprise, not a shortcut. A plain row of Buttons is right.
- Don't: Use Toolbar for navigation between pages or views. Links that go somewhere are Tabs, SideNav or Breadcrumbs; ToolbarLink is for the odd link that sits among actions, like Help.
- Don't: Give toolbar buttons primary or destructive fills by default. A toolbar is a quiet strip of tools; the ghost default keeps it from competing with the page's one primary action.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Toolbar | yes | The root (role="toolbar"). Owns orientation, loopFocus and disabled for everything inside it. |
| ToolbarButton | yes | An action. Button's ghost variants by default; `render` composes a menu trigger, popover trigger or Toggle into the toolbar. |
| ToolbarGroup | no | A run of related items. `disabled` disables the whole run. |
| ToolbarSeparator | no | A hairline between groups, oriented across the toolbar. Never a focus stop. |
| ToolbarInput | no | A compact Input that joins the arrow-key order — a search or find field in the bar. |
| ToolbarLink | no | An <a> styled like a ToolbarButton, for a link that sits among the actions. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ToolbarButton | { variant?: buttonVariants variant (default "ghost"); size?: buttonVariants size (default "sm"); disabled?: boolean; focusableWhenDisabled?: boolean (default true); render?: ReactElement } + Base UI Toolbar.Button props | A toolbar action, styled exactly like <Button>. Disabled buttons stay focusable by default and carry aria-disabled. Pass size="icon-sm"/"icon-xs" plus aria-label for icon-only. |
| ToolbarLink | { href?: string; variant?: buttonVariants variant (default "ghost"); size?: buttonVariants size (default "sm"); render?: ReactElement } + Base UI Toolbar.Link props | An <a> in the toolbar's arrow-key order, styled like a ToolbarButton. |
| ToolbarInput | { disabled?: boolean; focusableWhenDisabled?: boolean (default true) } + Base UI Toolbar.Input / native input props | Sable's Input at the sm control height (w-40 by default; override with className). Arrow keys leave the field so it does not trap the row. |
| ToolbarGroup | { disabled?: boolean } + Base UI Toolbar.Group props | Groups related items; `disabled` disables all of them. |
| ToolbarSeparator | Base UI Toolbar.Separator props + className | A hairline-strong rule across the toolbar's axis, exposed as role="separator" and skipped by the arrow keys. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| orientation | "horizontal" \| "vertical" | "horizontal" | Which arrow keys move focus (Left/Right or Up/Down) and which way the items stack. Separators turn to match. |
| loopFocus | boolean | true | Arrowing past the last item wraps to the first, and back. |
| disabled | boolean | false | Disables every item. Items stay focusable (aria-disabled) so the row keeps its shape under the keyboard. |
| aria-label | string | — | Names the toolbar for assistive technology. Always set it. |
| className | string | — | Layout overrides — e.g. `flex-1` to let the toolbar fill a bar. |

## Variants

- **orientation**: horizontal, vertical
- **variant**: ghost, secondary, outline, primary, destructive, link
- **size**: xs, sm, md, icon, icon-sm, icon-xs

## Tokens used

`foreground`, `accent`, `accent-foreground`, `ring`, `hairline-strong`, `input`, `card`

## Motion

- **arrival** · Toolbar · _no motion_ — A toolbar is fixed chrome. It is present when its surface is; animating it in would leave the tools briefly unusable for no reason the user can see.
- **response** · ToolbarButton · `motion-interactive` — Inherited from buttonVariants: hover fill, focus ring and disabled dim ease together, so the item under the arrow keys reads as the one that moved.
- **response** · ToolbarButton · `motion-press` — Inherited from buttonVariants. Many toolbar actions change something off to the side (the canvas, the selection), so the settle on press is the confirmation that lands where the pointer is.
- **transition** · Toolbar · _no motion_ — The toolbar has no state of its own. Pressed state belongs to a Toggle rendered through ToolbarButton, which carries its own transition.
- **activity** · Toolbar · _no motion_ — A toolbar never works on its own. Pending work belongs to the surface the action targets, or to a Spinner in the button that started it.

## Accessibility

- Base UI renders role="toolbar" with aria-orientation, and a roving tabindex: the toolbar is one tab stop, the arrow keys move between items, Home/End jump to the ends.
- Disabled items stay focusable by default and announce as disabled (aria-disabled), so arrowing along the row never silently skips a control. Set focusableWhenDisabled={false} on an item to opt out.
- ToolbarSeparator is role="separator" with the orientation opposite the toolbar's, and is not a focus stop.
- ToolbarInput lets the arrow keys move the caret and only leaves the field at either end of its text.
- Always set aria-label on the Toolbar, and on every icon-only ToolbarButton.
- A Toggle rendered through ToolbarButton keeps aria-pressed; a MenuTrigger keeps aria-haspopup/aria-expanded.

## Related

- Components: Button, Toggle, Menu, Popover, Tooltip, Workspace, PanelSection, Separator

## Examples

### Formatting toolbar

```tsx
import { Icon, Toggle, ToggleGroup, Toolbar, ToolbarButton, ToolbarGroup, ToolbarLink, ToolbarSeparator } from "@sableui/react"

<Toolbar aria-label="Text formatting">
  <ToolbarGroup aria-label="History">
    <ToolbarButton size="icon-sm" aria-label="Undo">
      <Icon name="arrow-left" />
    </ToolbarButton>
    <ToolbarButton size="icon-sm" aria-label="Redo">
      <Icon name="arrow-right" />
    </ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToggleGroup multiple aria-label="Style">
    <ToolbarButton size="icon-sm" aria-label="Bold" render={<Toggle value="bold" />}>
      <Icon name="bold" />
    </ToolbarButton>
    <ToolbarButton size="icon-sm" aria-label="Italic" render={<Toggle value="italic" />}>
      <Icon name="italic" />
    </ToolbarButton>
  </ToggleGroup>
  <ToolbarSeparator />
  <ToolbarLink href="/help">Help</ToolbarLink>
</Toolbar>
```

### With a menu trigger and a search field

```tsx
import { Menu, MenuContent, MenuItem, MenuTrigger, Toolbar, ToolbarButton, ToolbarInput, ToolbarSeparator } from "@sableui/react"

<Toolbar aria-label="Table">
  <ToolbarButton>Export</ToolbarButton>
  <Menu>
    <ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>
    <MenuContent>
      <MenuItem>Compact rows</MenuItem>
      <MenuItem>Comfortable rows</MenuItem>
    </MenuContent>
  </Menu>
  <ToolbarSeparator />
  <ToolbarInput aria-label="Search rows" placeholder="Search" />
</Toolbar>
```

### Vertical tool rail

```tsx
import { Icon, Toolbar, ToolbarButton, ToolbarSeparator } from "@sableui/react"

<Toolbar orientation="vertical" aria-label="Tools">
  <ToolbarButton size="icon-sm" aria-label="Select">
    <Icon name="arrow-up" />
  </ToolbarButton>
  <ToolbarButton size="icon-sm" aria-label="Draw">
    <Icon name="edit" />
  </ToolbarButton>
  <ToolbarSeparator />
  <ToolbarButton size="icon-sm" aria-label="Delete" disabled>
    <Icon name="trash" />
  </ToolbarButton>
</Toolbar>
```

### In a workspace bar

```tsx
import { Icon, Toolbar, ToolbarButton, WorkspaceBar } from "@sableui/react"

<WorkspaceBar>
  <Toolbar aria-label="Document" className="flex-1">
    <ToolbarButton size="xs">File</ToolbarButton>
    <ToolbarButton size="xs">Edit</ToolbarButton>
    <ToolbarButton size="icon-xs" aria-label="Share" className="ms-auto">
      <Icon name="share" />
    </ToolbarButton>
  </Toolbar>
</WorkspaceBar>
```
