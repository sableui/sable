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

/**
 * Horizontally center a block, optionally capping its width (commonly "prose").
 *
 * The centering and the cap are classes (`mx-auto`, `max-w-(--sable-center-max)`),
 * never inline style, so a `className` utility overrides them at any breakpoint.
 */
export function Center({ max, className, style, children, ref, ...rest }: CenterProps) {
	const maxWidth = max ? (NAMED_MAX[max] ?? max) : undefined
	const mergedStyle = {
		...(maxWidth ? { "--sable-center-max": maxWidth } : null),
		...style,
	} as CSSProperties
	return (
		<div
			ref={ref}
			// The cap class only with a cap: the variable inherits, so a bare Center
			// inside a capped one would otherwise pick up its ancestor's width.
			className={cn("mx-auto w-full", maxWidth && "max-w-(--sable-center-max)", className)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
