# Spacer

**Status:** stable

Explicit space on the rhythm, or a flexible grow pusher between siblings (e.g. pushing a footer item to the end of a Row). The size is a class reading a CSS variable, so className resizes or hides it at a breakpoint.

**Keywords:** spacer, spacing, grow, layout

## Usage

Use Spacer for explicit rhythm space or a flex grow pusher between siblings.

### Best practices

- Do: Use grow inside Row when one side of a cluster should push to the far edge.
- Do: Use fixed size only when the space has semantic rhythm value.
- Don't: Do not use Spacer to patch broad layout problems that should be solved by Stack, Row, Grid, or Region.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | number | 1 | Fixed size in rhythm units (×8px; fractions ok). Ignored when grow. |
| axis | "vertical" \| "horizontal" | "vertical" | Axis the fixed size applies to. |
| grow | boolean | — | Flex-grow to push siblings apart (fills available space). |

## Related

- Components: Row, Stack

## Examples

### Push actions to the end

```tsx
import { Button, Row, Spacer } from "@sableui/react"

<Row><span className="text-title-sm">Members</span><Spacer grow /><Button size="sm">Invite</Button></Row>
```
