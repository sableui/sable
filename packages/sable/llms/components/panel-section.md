# PanelSection

**Status:** stable

A flush group of property rows inside a docked panel — eyebrow header, hairline separator, rows beneath. The workspace register's answer to Card, which does not belong in a panel.

**Keywords:** panel, section, inspector, properties, property grid, workspace, tool, chrome, sidebar

## Usage

Use PanelSection to group properties inside an inspector or docked panel, with PropertyRow for one label-plus-control line and PropertyPair for two controls side by side. This is the workspace register's grouping primitive: it separates with a hairline and nothing else, because a Card inside a 240px panel spends its border and inset on nothing and pushes every row inward.

### Best practices

- Do: Group related properties under a short functional title — Blending, Layout, Fill — the way a tool inspector names its sections.
- Do: Reach for PropertyPair before giving each property its own full-width row; pairing halves the vertical cost in a narrow panel.
- Do: Put a section-scoped control (a visibility toggle, an add action) in the action slot rather than inventing a second header row.
- Don't: Wrap panel content in Card. Cards are page-register furniture; in a panel they read as a page pasted into chrome.
- Don't: Repeat the panel's own title as the section title. If the header above already names the selection, title the section by what it controls (Parameters, Blending).
- Don't: Hand-roll a property line (`<div className="flex justify-between"><span>Opacity</span><Slider /></div>`). Use PropertyRow for every label-plus-control line: when each property type invents its own arrangement, a panel of fifteen properties ends up with fifteen layouts.
- Don't: Use PropertyRow for page forms — use Field, which carries label/description/error semantics. PropertyRow is a dense chrome row, not a form control.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Header | yes | The section title in the UI section tier, with an optional trailing action. |
| PropertyRow | no | One property: label left, control right. `stacked` moves the control to its own line for full-width controls. |
| PropertyPair | no | Two controls side by side, with optional captions above each. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| PropertyRow | { label: ReactNode; htmlFor?: string; hint?: string; stacked?: boolean; scrub?: { value, onValueChange, step?, min?, max?, onGestureStart?, onGestureEnd?, disabled? } } | One property line. `hint` becomes the label's hover explanation; `stacked` puts the control on its own line. `scrub` makes the property NAME a drag handle for its value — the Figma/Framer/Paper convention, and the answer for a numeric row with no honest glyph to put in a ScrubField (a schema-generated `levels` or `seed`, where a `#` would be noise pretending to be meaning). Opt-in and additive: a row without it is unchanged. The label stays a real `<label htmlFor>` — a 2px jitter threshold keeps a click a click, and the click synthesised after a real drag is swallowed so a scrub does not also select the field's text. |
| PropertyPair | { labels?: [ReactNode, ReactNode] } | Two controls side by side in a 2-up grid, with optional captions above each. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | ReactNode | — | Section name, rendered as the header in the UI section tier. |
| action | ReactNode | — | Optional trailing control in the header — a visibility toggle, an add action. |

## Tokens used

`foreground`, `muted-foreground`, `hairline`

## Accessibility

- PropertyRow renders a real <label>; pass htmlFor with the control's id so clicking the label focuses it.
- The section title is an h3, so panels contribute a real heading outline rather than styled divs.
- `hint` is exposed as the label's title attribute — keep the essential meaning in the label itself, since title text is not reliably announced.
- A `scrub` label does not replace keyboard editing and must not be the only way to set the value: the drag is a pointer affordance, so the control it names still has to accept typing and arrow keys. It also keeps its `htmlFor` behaviour, which is the reason the gesture arms on a 2px threshold rather than on pointerdown.

## Related

- Components: Workspace, PanelGroup, ScrubField, StatusBar, Field, Card

## Examples

### Blending section, 2-up

```tsx
import { PanelSection, PropertyPair, ScrubField, Select, SelectContent, SelectItem, SelectTrigger } from "@sableui/react"

<PanelSection title="Blending">
  <PropertyPair>
    <ScrubField label="Opacity" value={100} min={0} max={100} suffix="%" />
    <Select value="normal">
      <SelectTrigger size="xs" />
      <SelectContent>
        <SelectItem value="normal">Normal</SelectItem>
        <SelectItem value="multiply">Multiply</SelectItem>
      </SelectContent>
    </Select>
  </PropertyPair>
</PanelSection>
```

### Rows with a stacked slider

```tsx
import { PanelSection, PropertyRow, Select, SelectContent, SelectItem, SelectTrigger, Slider, Switch } from "@sableui/react"

<PanelSection title="Parameters">
  <PropertyRow label="Block size" hint="Block edge length in reference pixels." stacked>
    <Slider value={32} min={4} max={256} />
  </PropertyRow>
  <PropertyRow label="Direction">
    <Select value="both">
      <SelectTrigger size="xs" />
      <SelectContent>
        <SelectItem value="both">Both</SelectItem>
        <SelectItem value="horizontal">Horizontal</SelectItem>
      </SelectContent>
    </Select>
  </PropertyRow>
  <PropertyRow label="Reverse">
    <Switch checked={false} />
  </PropertyRow>
</PanelSection>
```

### Section with a header action

```tsx
import { Button, Icon, PanelSection, PropertyRow, ScrubField } from "@sableui/react"

<PanelSection
  title="Blending"
  action={
    <Button size="icon-xs" variant="ghost" aria-label="Hide layer">
      <Icon name="eye" />
    </Button>
  }
>
  <PropertyRow label="Opacity">
    <ScrubField label="Opacity" value={60} min={0} max={100} suffix="%" />
  </PropertyRow>
</PanelSection>
```
