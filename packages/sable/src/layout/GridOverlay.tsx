import type { CSSProperties } from "react"
import { cn } from "../lib/cn"

export interface GridOverlayProps {
	/** Number of column bands. Default `--grid-columns` (12). */
	columns?: number
	/** Gap between bands. Default `--grid-gutter`. */
	gap?: string
	/** Align bands to the fluid page inset. Default true. */
	inset?: boolean
	/** Toggle visibility. Default true. */
	show?: boolean
	className?: string
}

/**
 * Dev/docs structure visualizer — overlays the column grid so the layout's
 * skeleton is legible. Place inside a `position: relative` container.
 */
export function GridOverlay({
	columns = 12,
	gap = "var(--grid-gutter)",
	inset = true,
	show = true,
	className,
}: GridOverlayProps) {
	if (!show) return null
	const style: CSSProperties = {
		position: "absolute",
		inset: 0,
		display: "grid",
		gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
		gap,
		paddingInline: inset ? "var(--page-inset)" : undefined,
	}
	return (
		<div
			aria-hidden
			className={cn("pointer-events-none z-(--z-overlay)", className)}
			style={style}
		>
			{Array.from({ length: columns }, (_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: static, fixed-length overlay bands
					key={i}
					style={{
						background:
							"color-mix(in oklab, var(--highlight) 9%, transparent)",
						borderInline:
							"1px solid color-mix(in oklab, var(--highlight) 22%, transparent)",
					}}
				/>
			))}
		</div>
	)
}
