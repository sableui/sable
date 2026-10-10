import type { CSSProperties, HTMLAttributes } from "react"
import { cn } from "../lib/cn"

export interface AspectBoxProps extends HTMLAttributes<HTMLDivElement> {
	/** Width / height ratio. Default 16/9. Reserves space so late media never shifts layout. */
	ratio?: number
}

/** Reserves grid space via aspect-ratio — async/media content loads without layout shift. */
export function AspectBox({
	ratio = 16 / 9,
	className,
	style,
	children,
	...rest
}: AspectBoxProps) {
	const mergedStyle: CSSProperties = {
		aspectRatio: String(ratio),
		...style,
	}
	return (
		<div
			className={cn("relative w-full overflow-hidden", className)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
