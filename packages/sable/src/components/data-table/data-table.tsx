"use client";

import { type ReactNode, useMemo, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { Button } from "../button/button"
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../table"

type Align = "start" | "center" | "end"
const ALIGN: Record<Align, string> = {
	start: "text-start",
	center: "text-center",
	end: "text-end",
}

export interface DataTableColumn<Row> {
	/** Stable column id. */
	key: string
	/** Header content. */
	header: ReactNode
	/** Cell renderer; defaults to `row[key]` when omitted. */
	cell?: (row: Row) => ReactNode
	/** Value used to sort; defaults to `row[key]`. Return a string / number / Date. */
	sortValue?: (row: Row) => string | number | Date | null | undefined
	/** Enable click-to-sort on this column. */
	sortable?: boolean
	/** Text alignment for the header + cells. @default "start" */
	align?: Align
	/** Extra classes for this column's header + cells. */
	className?: string
}

export interface DataTableProps<Row> {
	/** Column definitions, left to right. */
	columns: DataTableColumn<Row>[]
	/** The rows. */
	data: Row[]
	/** Stable React key per row. @default the row index */
	rowKey?: (row: Row, index: number) => string | number
	/** Row click handler — makes rows pointer-interactive. */
	onRowClick?: (row: Row) => void
	/** Mark a row visually selected (`data-selected`). */
	isRowSelected?: (row: Row) => boolean
	/** Initial sort. */
	defaultSort?: { key: string; direction: "asc" | "desc" }
	/** Rendered (spanning all columns) when `data` is empty. @default "No results." */
	empty?: ReactNode
	/** Bottom caption. */
	caption?: ReactNode
	className?: string
}

/**
 * DataTable — a data-driven table over the Table primitives: a `columns` def + a
 * `data` array, with built-in client-side sorting (click a `sortable` header to
 * cycle asc → desc → none), optional row click / selection, and an empty state.
 * For server-side data or paging, sort/page the `data` you pass in and pair it
 * with `Pagination`.
 *
 *   <DataTable
 *     data={users}
 *     columns={[
 *       { key: "name", header: "Name", sortable: true },
 *       { key: "role", header: "Role" },
 *       { key: "joined", header: "Joined", sortable: true,
 *         sortValue: (u) => u.joinedAt, cell: (u) => formatDate(u.joinedAt) },
 *     ]}
 *   />
 */
export function DataTable<Row>({
	columns,
	data,
	rowKey,
	onRowClick,
	isRowSelected,
	defaultSort,
	empty = "No results.",
	caption,
	className,
}: DataTableProps<Row>) {
	const [sort, setSort] = useState(defaultSort ?? null)

	function toggleSort(key: string) {
		setSort((prev) => {
			if (prev?.key !== key) return { key, direction: "asc" }
			if (prev.direction === "asc") return { key, direction: "desc" }
			return null
		})
	}

	const rows = useMemo(() => {
		if (!sort) return data
		const col = columns.find((c) => c.key === sort.key)
		if (!col) return data
		const getValue =
			col.sortValue ??
			((row: Row) => (row as Record<string, unknown>)[col.key] as never)
		return [...data].sort((a, b) => {
			const va = getValue(a)
			const vb = getValue(b)
			let c = 0
			if (va == null && vb == null) c = 0
			else if (va == null) c = 1
			else if (vb == null) c = -1
			else if (va < vb) c = -1
			else if (va > vb) c = 1
			return sort.direction === "asc" ? c : -c
		})
	}, [data, sort, columns])

	return (
		<Table className={className}>
			{caption ? <TableCaption>{caption}</TableCaption> : null}
			<TableHeader>
				<TableRow>
					{columns.map((col) => {
						const active = sort?.key === col.key
						return (
							<TableHead
								key={col.key}
								aria-sort={
									active
										? sort.direction === "asc"
											? "ascending"
											: "descending"
										: undefined
								}
								className={cn(col.align && ALIGN[col.align], col.className)}
							>
								{col.sortable ? (
									// The negative inline margin cancels Button's padding so
									// the label stays on the column's text edge; the header's
									// own type and ink win over Button's action tier.
									<Button
										variant="ghost"
										size="xs"
										onClick={() => toggleSort(col.key)}
										className="-mx-2 gap-1 text-label-md text-muted-foreground hover:text-foreground"
									>
										{col.header}
										<Icon
											name={
												active && sort.direction === "desc"
													? "chevron-down"
													: "chevron-up"
											}
											className={cn("text-xs", !active && "opacity-30")}
										/>
									</Button>
								) : (
									col.header
								)}
							</TableHead>
						)
					})}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={columns.length}
							// Plain text gets the breathing room; a composed node (an
							// EmptyState) brings its own, and the cell's would double it.
							className={cn(
								"text-center text-muted-foreground",
								typeof empty === "string" && "py-8",
							)}
						>
							{empty}
						</TableCell>
					</TableRow>
				) : (
					rows.map((row, i) => (
						<TableRow
							key={rowKey ? rowKey(row, i) : i}
							data-selected={isRowSelected?.(row) ? "" : undefined}
							onClick={onRowClick ? () => onRowClick(row) : undefined}
							// A clickable row is also a keyboard stop: Tab reaches it,
							// Enter/Space activate it. Only when the row itself has focus,
							// so a control inside a cell keeps its own keys.
							tabIndex={onRowClick ? 0 : undefined}
							onKeyDown={
								onRowClick
									? (e) => {
											if (e.target !== e.currentTarget) return
											if (e.key !== "Enter" && e.key !== " ") return
											e.preventDefault()
											onRowClick(row)
										}
									: undefined
							}
							className={
								onRowClick
									? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
									: undefined
							}
						>
							{columns.map((col) => (
								<TableCell
									key={col.key}
									className={cn(col.align && ALIGN[col.align], col.className)}
								>
									{col.cell
										? col.cell(row)
										: ((row as Record<string, unknown>)[col.key] as ReactNode)}
								</TableCell>
							))}
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	)
}
DataTable.displayName = "DataTable"
