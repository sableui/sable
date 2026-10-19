import type { ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../cn"
import type { ChartTooltipIndicator } from "./types"

export interface ChartTooltipRow {
	key: string
	label: string
	value: string
	color: string
	icon?: string
}

/**
 * The tooltip card every Sable chart draws: an optional heading, one row per
 * series (marker, name, value), and an optional total. Values are mono with
 * tabular figures so a column of them aligns digit for digit.
 */
export function ChartTooltipContent({
	label,
	rows,
	indicator = "dot",
	total,
	className,
}: {
	label?: ReactNode
	rows: ChartTooltipRow[]
	indicator?: ChartTooltipIndicator
	total?: string
	className?: string
}) {
	return (
		<div
			className={cn(
				"grid min-w-32 gap-1.5 rounded-md border border-border-floating bg-popover px-2.5 py-1.5 text-caption text-popover-foreground shadow-md",
				className,
			)}
		>
			{label != null ? <div className="text-label-sm">{label}</div> : null}
			{/* No rows: a caller's own content in the label slot, on the same card. */}
			{rows.length || total != null ? <div className="grid gap-1">
				{rows.map((row) => (
					<div key={row.key} className={cn("flex items-center gap-2", indicator === "line" || indicator === "dashed" ? "items-stretch" : "")}>
						{row.icon ? (
							<Icon name={row.icon} className="shrink-0 text-muted-foreground" />
						) : indicator === "dot" ? (
							<span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ background: row.color }} />
						) : indicator === "line" ? (
							<span aria-hidden className="w-1 shrink-0 rounded-full" style={{ background: row.color }} />
						) : indicator === "dashed" ? (
							<span aria-hidden className="w-0 shrink-0 border-[1.5px] border-dashed" style={{ borderColor: row.color }} />
						) : null}
						<span className="flex-1 text-muted-foreground">{row.label}</span>
						<span className="ms-3 font-mono tabular-nums text-foreground">{row.value}</span>
					</div>
				))}
				{total != null ? (
					<div className="mt-0.5 flex items-center gap-2 border-t border-border pt-1.5">
						<span className="flex-1 text-label-sm">Total</span>
						<span className="ms-3 font-mono tabular-nums text-foreground">{total}</span>
					</div>
				) : null}
			</div> : null}
		</div>
	)
}
