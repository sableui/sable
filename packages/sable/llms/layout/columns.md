# Columns

**Status:** stable

An explicit N-column track (default 12) for proportioned layouts — pair with Col spans (list-detail, asymmetric editorial layouts). For uniform card grids prefer Grid minItemWidth.

**Keywords:** columns, 12 column, span, layout

## Usage

Use Columns and Col for proportioned layouts that need explicit spans, such as list-detail or asymmetric panes.

### Best practices

- Do: Use breakpoint span maps when the same layout needs to collapse cleanly on smaller screens.
- Do: Use Columns for proportional composition, not for uniform card wrapping.
- Don't: Do not use column spans as a replacement for Region width or text measure.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Columns | yes | The explicit column track container. |
| Col | yes | A child cell with span and optional start placement. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| Col | span?: number \| breakpoint map · start?: number \| breakpoint map | A cell in the track: columns to span (default 1) and optional 1-based start column. Both accept breakpoint maps ({ base: 12, lg: 8 }). |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| count | number \| breakpoint map | 12 | Columns in the track; a breakpoint map ({ base: 2, md: 6, lg: 12 }) thins the track on small screens. |
| gap | number \| string | var(--grid-gutter) | Gap between columns and rows. Number = rhythm units (×8px); string = raw CSS. The column gap is capped so all gaps together never take more than 75% of the track's width — a large gap can't push a narrow screen into horizontal scroll, and at normal desktop widths it renders exactly as given. The row gap is never capped. |

## Related

- Components: Grid, SplitPane, Region

## Examples

### List-detail (8/4)

```tsx
import { Card, CardHeader, CardTitle, Col, Columns } from "@sableui/react"

<Columns count={12}><Col span={{ base: 12, lg: 8 }}><Card><CardHeader><CardTitle>Posts</CardTitle></CardHeader></Card></Col><Col span={{ base: 12, lg: 4 }}><Card variant="flat"><CardHeader><CardTitle>Filters</CardTitle></CardHeader></Card></Col></Columns>
```
