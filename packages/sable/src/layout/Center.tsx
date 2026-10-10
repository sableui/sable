import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"

const NAMED_MAX: Record<string, string> = {
	prose: "var(--measure-prose)",
	feed: "var(--region-feed)",
	wide: "var(--region-wide)",
	ultrawide: "var(--region-ultrawide)",
}

export interface CenterProps extends ComponentPropsWithRef<"div"> {
	/** Cap width: a named region ("prose" | "feed" | "wide" | "ultrawide") or any raw CSS length. */
	max?: string
}

/** Horizontally center a block, optionally capping its width (commonly "prose"). */
export function Center({ max, className, style, children, ref, ...rest }: CenterProps) {
	const maxWidth = max ? (NAMED_MAX[max] ?? max) : undefined
	const mergedStyle: CSSProperties = {
		marginInline: "auto",
		...(maxWidth ? { maxWidth } : null),
		...style,
	}
	return (
		<div ref={ref} className={cn("w-full", className)} style={mergedStyle} {...rest}>
			{children}
		</div>
	)
}
