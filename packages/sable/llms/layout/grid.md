# Grid

**Status:** stable

CSS Grid within a region. Two modes: fixed/responsive cols count, or minItemWidth so cells breathe with NO breakpoints (the default choice for card grids). A minItemWidth grid keeps its empty columns (track="fill"), so one result stays one cell wide; track="fit" stretches a fixed set across the row.

**Keywords:** grid, card grid, auto fit, layout

## Usage

Use Grid for uniform grid layouts inside a Region, especially card grids that can breathe responsively.

### Best practices

- Do: Prefer minItemWidth for responsive card grids that do not need breakpoint-specific spans.
- Do: Keep the default track="fill" for collections whose count is data (search results, shelves, galleries): sparse rows keep their empty columns, so one result stays one cell wide.
- Do: Use track="fit" only for a fixed set designed to span the row, such as three KPI cards.
- Do: Use explicit columns only when the design truly needs a fixed track count.
- Don't: Do not use Grid to set a page's reading width; use Region or Center.
- Don't: Do not use track="fit" for results or other data-driven collections: with one or two items the empty columns collapse and each item stretches across the row (a single result rendered as a full-width cover).

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| cols | number \| { base?, sm?, md?, lg?, xl?, "2xl"? } | 12 | Fixed column count or a mobile-first breakpoint map ({ base: 2, md: 4 }). Ignored when minItemWidth is set. |
| minItemWidth | string | — | Breathing mode: repeat(auto-fill, minmax(minItemWidth, 1fr)) — as many columns of at least minItemWidth as fit, wrapping without breakpoints. e.g. "16rem". |
| track | "fill" \| "fit" | "fill" | What a minItemWidth grid does with columns it has no items for (only visible when fewer items than fit one row). "fill" (auto-fill) keeps them, so items keep their size whatever their count — one search result is one cover wide, not a banner. Use it for collections whose count is data: results, shelves, galleries. "fit" (auto-fit) collapses them and stretches the items to share the row — only for a fixed set designed to span it (three KPI cards, plan tiers). |
| gap | number \| [row, column] \| string | var(--grid-gutter) | Gap between cells. Number = rhythm units (×8px); [row, column] = two rhythm counts, for a gallery whose rows want more air than its columns; string = raw CSS. |

## Related

- Components: Region, Columns, Card

## Examples

### Card grid that breathes (no breakpoints)

```tsx
import { Card, CardHeader, CardTitle, Grid } from "@sableui/react"

<Grid minItemWidth="16rem" gap={3}><Card><CardHeader><CardTitle>Alpha</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Beta</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Gamma</CardTitle></CardHeader></Card></Grid>
```

### Sparse results keep their size

```tsx
import { Card, CardDescription, CardHeader, CardTitle, Grid } from "@sableui/react"

// One match still renders one cover wide: the empty columns are kept (track="fill", the default).
<Grid minItemWidth="10rem" gap={2}><Card><CardHeader><CardTitle>Night Swim</CardTitle><CardDescription>Album · Undertow</CardDescription></CardHeader></Card></Grid>
```

### A fixed set that spans the row

```tsx
import { Card, CardDescription, CardHeader, Grid } from "@sableui/react"

<Grid minItemWidth="12rem" track="fit" gap={2}><Card><CardHeader><CardDescription>Listeners</CardDescription><span className="text-mono-xl">48.2k</span></CardHeader></Card><Card><CardHeader><CardDescription>Streams</CardDescription><span className="text-mono-xl">1.3M</span></CardHeader></Card><Card><CardHeader><CardDescription>Saves</CardDescription><span className="text-mono-xl">9,410</span></CardHeader></Card></Grid>
```

### Responsive fixed columns

```tsx
import { Badge, Grid } from "@sableui/react"

<Grid cols={{ base: 1, md: 2, lg: 4 }}><Badge appearance="plain" tone="standard" dot /><Badge appearance="plain" tone="warning" dot /><Badge appearance="plain" tone="neutral" dot /><Badge appearance="plain" tone="destructive" dot /></Grid>
```
