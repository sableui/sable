# Region

**Status:** stable

The page region: fluid, edge-to-edge with the fluid page inset (--page-inset). Opt-in centered max cap picked by ROLE (prose/form/feed/content/wide/full), never a global page max-width. The root of nearly every route. The inset and cap are classes (px-(--page-inset), max-w-…), so className overrides them at a breakpoint (max-sm:px-0); only safeArea padding is inline.

**Keywords:** region, page width, container, layout

## Usage

Use Region as the page-width primitive that applies fluid page inset and an optional purpose-named max width.

### Best practices

- Do: Choose the max value by what the person does on the page: read (prose), fill in a form (form), scroll one stream (feed), review one record or settings (content), scan and compare rows or cards (wide).
- Do: Omit max (fluid) for work across panes, a board, an editor or a map, where a flexible part uses the extra width; cap text inside it with --measure-prose.
- Do: Give sibling routes in one nav the same width so the header does not jump between them.
- Do: Review a capped or fluid route at 1920px and 2560px: a cap is a ceiling, so below the cap plus app chrome every choice looks the same.
- Do: Use Region near the route or section boundary so inner layout stays intentional.
- Don't: Do not use Region as a global wrapper that forces every page into the same max width.
- Don't: Do not go fluid when the extra width only widens the gaps between fixed columns; cap it.
- Don't: Do not read full as edge to edge: it is the largest cap and keeps the page inset. Use bleed for edge to edge.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | ElementType | "div" | Semantic element to render (e.g. "main", "section", "nav"). |
| inset | boolean | true | Apply the fluid horizontal page inset (--page-inset). |
| max | "prose" \| "form" \| "feed" \| "content" \| "wide" \| "full" \| CSS length | — | Opt-in centered max-width cap, purpose-named: prose 65ch (long-form reading) · form 480px (auth, narrow single-column forms) · feed 640px (single-column timeline) · content 896px (settings/admin panes) · wide 1280px (dashboards, tables, card grids) · full 1536px (the largest cap; keeps the inset, so not edge to edge — that is bleed). Omit for fluid: work views whose panes, board or canvas use the extra width. A cap is a ceiling: it applies only once the viewport minus app chrome exceeds it, so judge it at 1920px and up. |
| bleed | boolean | false | Full-bleed: edge to edge with no inset. Overrides inset. |
| safeArea | boolean \| ("top"\|"bottom"\|"left"\|"right")[] | false | env(safe-area-inset-*) padding for fixed or native-shell surfaces. true pads top+bottom; pass an edge array to target edges. |

## Related

- Components: Page, Grid, Columns

## Examples

### Settings pane

```tsx
import { PageHeader, Region } from "@sableui/react"

<Region as="main" max="content"><PageHeader title="Settings" /></Region>
```

### Dashboard region (capped at wide)

```tsx
import { Card, CardHeader, CardTitle, Grid, Region } from "@sableui/react"

<Region max="wide"><Grid minItemWidth="16rem"><Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader></Card><Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader></Card></Grid></Region>
```

### Fluid workspace: the queue's table takes the extra width

```tsx
import { Card, CardContent, Col, Columns, DataTable, Region, SideNav, SideNavItem } from "@sableui/react"

<Region as="main"><Columns count={{ base: 1, lg: 12 }}><Col span={{ base: 1, lg: 3 }}><SideNav aria-label="Views"><SideNavItem label="Open" active /><SideNavItem label="Pending" /></SideNav></Col><Col span={{ base: 1, lg: 9 }}><Card><CardContent flush><DataTable columns={columns} data={tickets} /></CardContent></Card></Col></Columns></Region>
```
