# ButtonGroup

**Status:** stable

Buttons joined into one control: a split button (an action beside the chevron that opens its menu) or a short run of related actions. The children stay ordinary Buttons; the group squares their inner corners, collapses bordered seams into one hairline, and draws a seam between filled ones.

**Keywords:** split button, button group, segmented actions, dropdown button, joined buttons, toolbar

## Usage

Use ButtonGroup when one action has close alternatives (Copy page, with Open in… behind a chevron) or a few actions belong together as one object (zoom out, reset, zoom in). Use ToggleGroup for a choice that stays selected, and Tabs to switch views.

### Best practices

- Do: Give the children one height: `size="sm"` with `size="icon-sm"`, `md` with `icon`. The group aligns them but cannot reconcile two heights into one edge.
- Do: For a split button, put the main action first and a Menu whose trigger is the chevron Button second, with an aria-label on the trigger ("More page actions").
- Do: Name the group with aria-label when the buttons alone do not say what they act on.
- Don't: Do not round or border the children yourself to make them meet; that is the group's job, and an override breaks under a theme's button shape.
- Don't: Do not use it for a selection that stays on. That is ToggleGroup, which carries the pressed state.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| role | string | "group" | Group semantics, so a screen reader announces the buttons as one set. Pass `toolbar` when it carries arrow-key navigation of your own. |
| className | string | — | Layout classes for the group (margins, alignment). The children's look comes from their own variants. |
| ...props | ComponentPropsWithRef<"div"> | — | All native <div> attributes, including aria-label. |

## Accessibility

- Renders role="group", so assistive tech announces the buttons as one set; name it with aria-label.
- Each child keeps its own focus stop and label; a focused child is raised above its neighbour so its ring is drawn whole.
- An icon-only chevron that opens a menu needs its own aria-label, such as "More page actions".

## Related

- Components: Button, Menu, Toggle

## Examples

### Split button with a menu

```tsx
import { Button, ButtonGroup, Icon, Menu, MenuContent, MenuItem, MenuTrigger } from "@sableui/react"

<ButtonGroup aria-label="Page actions"><Button variant="outline" size="sm" iconStart={<Icon name="copy" />} onClick={copy}>Copy page</Button><Menu><MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}><Icon name="chevron-down" /></MenuTrigger><MenuContent align="end"><MenuItem icon={<Icon name="file" />} description="View this page as plain text">View as Markdown</MenuItem></MenuContent></Menu></ButtonGroup>
```

### Related actions

```tsx
import { Button, ButtonGroup, Icon } from "@sableui/react"

<ButtonGroup aria-label="Zoom"><Button variant="secondary" size="icon-sm" aria-label="Zoom out"><Icon name="minus" /></Button><Button variant="secondary" size="sm">100%</Button><Button variant="secondary" size="icon-sm" aria-label="Zoom in"><Icon name="plus" /></Button></ButtonGroup>
```
