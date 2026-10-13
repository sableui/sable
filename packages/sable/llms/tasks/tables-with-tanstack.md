# Task: tables with TanStack Table

`DataTable` is Sable's own table: a column list and a data array, with
client-side sorting, row click, checkbox selection and an empty state, and no
dependency. Use it until the table needs what it doesn't do:

- server-side sorting, filtering or paging over a large data set;
- column visibility, ordering, resizing or pinning;
- grouping, expanding rows, faceted filters;
- thousands of rows that need virtualising.

Then use **TanStack Table** (`@tanstack/react-table`) for the table's logic and
render it with Sable's `Table` parts, so it still looks and behaves like every
other Sable table: the same row hover, selected fill, edge insets in a flush
`Card`, and numeric columns. Sable doesn't depend on TanStack; this is the
pairing it suggests, and any headless table library renders the same way.

## The pairing

TanStack owns state (sorting, selection, pagination); Sable owns markup. Map them
one to one:

| TanStack | Sable |
|---|---|
| `getHeaderGroups()` → header row | `TableHeader` › `TableRow` › `TableHead` |
| `getRowModel().rows` | `TableBody` › `TableRow` › `TableCell` |
| `row.getIsSelected()` | `data-selected` on the `TableRow` (the selected fill) |
| `column.getToggleSortingHandler()` | a ghost `Button size="xs"` in the head, `aria-sort` on the `TableHead` |
| selection column | `Checkbox` per row (named after the row) and in the head (`indeterminate` when some are checked) |
| `getPageCount()`, `setPageIndex()` | `Pagination` (1-based) |

```tsx
import {
	type ColumnDef,
	type RowSelectionState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { Button, Checkbox, Icon, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sableui/react"
import { useState } from "react"

type Ticket = { id: string; subject: string; customer: string; updated: Date }

const columns: ColumnDef<Ticket>[] = [
	{
		id: "select",
		enableSorting: false,
		header: ({ table }) => (
			<Checkbox
				aria-label={`Select all ${table.getRowModel().rows.length} tickets shown`}
				checked={table.getIsAllPageRowsSelected()}
				indeterminate={table.getIsSomePageRowsSelected()}
				onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				aria-label={`Select ${row.original.subject}`}
				checked={row.getIsSelected()}
				onCheckedChange={(checked) => row.toggleSelected(checked)}
			/>
		),
	},
	{ accessorKey: "subject", header: "Subject" },
	{ accessorKey: "customer", header: "Customer" },
	{ accessorKey: "updated", header: "Updated", cell: ({ getValue }) => getValue<Date>().toLocaleDateString() },
]

export function TicketTable({ data }: { data: Ticket[] }) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const table = useReactTable({
		data,
		columns,
		getRowId: (ticket) => ticket.id,
		state: { sorting, rowSelection },
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	})

	return (
		<>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((group) => (
						<TableRow key={group.id}>
							{group.headers.map((header) => {
								const sorted = header.column.getIsSorted()
								const label = flexRender(header.column.columnDef.header, header.getContext())
								return (
									<TableHead
										key={header.id}
										className={header.column.id === "select" ? "w-0" : undefined}
										aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
									>
										{header.column.getCanSort() ? (
											<Button variant="ghost" size="xs" bleed="start" onClick={header.column.getToggleSortingHandler()}>
												{label}
												<Icon name={sorted === "desc" ? "chevron-down" : "chevron-up"} className={sorted ? undefined : "opacity-60"} />
											</Button>
										) : (
											label
										)}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id} data-selected={row.getIsSelected() ? "" : undefined}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id} className={cell.column.id === "select" ? "w-0" : undefined}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			<Pagination
				page={table.getState().pagination.pageIndex + 1}
				total={table.getPageCount()}
				onPageChange={(page) => table.setPageIndex(page - 1)}
			/>
		</>
	)
}
```

Inside a card, put the `Table` in `<CardContent flush>`, as with `DataTable`.
Mark a numeric column with `numeric` on its `TableHead` and `TableCell`s.

## Server-side data

Set `manualSorting`, `manualPagination` (and `manualFiltering`) with
`pageCount` or `rowCount`, and fetch with the table's state as the query key.
In a blank-slate app that is TanStack Query:
`useQuery({ queryKey: ["tickets", sorting, pagination], queryFn })`, passing
`data ?? []` to the table. Show `Skeleton` rows while the first page loads and
keep the previous page on screen while the next one does.

## Selection and bulk actions

Selection belongs to the rows shown: clear `rowSelection` when the filter or
view changes the data set. Above the table, render the bulk actions only while
something is selected, and keep a `role="status"` element mounted from the start
that says "3 of 25 selected", so a screen reader hears each change. The
`DataTable` docs show the same bar (`sable component DataTable --examples`).
