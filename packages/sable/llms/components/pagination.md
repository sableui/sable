# Pagination

**Status:** stable

Page navigation built from our own Button + Icon (no Base UI). A <nav aria-label='Pagination'> with prev/next icon buttons that disable at the bounds and numbered page buttons; the current page is a secondary button marked aria-current. Collapses to first/last/current plus a sibling window, bridging skipped runs with an ellipsis.

**Keywords:** pagination, pager, pages, table, results, navigation, next, previous

## Usage

Use Pagination when a result set is split into discrete pages and the user needs predictable movement through them. Pair it with DataTable, list results, or server-paged views; use a load-more Button or infinite scroll when page numbers are not meaningful.

### Best practices

- Do: Keep page state controlled by the parent route or data layer so URL, filters, and result fetches stay in sync.
- Do: Use a specific label when multiple pagers appear on a page, such as "Collector pages".
- Do: Reset to page 1 when filters or search terms materially change the result set.
- Don't: Use Pagination for tiny lists where all items fit comfortably on one page.
- Don't: Hide disabled previous/next buttons at the bounds; disabled controls make the current position clearer.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Nav | yes | The labelled pagination landmark. |
| Previous/next | yes | Icon buttons for adjacent page movement, disabled at the bounds. |
| Page buttons | yes | Numbered buttons with aria-current on the active page. |
| Ellipsis | no | Non-interactive marker for skipped page ranges. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| page | number | — | The active page (1-based). Clamped into the valid range. |
| total | number | — | Total number of pages. |
| onPageChange | (page: number) => void | — | Called with the next page when a control is activated. No-op for out-of-range or unchanged values. |
| siblingCount | number | 1 | Page buttons shown on each side of the current page before the list collapses into ellipses. First and last pages are always shown. |
| label | string | Pagination | Accessible label applied to the surrounding nav element. |
| className | string | — | Extra classes merged onto the nav. |

## Tokens used

`secondary`, `secondary-foreground`, `accent`, `accent-foreground`, `foreground`, `muted-foreground`, `ring`

## Accessibility

- Renders a landmark <nav> with aria-label so assistive tech can jump to the pager.
- The current page button carries aria-current='page'.
- Prev/next buttons are real <button>s with aria-label and become disabled at the bounds.
- Ellipsis slots are aria-hidden — they convey no navigable target.

## Related

- Components: DataTable, Table, Button
- Patterns: ListDetailPage, DashboardPage

## Examples

### Controlled

```tsx
import { Pagination } from "@sableui/react"

const [page, setPage] = useState(1)
<Pagination page={page} total={10} onPageChange={setPage} />
```

### Many pages (ellipsis)

```tsx
import { Pagination } from "@sableui/react"

const [page, setPage] = useState(8)
<Pagination page={page} total={20} onPageChange={setPage} />
```

### Table results footer

```tsx
import { DataTable, Pagination, Stack } from "@sableui/react"

<Stack gap={2}><DataTable data={rows} columns={columns} rowKey={(row) => row.id} /><Pagination label="Collector pages" page={page} total={12} onPageChange={setPage} /></Stack>
```

### Server query state

```tsx
import { Pagination } from "@sableui/react"

const [page, setPage] = useState(searchParams.page ?? 1)
<Pagination page={page} total={pageCount} onPageChange={(next) => { setPage(next); loadPage(next) }} />
```
