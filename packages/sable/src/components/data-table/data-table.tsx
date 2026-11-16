"use client";

import { type ComponentPropsWithRef, type ReactNode, useId, useMemo, useState } from "react"
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

/** A column and a direction. `null` means unsorted (the order of `data`). */
export type DataTableSort = { key: string; direction: "asc" | "desc" }

export interface DataTableProps<Row> extends Omit<ComponentPropsWithRef<"table">, "children"> {
	/** Column definitions, left to right. */
	columns: DataTableColumn<Row>[]
	/** The rows. */
	data: Row[]
	/**
	 * Stable key per row, for React and for selection. `index` is always the
	 * row's place in `data`, never its sorted or grouped position.
	 * @default the row's index in `data`
	 */
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
	/** Initial sort, uncontrolled. */
	defaultSort?: DataTableSort
	/**
	 * The sort, controlled. Pass `null` for unsorted. A header click calls
	 * `onSortChange` with the next step of asc → desc → none.
	 */
	sort?: DataTableSort | null
	/** Called with the next sort when a `sortable` header is clicked. */
	onSortChange?: (sort: DataTableSort | null) => void
	/**
	 * Skip the local sort: `data` already arrives in `sort` order, from a server
	 * that sorts and pages. The headers still show and report the sort. Without
	 * this, a sortable header on server-paged rows reorders only the page shown.
	 */
	manualSorting?: boolean
	/**
	 * The locale strings are compared in (a BCP 47 tag). Comparison is
	 * case-insensitive, ignores accents, and orders digits by value ("file2"
	 * before "file10"). @default the reader's locale
	 */
	locale?: string
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
}

/** Order two sort values: nulls last, strings by the collator, the rest by value. */
function compareValues(a: unknown, b: unknown, collator: Intl.Collator): number {
	if (a == null && b == null) return 0
	if (a == null) return 1
	if (b == null) return -1
	if (typeof a === "string" && typeof b === "string") return collator.compare(a, b)
	const va = a instanceof Date ? a.getTime() : (a as number)
	const vb = b instanceof Date ? b.getTime() : (b as number)
	return va < vb ? -1 : va > vb ? 1 : 0
}

/**
 * DataTable — a data-driven table over the Table primitives: a `columns` def + a
 * `data` array, with built-in client-side sorting (click a `sortable` header to
 * cycle asc → desc → none), optional row click, checkbox selection for bulk
 * actions (`selectedKeys` + `onSelectedKeysChange`), rows grouped under
 * collapsible header rows (`groupBy` + `groups`), and an empty state.
 * For server-side data or paging, control the sort (`sort` + `onSortChange`),
 * set `manualSorting`, pass the page the server returned, and pair it with
 * `Pagination`.
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
	sort: sortProp,
	onSortChange,
	manualSorting = false,
	locale,
	empty = "No results.",
	caption,
	groupBy,
	groups,
	collapsible = true,
	expandedGroups,
	onExpandedGroupsChange,
	className,
	...props
}: DataTableProps<Row>) {
	const [sortState, setSortState] = useState<DataTableSort | null>(defaultSort ?? null)
	const sort = sortProp !== undefined ? sortProp : sortState
	// Uncontrolled, the closed groups are what is held: a group that first
	// appears later (a new status in the data) starts open.
	const [closedGroups, setClosedGroups] = useState<Set<string>>(
		() => new Set((groups ?? []).filter((g) => g.defaultExpanded === false).map((g) => g.key)),
	)
	const uid = useId()
	// `<`/`>` on strings is code-point order: "Zoe" before "adam", "file10"
	// before "file2", accented letters after "z". A collator orders them the
	// way a reader does.
	const collator = useMemo(
		() => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }),
		[locale],
	)

	function toggleSort(key: string) {
		const next: DataTableSort | null =
			sort?.key !== key
				? { key, direction: "asc" }
				: sort.direction === "asc"
					? { key, direction: "desc" }
					: null
		if (sortProp === undefined) setSortState(next)
		onSortChange?.(next)
	}

	/* Each row travels with its index in `data`, so rowKey sees the same index
	   for the React key and the selection key, sorted, grouped or not. */
	const rows = useMemo(() => {
		const entries = data.map((row, index) => ({ row, index }))
		if (!sort || manualSorting) return entries
		const col = columns.find((c) => c.key === sort.key)
		if (!col) return entries
		const getValue =
			col.sortValue ??
			((row: Row) => (row as Record<string, unknown>)[col.key])
		return entries.sort((a, b) => {
			const c = compareValues(getValue(a.row), getValue(b.row), collator)
			// Ties keep the order of `data`.
			return (sort.direction === "asc" ? c : -c) || a.index - b.index
		})
	}, [data, sort, columns, manualSorting, collator])

	/* The groups in display order, each holding its rows in sort order. */
	const sections = useMemo(() => {
		if (!groupBy) return null
		const byKey = new Map<string, { row: Row; index: number }[]>()
		for (const row of data) {
			const key = groupBy(row)
			if (!byKey.has(key)) byKey.set(key, [])
		}
		for (const entry of rows) byKey.get(groupBy(entry.row))?.push(entry)
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
		? sections.flatMap((s) => (isExpanded(s.key) ? s.items : []))
		: rows

	const selectable = Boolean(onSelectedKeysChange)
	// A row's key comes from its place in `data`, so it survives a re-sort, and
	// the React key and the selection key are the same value.
	const keyOf = (row: Row, index: number): DataTableRowKey => (rowKey ? rowKey(row, index) : index)
	const shownKeys = selectable ? shownRows.map((entry) => keyOf(entry.row, entry.index)) : []
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
	function renderRow(row: Row, index: number, hidden = false) {
		const key = keyOf(row, index)
		const checked = selectable && Boolean(selectedKeys?.has(key))
		return (
			<TableRow
				key={key}
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
		<Table className={className} {...props}>
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
							// The sort control is TableHead's own `sortable` part: one
							// header button for a hand-built Table and for this one.
							<TableHead
								key={col.key}
								numeric={col.align === "end"}
								sortable={col.sortable}
								sortDirection={active ? sort.direction : null}
								onSort={() => toggleSort(col.key)}
								className={cn(col.align && col.align !== "end" && ALIGN[col.align], col.className)}
							>
								{col.header}
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
				<TableBody>{rows.map(({ row, index }) => renderRow(row, index))}</TableBody>
			)}
		</Table>
	)
}
DataTable.displayName = "DataTable"
