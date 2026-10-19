import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"

type Align = "start" | "center" | "end" | "stretch" | "baseline"
type Justify = "start" | "center" | "end" | "between" | "around"

// Classes, not inline style: an inline `display` or `align-items` beats every
// utility, so `<Row className="hidden md:flex">` or `max-md:flex-col` silently
// did nothing. As classes they go through cn(), and a caller's utility wins.
const ALIGN: Record<Align, string> = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
	baseline: "items-baseline",
}
const JUSTIFY: Record<Justify, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
}

export interface RowProps extends ComponentPropsWithRef<"div"> {
	/** Horizontal gap. Number = rhythm units (×8px; fractions ok); string = raw CSS. Default 2 (16px). */
	gap?: number | string
	align?: Align
	justify?: Justify
	wrap?: boolean
}

function resolveGap(gap: number | string): string {
	return typeof gap === "number" ? `calc(var(--rhythm-unit) * ${gap})` : gap
}

/**
 * Horizontal flow. Inline rows of controls, toolbars, action clusters.
 *
 * Layout is carried by classes (`flex flex-row items-* justify-*`) and the gap
 * by a CSS variable, so any utility in `className` overrides a prop, at any
 * breakpoint: `hidden md:flex`, `max-md:flex-col`, `md:gap-6`.
 */
export function Row({
	gap = 2,
	align = "center",
	justify = "start",
	wrap = false,
	className,
	style,
	children,
	ref,
	...rest
}: RowProps) {
	const mergedStyle = { "--sable-row-gap": resolveGap(gap), ...style } as CSSProperties
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-row gap-(--sable-row-gap)",
				ALIGN[align],
				JUSTIFY[justify],
				wrap ? "flex-wrap" : "flex-nowrap",
				className,
			)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
