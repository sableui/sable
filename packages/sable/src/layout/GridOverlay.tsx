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
 *
 * Positioning, `display` and the inset are classes, never inline style, so a
 * `className` utility overrides them (`max-md:hidden` to draw it on desktop only).
 */
export function GridOverlay({
	columns = 12,
	gap = "var(--grid-gutter)",
	inset = true,
	show = true,
	className,
}: GridOverlayProps) {
	if (!show) return null
	const style = {
		"--sable-overlay-cols": `repeat(${columns}, minmax(0, 1fr))`,
		"--sable-overlay-gap": gap,
	} as CSSProperties
	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 z-(--z-overlay) grid grid-cols-(--sable-overlay-cols) gap-(--sable-overlay-gap)",
				inset && "px-(--page-inset)",
				className,
			)}
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
