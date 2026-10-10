# Grid

**Status:** stable

CSS Grid within a region. Two modes: fixed/responsive cols count, or minItemWidth auto-fit so cells breathe with NO breakpoints (the default choice for card grids).

**Keywords:** grid, card grid, auto fit, layout

## Usage

Use Grid for uniform grid layouts inside a Region, especially card grids that can breathe responsively.

### Best practices

- Do: Prefer minItemWidth for responsive card grids that do not need breakpoint-specific spans.
- Do: Use explicit columns only when the design truly needs a fixed track count.
- Don't: Do not use Grid to set a page's reading width; use Region or Center.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| cols | number \| { base?, sm?, md?, lg?, xl?, "2xl"? } | 12 | Fixed column count or a mobile-first breakpoint map ({ base: 2, md: 4 }). Ignored when minItemWidth is set. |
| minItemWidth | string | — | Auto-fit mode: repeat(auto-fit, minmax(minItemWidth, 1fr)) — the grid grows/wraps responsively without breakpoints. e.g. "16rem". |
| gap | number \| string | var(--grid-gutter) | Gap between cells. Number = rhythm units (×8px); string = raw CSS. |

## Related

- Components: Region, Columns, Card

## Examples

### Card grid that breathes (no breakpoints)

```tsx
import { Card, CardHeader, CardTitle, Grid } from "@sableui/react"

<Grid minItemWidth="16rem" gap={3}><Card><CardHeader><CardTitle>Alpha</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Beta</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Gamma</CardTitle></CardHeader></Card></Grid>
```

### Responsive fixed columns

```tsx
import { Badge, Grid } from "@sableui/react"

<Grid cols={{ base: 1, md: 2, lg: 4 }}><Badge appearance="plain" tone="standard" dot /><Badge appearance="plain" tone="warning" dot /><Badge appearance="plain" tone="neutral" dot /><Badge appearance="plain" tone="destructive" dot /></Grid>
```
