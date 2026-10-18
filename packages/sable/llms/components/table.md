# Table

**Status:** stable

Styled native table subcomponents (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption). Horizontally scrollable frame, hairline row borders, hover-lift, and selectable rows via data-selected.

**Keywords:** table, data table, rows, columns, grid, caption, header, cell, tabular

## Usage

Use Table for structured data with consistent columns and rows. Use DataTable when the table should be data-driven with sorting or empty state behavior, and use lists or cards when each item has a different shape.

### Best practices

- Do: Use TableCaption and TableHead so the table has a clear purpose and column semantics.
- Do: Keep cells concise and scannable; compose Badge, StatusDot, Avatar, or Button only when they clarify the row.
- Do: Use the built-in horizontal frame for overflow instead of squeezing columns until content becomes unreadable.
- Do: Put a table in a card with `<CardContent flush>`. The first and last columns then take the card's own padding (`--table-edge-px`), so they line up with the CardHeader at any density. Never hand-set `pl-6`/`pr-6` on edge cells.
- Don't: Use Table for heterogeneous items with no stable columns. Use Card, Entity, or a list composition instead. → use **Card**, **Entity**
- Don't: Put every possible action in every row. Use one primary row action, an OverflowMenu, or row detail navigation.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Caption | no | Accessible summary of what the table contains. |
| Header | yes | Column labels rendered with TableHead cells. |
| Body | yes | Rows and cells containing the tabular data. |
| Footer | no | Optional totals or summary row group. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| TableHeader | ComponentPropsWithRef<"thead"> | The header row group (thead). |
| TableBody | ComponentPropsWithRef<"tbody"> | The data row group (tbody). |
| TableFooter | ComponentPropsWithRef<"tfoot"> | Summary row group (tfoot) with a muted fill. |
| TableRow | ComponentPropsWithRef<"tr"> | A row (tr) — hairline bottom border, hover lift, and a selected state via the data-selected attribute. |
| TableHead | ComponentPropsWithRef<"th"> & { numeric?: boolean } | A column header cell (th) in muted label styling. `numeric` marks a number column: end-aligned, tabular figures — set it on the column's cells too. |
| TableCell | ComponentPropsWithRef<"td"> & { numeric?: boolean } | A data cell (td). `numeric` end-aligns it with tabular figures, matching its column's header. |
| TableCaption | ComponentPropsWithRef<"caption"> | Accessible description of the table (caption), muted. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| className | string | — | The root renders a horizontally scrollable frame around a native <table>; forwards all native table attributes plus className. Each subcomponent likewise forwards its element's native attributes + className. |

## Tokens used

`border`, `muted`, `muted-foreground`

## Motion

- **arrival** · Root · _no motion_ — A table renders with the page it sits in. Staggering rows in delays reading data someone opened to scan.
- **response** · TableRow · `motion-interactive` — Body rows ease to a muted wash under the pointer. Across a wide row, the wash is what keeps the eye on the right line, and eased it follows the cursor down the table rather than strobing.
- **transition** · TableCell · `motion-interactive` — A `data-selected` row's fill eases in on every cell together, so the selected row reads as one band being set rather than a stamp.
- **activity** · Root · _no motion_ — Table is markup. Loading rows are Skeletons, which carry the shimmer.

## Accessibility

- Renders semantic native table elements (thead/tbody/tfoot/th/td/caption) preserving built-in table semantics.
- Use TableHead (th) for column headers and TableCaption for an accessible description.
- Mark the active row with the data-selected attribute for a visible selected state.

## Related

- Components: DataTable, Pagination, Badge, StatusDot, Avatar
- Patterns: DashboardPage, ListDetailPage

## Examples

### Orders

```tsx
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@sableui/react"

<Table>
	<TableCaption>Recent orders</TableCaption>
	<TableHeader>
		<TableRow>
			<TableHead>Customer</TableHead>
			<TableHead>Order</TableHead>
			<TableHead>Paid</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell>@nova</TableCell>
			<TableCell>1042</TableCell>
			<TableCell>$48.00</TableCell>
		</TableRow>
	</TableBody>
</Table>
```

### Rich status cells

```tsx
import { Avatar, Badge, Button, Row, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@sableui/react"

<Table><TableCaption>Deployments</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Owner</TableHead><TableHead className="text-end">Actions</TableHead></TableRow></TableHeader><TableBody><TableRow data-selected><TableCell>Catalog API</TableCell><TableCell><Badge appearance="plain" tone="warning" dot pulse>Building</Badge></TableCell><TableCell><Row gap={1}><Avatar fallback="NR" alt="Nova Reed" size="sm" /><span>Nova</span></Row></TableCell><TableCell className="text-end"><Button size="sm" variant="ghost">View</Button></TableCell></TableRow></TableBody></Table>
```

### Flush in a card

```tsx
import { Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sableui/react"

<Card><CardHeader><CardTitle>Customers</CardTitle></CardHeader><CardContent flush><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Paid</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>@nova</TableCell><TableCell>$48.00</TableCell></TableRow></TableBody></Table></CardContent></Card>
```

### Summary footer

```tsx
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@sableui/react"

<Table><TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-end">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Studio plan</TableCell><TableCell className="text-end">$192.00</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell>Total</TableCell><TableCell className="text-end">$192.00</TableCell></TableRow></TableFooter></Table>
```
