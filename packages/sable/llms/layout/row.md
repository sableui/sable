# Row

**Status:** stable

Horizontal flex flow — inline rows of controls, toolbars, action clusters. Defaults to center-aligned, no wrap. Layout lives in classes (flex flex-row items-* justify-*) and the gap in a CSS variable, never inline style, so className utilities override any prop at a breakpoint (hidden md:flex, max-md:flex-col, md:gap-6).

**Keywords:** row, toolbar, horizontal, layout

## Usage

Use Row for horizontal clusters such as action groups, toolbars, metadata, and inline controls.

### Best practices

- Do: Use wrap when controls may not fit on smaller screens.
- Do: Use justify and align intentionally so clusters scan as one unit.
- Don't: Do not use Row for navigation menus or dense tabular structure.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gap | number \| string | 2 | Horizontal gap. Number = rhythm units (×8px); string = raw CSS. |
| align | "start" \| "center" \| "end" \| "stretch" | "center" | Cross-axis alignment. |
| justify | "start" \| "center" \| "end" \| "between" | "start" | Main-axis distribution. |
| wrap | boolean | false | Allow items to wrap. |

## Related

- Components: Stack, Button, Spacer

## Examples

### Action cluster

```tsx
import { Button, Row } from "@sableui/react"

<Row gap={2} justify="end"><Button variant="ghost">Cancel</Button><Button>Save changes</Button></Row>
```

### Responsive through className

```tsx
import { Button, Row } from "@sableui/react"

<Row justify="between"><span className="text-title-sm">Acme</span><Row gap={1} className="max-md:hidden"><Button variant="ghost" size="sm">Docs</Button><Button variant="ghost" size="sm">Pricing</Button></Row></Row>
```
