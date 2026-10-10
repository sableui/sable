# Stack

**Status:** stable

Vertical flow on the 8px rhythm — the default container for stacked content. Gap by role: tight within a group (1.5–2), looser between groups (3–4), generous between sections (6+).

**Keywords:** stack, vertical rhythm, layout, spacing

## Usage

Use Stack for vertical flow where child spacing should follow the Sable rhythm scale.

### Best practices

- Do: Use smaller gaps within a group and larger gaps between sections.
- Do: Use Stack instead of ad hoc margins when siblings form a vertical composition.
- Don't: Do not use Stack to create page width or grid structure; pair it with Region, Grid, or Columns.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gap | number \| string | 2 | Vertical gap. Number = rhythm units (×8px, fractions ok — 2 = 16px); string = raw CSS. |
| align | "start" \| "center" \| "end" \| "stretch" | "stretch" | Cross-axis alignment. |
| justify | "start" \| "center" \| "end" \| "between" | "start" | Main-axis distribution. |

## Related

- Components: Row, Page, Fieldset

## Examples

### Form field group

```tsx
import { Field, Input, Stack, Textarea } from "@sableui/react"

<Stack gap={2}><Field label="Display name"><Input name="name" /></Field><Field label="Bio"><Textarea name="bio" /></Field></Stack>
```
