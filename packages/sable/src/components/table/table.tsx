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

/** A table row. Hover-lifts; mark the selected row with `data-selected`. */
export function TableRow({ className, ...props }: ComponentPropsWithRef<"tr">) {
	return (
		<tr
			className={cn(
				"border-b border-border motion-interactive hover:bg-muted/50 data-[selected]:bg-muted",
				className,
			)}
			{...props}
		/>
	)
}
TableRow.displayName = "TableRow"

/** A column header cell. */
export function TableHead({ className, ...props }: ComponentPropsWithRef<"th">) {
	return (
		<th
			className={cn(
				"h-10 px-3 text-start align-middle text-label-md text-muted-foreground first:ps-[var(--table-edge-px,--spacing(3))] last:pe-[var(--table-edge-px,--spacing(3))]",
				className,
			)}
			{...props}
		/>
	)
}
TableHead.displayName = "TableHead"

/** A body cell. */
export function TableCell({ className, ...props }: ComponentPropsWithRef<"td">) {
	return (
		<td className={cn("px-3 py-2.5 align-middle first:ps-[var(--table-edge-px,--spacing(3))] last:pe-[var(--table-edge-px,--spacing(3))]", className)} {...props} />
	)
}
TableCell.displayName = "TableCell"

/** A bottom caption describing the table. */
export function TableCaption({
	className,
	...props
}: ComponentPropsWithRef<"caption">) {
	return (
		<caption
			className={cn("mt-4 text-caption text-muted-foreground", className)}
			{...props}
		/>
	)
}
TableCaption.displayName = "TableCaption"
