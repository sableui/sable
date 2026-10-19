import type { CSSProperties } from "react"
import { cn } from "../lib/cn"

export interface SpacerProps {
	/** Fixed size in rhythm units (×8px; fractions ok). Ignored when `grow`. */
	size?: number
	/** Axis the fixed size applies to. Default "vertical". */
	axis?: "vertical" | "horizontal"
	/** Flex-grow to push siblings apart (fills available space). */
	grow?: boolean
	className?: string
}

/**
 * Explicit space on the rhythm, or a flexible `grow` pusher between siblings.
 *
 * The size is a class reading a CSS variable, never inline style, so a
 * `className` utility resizes or hides it at a breakpoint (`md:h-16`, `max-sm:hidden`).
 */
export function Spacer({ size = 1, axis = "vertical", grow, className }: SpacerProps) {
	const style = grow
		? undefined
		: ({ "--sable-spacer": `calc(var(--rhythm-unit) * ${size})` } as CSSProperties)
	return (
		<div
			aria-hidden
			className={cn(
				grow
					? "flex-1"
					: axis === "vertical"
						? "h-(--sable-spacer) shrink-0"
						: "w-(--sable-spacer) shrink-0",
				className,
			)}
			style={style}
		/>
	)
}
