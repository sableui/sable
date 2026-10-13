# DataTable

**Status:** stable

A data-driven table over the Table primitives — a columns def + data array with built-in client-side sorting (click a sortable header to cycle asc → desc → none), optional row click / selection, and an empty state. For server data or paging, sort/page the data and pair with Pagination.

**Keywords:** data table, table, sortable, columns, rows, empty state, pagination, list

## Usage

Use DataTable when a data array and column definition should render a sortable, semantic table with optional row actions and an empty state. Use the lower-level Table parts for hand-authored markup or highly custom row layouts.

### Best practices

- Do: Put a table that fills a card in <CardContent flush>. The table runs edge to edge and its first and last columns inset to the card padding on their own; do not hand-set pl-6 / pr-6 on columns.
- Do: Provide stable rowKey values for dynamic data so selection and sorting do not jump.
- Do: Use sortable only on columns where ordering is obvious and useful.
- Do: Pair server-side datasets with Pagination and pass already-sorted/paged rows.
- Don't: Make every row clickable and also fill it with competing buttons. Choose a clear row interaction model.
- Don't: Use DataTable for heterogeneous cards or timeline content. A list or card layout will scan better.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Columns | yes | Definitions for headers, cell renderers, sorting, alignment, and classes. |
| Rows | yes | The data array rendered through the column definitions. |
| Empty state | no | Content spanning all columns when the row array is empty. |
| Caption | no | Accessible table caption rendered by the underlying Table. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| columns | DataTableColumn<Row>[] | — | Column defs: { key, header, cell?, sortValue?, sortable?, align?, className? }. cell defaults to row[key]; sortValue defaults to row[key]. When cell renders a formatted string (e.g. a date), pass sortValue returning the underlying value (e.g. date.getTime()) so the column sorts by the real value, not the rendered text. |
| data | Row[] | — | The rows to render. |
| rowKey | (row, index) => string \| number | index | Stable React key per row. |
| onRowClick | (row) => void | — | Row click handler — makes rows pointer-interactive. |
| isRowSelected | (row) => boolean | — | Mark a row visually selected (data-selected), e.g. the one open in a detail pane. Derive it from a stable id (row.id === selectedId), not the row index, so selection survives re-sorts. For checking several rows, use selectedKeys. |
| selectedKeys | ReadonlySet<string \| number> | — | The checked rows, by rowKey, for bulk actions. With onSelectedKeysChange it adds a checkbox column (each box named by rowSelectionLabel) and a select-all box in the header that acts on the rows shown and goes mixed when some are checked. Checked rows get the selected fill. Controlled: when the rows shown change (a filter, another view), set the keys to keep, usually none. Needs rowKey. |
| onSelectedKeysChange | (keys: Set<string \| number>) => void | — | Called with the new set of checked keys. Its presence turns selection on. A click on a box never fires onRowClick. |
| rowSelectionLabel | (row) => string | () => "Select row" | A row checkbox's accessible name. Name the row, e.g. (t) => `Select ${t.subject}`, so a screen reader can tell the boxes apart. |
| selectAllLabel | (count: number) => string | (count) => `Select all ${count} shown` | The select-all checkbox's accessible name; say what it acts on ("Select all 7 tickets shown"). |
| defaultSort | { key: string; direction: "asc" \| "desc" } | — | Initial sort column + direction. |
| empty | ReactNode | "No results." | Rendered spanning all columns when data is empty. Pass an EmptyState for the full treatment (icon, title, next step). |
| caption | ReactNode | — | Bottom table caption. |

## Tokens used

`muted-foreground`, `foreground`, `ring`

## Accessibility

- Sorted columns set aria-sort=ascending/descending on the header cell.
- Sortable headers are real <button>s with a focus-visible ring, keyboard-operable.
- Inherits the Table's scrollable frame and semantic <table>/<th>/<td> structure.

## Related

- Components: Table, Pagination, EmptyState, Badge
- Patterns: DashboardPage, ListDetailPage

## Examples

### Checkbox selection with a bulk-action bar

```tsx
import { Button, DataTable, Stack, Toolbar } from "@sableui/react"

const [selected, setSelected] = useState<Set<string | number>>(new Set())

<Stack gap={2}>
	{/* Mounted from the start, so a screen reader hears each change. */}
	<span role="status" className="sr-only">{selected.size ? `${selected.size} of ${tickets.length} selected` : ""}</span>
	{selected.size ? (
		<Toolbar aria-label="Bulk actions">
			<span className="text-label-md">{selected.size} of {tickets.length} selected</span>
			<Button size="sm" variant="secondary" onClick={() => resolve(selected)}>Resolve</Button>
		</Toolbar>
	) : null}
	<DataTable
		data={tickets}
		rowKey={(t) => t.id}
		columns={columns}
		selectedKeys={selected}
		onSelectedKeysChange={setSelected}
		rowSelectionLabel={(t) => `Select ${t.subject}`}
		selectAllLabel={(n) => `Select all ${n} tickets shown`}
	/>
</Stack>
```

### Sortable columns

```tsx
import { DataTable } from "@sableui/react"

<DataTable data={users} columns={[{ key: "name", header: "Name", sortable: true }, { key: "role", header: "Role" }, { key: "joined", header: "Joined", sortable: true, sortValue: (u) => u.joinedAt, cell: (u) => formatDate(u.joinedAt) }]} />
```

### Clickable rows

```tsx
import { DataTable } from "@sableui/react"

<DataTable data={posts} columns={cols} onRowClick={(p) => navigate(`/post/${p.id}`)} rowKey={(p) => p.id} />
```

### Rich status column

```tsx
import { Avatar, Badge, DataTable, Entity } from "@sableui/react"

<DataTable data={deployments} rowKey={(row) => row.id} columns={[{ key: "name", header: "Name", sortable: true }, { key: "status", header: "Status", cell: (row) => <Badge appearance="plain" tone={row.status === "failed" ? "destructive" : row.status === "building" ? "warning" : "success"} dot>{row.statusLabel}</Badge> }, { key: "owner", header: "Owner", cell: (row) => <Entity className="[--entity-px:0] [--entity-py:0]" leading={<Avatar src={row.owner.avatar} alt={row.owner.name} fallback={row.owner.initials} size="sm" />} title={row.owner.name} /> }]} />
```

### In a card, edge to edge

```tsx
import { Card, CardContent, CardHeader, CardTitle, DataTable } from "@sableui/react"

<Card><CardHeader><CardTitle>Deployments</CardTitle></CardHeader><CardContent flush><DataTable data={deployments} rowKey={(row) => row.id} columns={[{ key: "project", header: "Project", sortable: true }, { key: "duration", header: "Duration", align: "end" }]} /></CardContent></Card>
```

### Empty state

```tsx
import { Button, DataTable, EmptyState, Icon } from "@sableui/react"

<DataTable data={[]} columns={[{ key: "name", header: "Name" }, { key: "status", header: "Status" }]} empty={<EmptyState icon={<Icon name="search" />} title="No deployments" description="Try a different filter or create a deployment." action={<Button>Create deployment</Button>} />} />
```
