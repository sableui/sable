import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"

/**
 * Styled native table. Wraps the <table> in a horizontally scrollable frame so
 * wide tables stay responsive without breaking layout. Caption renders at the
 * bottom. No rounding on cells; rows are separated by hairline borders.
 */
export function Table({ className, ...props }: ComponentPropsWithRef<"table">) {
	return (
		// Thin scrollbar so a wide table's horizontal bar reads as part of the
		// table rather than as chrome, and contained overscroll so swiping past
		// the last column does not trigger the browser's back gesture.
		<div className="w-full overflow-x-auto overscroll-x-contain scrollbar-quiet">
			<table
				className={cn("w-full caption-bottom text-body-sm", className)}
				{...props}
			/>
		</div>
	)
}
Table.displayName = "Table"

export function TableHeader({
	className,
	...props
}: ComponentPropsWithRef<"thead">) {
	return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}
TableHeader.displayName = "TableHeader"

export function TableBody({
	className,
	...props
}: ComponentPropsWithRef<"tbody">) {
	return (
		<tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
	)
}
TableBody.displayName = "TableBody"

export function TableFooter({
	className,
	...props
}: ComponentPropsWithRef<"tfoot">) {
	return (
		<tfoot
			className={cn(
				"border-t border-border bg-muted/50 text-label-md [&>tr]:last:border-b-0",
				className,
			)}
			{...props}
		/>
	)
}
TableFooter.displayName = "TableFooter"

/**
 * A table row. Body rows hover-lift; header and footer rows stay still, since
 * nothing there responds to a click on the row. Mark the selected row with
 * `data-selected`.
 *
 * The selected fill is painted by the cells, each spilling 1px into the next
 * (a box-shadow, so layout does not move). A row's own background is painted
 * per cell at fractional widths, and a dogfood build saw 1px dark seams at
 * cell boundaries on the selected row, the one users look at most. The spill
 * covers any such gap; the fill is opaque in every theme, so the overlap does
 * not show. Hover stays on the row: it is translucent, where an overlap would.
 */
export function TableRow({ className, ...props }: ComponentPropsWithRef<"tr">) {
	return (
		<tr
			className={cn(
				"border-b border-border motion-interactive [tbody>&:hover]:bg-muted/50",
				"*:motion-interactive data-[selected]:*:bg-muted data-[selected]:*:shadow-[1px_0_0_var(--muted)]",
				className,
			)}
			{...props}
		/>
	)
}
TableRow.displayName = "TableRow"

/**
 * A numeric column: end-aligned so the place values line up, with tabular
 * figures so every digit is the same width. Put it on the header and the cells
 * of the column alike, so the label sits over the numbers' edge.
 */
const NUMERIC = "text-end tabular-nums"

export interface TableHeadProps extends ComponentPropsWithRef<"th"> {
	/** A numeric column — end-aligned, tabular figures. Set it on the column's cells too. */
	numeric?: boolean
}

/** A column header cell. */
export function TableHead({ className, numeric = false, ...props }: TableHeadProps) {
	return (
		<th
			className={cn(
				"h-10 px-3 text-start align-middle text-label-md text-muted-foreground first:ps-[var(--table-edge-px,--spacing(3))] last:pe-[var(--table-edge-px,--spacing(3))]",
				numeric && NUMERIC,
				className,
			)}
			{...props}
		/>
	)
}
TableHead.displayName = "TableHead"

export interface TableCellProps extends ComponentPropsWithRef<"td"> {
	/** A numeric cell — end-aligned, tabular figures. Match the column's header. */
	numeric?: boolean
}

/** A body cell. */
export function TableCell({ className, numeric = false, ...props }: TableCellProps) {
	return (
		<td
			className={cn(
				"px-3 py-2.5 align-middle first:ps-[var(--table-edge-px,--spacing(3))] last:pe-[var(--table-edge-px,--spacing(3))]",
				numeric && NUMERIC,
				className,
			)}
			{...props}
		/>
	)
}
TableCell.displayName = "TableCell"

/**
 * A bottom caption describing the table. It is the table's last band, so it is
 * built like one: a hairline above it closes off the last row (TableBody drops
 * that row's own border), it sits on the cells' text edge (`--table-edge-px`,
 * so it lines up inside a flush Card too), and it has room below it rather
 * than touching whatever contains the table. Start-aligned, not the browser's
 * centred default — it reads with the cells, not as a title under them.
 */
export function TableCaption({
	className,
	...props
}: ComponentPropsWithRef<"caption">) {
	return (
		<caption
			className={cn(
				"border-t border-border py-3 ps-[var(--table-edge-px,--spacing(3))] pe-[var(--table-edge-px,--spacing(3))] text-start text-caption text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}
TableCaption.displayName = "TableCaption"
