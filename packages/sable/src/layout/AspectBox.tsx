import type { CSSProperties, HTMLAttributes } from "react"
import { cn } from "../lib/cn"

export interface AspectBoxProps extends HTMLAttributes<HTMLDivElement> {
	/** Width / height ratio. Default 16/9. Reserves space so late media never shifts layout. */
	ratio?: number
}

/**
 * Reserves grid space via aspect-ratio — async/media content loads without layout shift.
 *
 * The ratio is a class reading a CSS variable (`aspect-(--sable-aspect)`), never
 * inline style, so a `className` utility reshapes it at a breakpoint
 * (`md:aspect-video`).
 */
export function AspectBox({
	ratio = 16 / 9,
	className,
	style,
	children,
	...rest
}: AspectBoxProps) {
	const mergedStyle = { "--sable-aspect": String(ratio), ...style } as CSSProperties
	return (
		<div
			className={cn("relative aspect-(--sable-aspect) w-full overflow-hidden", className)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
