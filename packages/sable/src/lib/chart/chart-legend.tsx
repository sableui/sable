import { Icon } from "../../icon"
import { cn } from "../cn"

export interface ChartLegendItem {
	key: string
	label: string
	color: string
	icon?: string
}

/**
 * The legend under a chart: one swatch (or icon) and name per series, centred
 * and wrapping. It repeats what the data table already tells assistive tech,
 * so it is hidden from it.
 */
export function ChartLegend({ items, className }: { items: ChartLegendItem[]; className?: string }) {
	return (
		<ul aria-hidden className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5", className)}>
			{items.map((item) => (
				<li key={item.key} className="flex items-center gap-1.5 text-caption text-muted-foreground">
					{item.icon ? (
						<span className="flex shrink-0" style={{ color: item.color }}>
							<Icon name={item.icon} />
						</span>
					) : (
						<span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
					)}
					{item.label}
				</li>
			))}
		</ul>
	)
}
