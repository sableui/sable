"use client";

import { type ReactNode, useId, useMemo, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { Button } from "../button/button"
import { Checkbox } from "../checkbox"
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
	// End-aligned columns are the numeric ones: tabular figures keep the
	// digits on one grid down the column.
	end: "text-end tabular-nums",
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

export type DataTableRowKey = string | number

/** How one group of rows is labelled and ordered. */
export interface DataTableGroup {
	/** The value `groupBy` returns for the rows in this group. */
	key: string
	/** The group's name in its header row. @default the key */
	label?: ReactNode
	/** A leading glyph for the header row — a status mark, an icon. */
	icon?: ReactNode
	/** Trailing controls in the header row, e.g. an icon Button that adds a row to this group. */
	action?: ReactNode
	/** Whether the group starts open when `expandedGroups` is not passed. @default true */
	defaultExpanded?: boolean
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
	/** Mark a row visually selected (`data-selected`), e.g. the one open in a detail pane. */
	isRowSelected?: (row: Row) => boolean
	/**
	 * The checked rows, by `rowKey`, for bulk actions. With `onSelectedKeysChange`
	 * it adds a checkbox column and a select-all box in the header. Controlled:
	 * when the rows shown change (a filter, another view), set the keys you want
	 * kept — usually none.
	 */
	selectedKeys?: ReadonlySet<DataTableRowKey>
	/** Called with the new set of checked keys. Its presence turns selection on. */
	onSelectedKeysChange?: (keys: Set<DataTableRowKey>) => void
	/** A row checkbox's accessible name. Name the row: `(t) => \`Select ${t.subject}\``. @default "Select row" */
	rowSelectionLabel?: (row: Row) => string
	/** The select-all checkbox's accessible name. @default (count) => `Select all ${count} shown` */
	selectAllLabel?: (count: number) => string
	/** Initial sort. */
	defaultSort?: { key: string; direction: "asc" | "desc" }
	/** Rendered (spanning all columns) when `data` is empty. @default "No results." */
	empty?: ReactNode
	/** Bottom caption. */
	caption?: ReactNode
	/**
	 * Group the rows under header rows, by the key this returns (a status, an
	 * owner, a day). One header for the whole table, so every group shares the
	 * columns; sorting applies within each group.
	 */
	groupBy?: (row: Row) => string
	/**
	 * Order and presentation of the groups, by key. Groups `groupBy` returns
	 * that are not listed follow, in the order their first row appears in `data`.
	 * A listed group with no rows is not shown.
	 */
	groups?: DataTableGroup[]
	/** Whether a group's header row opens and closes it. @default true */
	collapsible?: boolean
	/** The open groups, by key (controlled). Without it each group starts at its `defaultExpanded`. */
	expandedGroups?: ReadonlySet<string>
	/** Called with the new set of open group keys when a group is opened or closed. */
	onExpandedGroupsChange?: (keys: Set<string>) => void
	className?: string
}

/**
 * DataTable — a data-driven table over the Table primitives: a `columns` def + a
 * `data` array, with built-in client-side sorting (click a `sortable` header to
 * cycle asc → desc → none), optional row click, checkbox selection for bulk
 * actions (`selectedKeys` + `onSelectedKeysChange`), rows grouped under
 * collapsible header rows (`groupBy` + `groups`), and an empty state.
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
	selectedKeys,
	onSelectedKeysChange,
	rowSelectionLabel = () => "Select row",
	selectAllLabel = (count) => `Select all ${count} shown`,
	defaultSort,
	empty = "No results.",
	caption,
	groupBy,
	groups,
	collapsible = true,
	expandedGroups,
	onExpandedGroupsChange,
	className,
}: DataTableProps<Row>) {
	const [sort, setSort] = useState(defaultSort ?? null)
	// Uncontrolled, the closed groups are what is held: a group that first
	// appears later (a new status in the data) starts open.
	const [closedGroups, setClosedGroups] = useState<Set<string>>(
		() => new Set((groups ?? []).filter((g) => g.defaultExpanded === false).map((g) => g.key)),
	)
	const uid = useId()

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

	/* The groups in display order, each holding its rows in sort order. A row's
	   index stays its place in `rows`, so rowKey sees the same index grouped
	   or not. */
	const sections = useMemo(() => {
		if (!groupBy) return null
		const byKey = new Map<string, { row: Row; index: number }[]>()
		for (const row of data) {
			const key = groupBy(row)
			if (!byKey.has(key)) byKey.set(key, [])
		}
		rows.forEach((row, index) => byKey.get(groupBy(row))?.push({ row, index }))
		const listed = new Map((groups ?? []).map((g) => [g.key, g]))
		const order = [...listed.keys(), ...[...byKey.keys()].filter((k) => !listed.has(k))]
		return order
			.filter((key) => (byKey.get(key)?.length ?? 0) > 0)
			.map((key) => ({ key, group: listed.get(key), items: byKey.get(key) ?? [] }))
	}, [groupBy, groups, data, rows])

	const isExpanded = (key: string) =>
		!collapsible || (expandedGroups ? expandedGroups.has(key) : !closedGroups.has(key))
	function toggleGroup(key: string) {
		const open = isExpanded(key)
		if (!expandedGroups) {
			setClosedGroups((prev) => {
				const next = new Set(prev)
				if (open) next.add(key)
				else next.delete(key)
				return next
			})
		}
		if (onExpandedGroupsChange) {
			const next = new Set((sections ?? []).map((s) => s.key).filter(isExpanded))
			if (open) next.delete(key)
			else next.add(key)
			onExpandedGroupsChange(next)
		}
	}
	// What select-all acts on: the rows a reader can see, so a closed group's
	// rows are not checked behind its header.
	const shownRows = sections
		? sections.flatMap((s) => (isExpanded(s.key) ? s.items.map((it) => it.row) : []))
		: rows

	const selectable = Boolean(onSelectedKeysChange)
	// A row's key comes from its place in `data`, so it survives a re-sort.
	const dataIndex = selectable ? new Map(data.map((row, i) => [row, i])) : null
	const keyOf = (row: Row): DataTableRowKey => {
		const i = dataIndex?.get(row) ?? 0
		return rowKey ? rowKey(row, i) : i
	}
	const shownKeys = selectable ? shownRows.map(keyOf) : []
	const checkedCount = selectable ? shownKeys.filter((k) => selectedKeys?.has(k)).length : 0
	const allChecked = shownKeys.length > 0 && checkedCount === shownKeys.length
	function setChecked(keys: DataTableRowKey[], checked: boolean) {
		const next = new Set(selectedKeys)
		for (const k of keys) {
			if (checked) next.add(k)
			else next.delete(k)
		}
		onSelectedKeysChange?.(next)
	}

	const span = columns.length + (selectable ? 1 : 0)
	function renderRow(row: Row, i: number, hidden = false) {
		const key = selectable ? keyOf(row) : i
		const checked = selectable && Boolean(selectedKeys?.has(key))
		return (
			<TableRow
				key={rowKey ? rowKey(row, i) : i}
				hidden={hidden || undefined}
				data-selected={checked || isRowSelected?.(row) ? "" : undefined}
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
				{selectable ? (
					// A click on the box checks it; it never opens the row.
					<TableCell className="w-0" onClick={(e) => e.stopPropagation()}>
						<Checkbox
							aria-label={rowSelectionLabel(row)}
							checked={checked}
							onCheckedChange={(next) => setChecked([key], next)}
							className="align-middle"
						/>
					</TableCell>
				) : null}
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
		)
	}

	return (
		<Table className={className}>
			{caption ? <TableCaption>{caption}</TableCaption> : null}
			<TableHeader>
				<TableRow>
					{selectable ? (
						<TableHead className="w-0">
							<Checkbox
								aria-label={selectAllLabel(shownKeys.length)}
								checked={allChecked}
								indeterminate={checkedCount > 0 && !allChecked}
								disabled={shownKeys.length === 0}
								onCheckedChange={(checked) => setChecked(shownKeys, checked)}
								className="align-middle"
							/>
						</TableHead>
					) : null}
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
									// own type and ink win over Button's action tier. In an
									// end-aligned column the chevron leads, so the LABEL is
									// what sits on the numbers' edge.
									<Button
										variant="ghost"
										size="xs"
										onClick={() => toggleSort(col.key)}
										className={cn(
											"-mx-2 gap-1 text-label-md text-muted-foreground hover:text-foreground",
											col.align === "end" && "flex-row-reverse",
										)}
									>
										{col.header}
										{/* One chevron that turns, not two glyphs swapped: flipping
										    asc to desc rotates the mark (motion-interactive lists
										    `rotate`), so the reader sees the same column reverse
										    rather than a different icon land in its place. */}
										<Icon
											name="chevron-up"
											// Resting at 60%: still clearly quieter than the active
											// chevron, but a visible mark (30% fell under 3:1).
											className={cn(
												"text-xs motion-interactive",
												active && sort.direction === "desc" && "rotate-180",
												!active && "opacity-60",
											)}
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
			{rows.length === 0 ? (
				<TableBody>
						<TableRow>
							<TableCell
								colSpan={span}
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
				</TableBody>
			) : sections ? (
				sections.map(({ key, group, items }, n) => {
					const expanded = isExpanded(key)
					// By position, not key: a key with a space would split aria-controls in two.
					const bodyId = `${uid}-group-${n}`
					const name = (
						<>
							{group?.icon}
							<span>{group?.label ?? key}</span>
							<span className="tabular-nums text-muted-foreground">{items.length}</span>
						</>
					)
					return (
						// One tbody per group: a row group to assistive tech, headed by its
						// own header row, so the group rows are never read as data rows.
						<TableBody key={key} id={bodyId} data-group={key}>
							{/* The band is painted by the cell and the row's hover is cancelled:
							    the header row answers through its toggle, not as a row. */}
							<TableRow data-group-header="" className="border-t [tbody>&:hover]:bg-transparent">
								<TableHead scope="rowgroup" colSpan={span} className="h-auto bg-muted/50 py-1 text-foreground">
									<div className="flex min-w-0 items-center justify-between gap-2">
										{collapsible ? (
											<Button
												variant="ghost"
												size="xs"
												bleed="start"
												aria-expanded={expanded}
												aria-controls={bodyId}
												onClick={() => toggleGroup(key)}
												className="gap-2"
											>
												{/* Points down open and right closed, and turns between the
												    two (motion-interactive lists `rotate`), so the group reads
												    as folding rather than a glyph being swapped. */}
												<Icon
													name="chevron-down"
													className={cn(
														"text-xs text-muted-foreground motion-interactive",
														// Closed, it points along the reading direction.
														!expanded && "-rotate-90 rtl:rotate-90",
													)}
												/>
												{name}
											</Button>
										) : (
											<span className="flex min-w-0 items-center gap-2">{name}</span>
										)}
										{group?.action ? <div className="flex shrink-0 items-center gap-1">{group.action}</div> : null}
									</div>
								</TableHead>
							</TableRow>
							{items.map(({ row, index }) => renderRow(row, index, !expanded))}
						</TableBody>
					)
				})
			) : (
				<TableBody>{rows.map((row, i) => renderRow(row, i))}</TableBody>
			)}
		</Table>
	)
}
DataTable.displayName = "DataTable"
