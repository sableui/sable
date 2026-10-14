# SplitPane

**Status:** stable

Responsive two-pane layout: side-by-side at/above a breakpoint, stacked (primary first) below. List-detail, media + metadata.

**Keywords:** split pane, two pane, list detail, responsive

## Usage

Use SplitPane for responsive two-pane layouts where a primary pane and supporting pane stay conceptually linked.

### Best practices

- Do: Use it for media-detail, list-detail, or editor-preview workflows.
- Do: Pick a ratio that reflects the actual priority of the panes.
- Don't: Do not use SplitPane for unrelated columns or uniform grids.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| primary | ReactNode | — | The leading / larger pane (e.g. the media column). |
| secondary | ReactNode | — | The trailing / supporting pane (e.g. the detail column). |
| collapseBelow | "sm" \| "md" \| "lg" \| "xl" | "lg" | Breakpoint at/above which panes sit side by side. |
| ratio | string | "1/1" | Primary:secondary width ratio as "a/b" fr units (e.g. "2/1"). |
| gap | number \| string | var(--grid-gutter) | Gap between panes. |

## Related

- Components: Columns, Grid, Sheet

## Examples

### Media + detail

```tsx
import { AspectBox, Button, SplitPane, Stack } from "@sableui/react"

<SplitPane ratio="2/1" primary={<AspectBox ratio={1}><img src={post.imageUrl} alt={post.title} className="size-full object-cover" /></AspectBox>} secondary={<Stack gap={2}><h1 className="text-heading-1">{post.title}</h1><p className="text-body-md text-muted-foreground">{post.description}</p><Button>Add to cart</Button></Stack>} />
```
