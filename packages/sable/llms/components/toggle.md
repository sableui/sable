# Toggle

**Status:** stable

Pressed-state button over Base UI Toggle, plus ToggleGroup for shared single- or multi-select rows. Pressed styling reads from data-[pressed].

**Keywords:** toggle, pressed, button state, toolbar, segmented control, segmented, toggle group, button group, view switcher

## Usage

Use Toggle for button-like controls that can be pressed on or off within a toolbar or compact control set.

### Best practices

- Do: Use it for transient UI modes such as bold, preview, pin, or favorite.
- Do: Make the pressed state visually and programmatically clear.
- Do: Use ToggleGroup appearance="segmented" for a single-select view switch (List / Grid). It is the same capsule ThemeSwitcher wears — do not hand-build a track around a row of toggles.
- Don't: Do not use Toggle for persistent application settings; use Switch. → use **Switch**
- Don't: Do not leave an icon-only Toggle without an accessible name. It announces as "button, pressed", which tells a screen-reader user the state but never what the state applies to.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Toggle | yes | A single pressed or unpressed control. |
| ToggleGroup | no | A coordinated group of toggle choices. |
| ToggleGroupItem | no | One toggle inside a group — an alias of Toggle, so <Toggle value="…"> inside a ToggleGroup is the same thing. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| ToggleGroup | Base UI ToggleGroup props (value, defaultValue, onValueChange, multiple, disabled, orientation, loopFocus) + appearance?: "default" \| "segmented" + className | Groups child Toggles and shares pressed state across them — each Toggle inside carries a value. Defaults to multiple: false (single-select) — the fit for view-mode switches and segmented controls; pass multiple to allow several pressed at once, e.g. a row of formatting toggles. |
| ToggleGroupItem | Alias of Toggle | Re-export of Toggle for group composition — a Toggle carrying a value is the group item. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| appearance | "default" \| "segmented" | "default" | On ToggleGroup: `default` is a loose row of toggles; `segmented` draws the capsule segmented control (one track, the pressed option filled) shared with ThemeSwitcher. Toggles inside inherit it. |
| multiple | boolean | false | On ToggleGroup: allow several toggles pressed at once. The default is single-select, which behaves like a radio group. |
| Toggle | Base UI Toggle props (pressed, defaultPressed, onPressedChange, disabled, value) + className | defaultPressed: false | A two-state button. Uncontrolled via defaultPressed; controlled via pressed + onPressedChange. Pass value to identify it inside a ToggleGroup. |

## Variants

- **appearance**: default, segmented

## Tokens used

`muted-foreground`, `foreground`, `accent`, `accent-foreground`, `card`, `border`, `ring`

## Accessibility

- Base UI sets aria-pressed on each Toggle and manages the pressed/disabled states.
- ToggleGroup provides arrow-key roving focus across its items; loopFocus wraps at the ends.
- Pressed styling reads from the data-[pressed] attribute; disabled items are dimmed and non-interactive.
- Always supply an aria-label (or visible text) when a Toggle holds only an icon.

## Related

- Components: Switch, Button, Tabs

## Examples

### Standalone

```tsx
import { Toggle } from "@sableui/react"

<Toggle aria-label="Mute">Mute</Toggle>
```

### Single-select group

```tsx
import { Icon, Toggle, ToggleGroup } from "@sableui/react"

<ToggleGroup defaultValue={["list"]}><Toggle value="list" aria-label="List view"><Icon name="list" /></Toggle><Toggle value="grid" aria-label="Grid view"><Icon name="grid" /></Toggle></ToggleGroup>
```

### Segmented view switch

```tsx
import { Icon, Toggle, ToggleGroup } from "@sableui/react"

<ToggleGroup appearance="segmented" defaultValue={["list"]} aria-label="View"><Toggle value="list" aria-label="List view"><Icon name="list" /></Toggle><Toggle value="grid" aria-label="Grid view"><Icon name="grid" /></Toggle></ToggleGroup>
```

### Multi-select group

```tsx
import { Toggle, ToggleGroup } from "@sableui/react"

<ToggleGroup multiple defaultValue={["bold"]}><Toggle value="bold">Bold</Toggle><Toggle value="italic">Italic</Toggle></ToggleGroup>
```
