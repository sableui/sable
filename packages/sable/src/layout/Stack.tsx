import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"

type Align = "start" | "center" | "end" | "stretch"
type Justify = "start" | "center" | "end" | "between" | "around"

// Classes, not inline style: an inline `display` beats every utility, so
// `<Stack className="max-lg:hidden">` silently did nothing. See Row.
const ALIGN: Record<Align, string> = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
}
const JUSTIFY: Record<Justify, string> = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
	around: "justify-around",
}

export interface StackProps extends ComponentPropsWithRef<"div"> {
	/** Vertical gap. Number = rhythm units (×8px; fractions ok); string = raw CSS. Default 2 (16px). */
	gap?: number | string
	align?: Align
	justify?: Justify
}

function resolveGap(gap: number | string): string {
	return typeof gap === "number" ? `calc(var(--rhythm-unit) * ${gap})` : gap
}

/**
 * Vertical flow on the 8px rhythm. The default container for stacked content.
 *
 * Layout is carried by classes (`flex flex-col items-* justify-*`) and the gap
 * by a CSS variable, so any utility in `className` overrides a prop, at any
 * breakpoint: `max-lg:hidden`, `md:flex-row`, `md:gap-8`.
 */
export function Stack({
	gap = 2,
	align = "stretch",
	justify = "start",
	className,
	style,
	children,
	ref,
	...rest
}: StackProps) {
	const mergedStyle = { "--sable-stack-gap": resolveGap(gap), ...style } as CSSProperties
	return (
		<div
			ref={ref}
			className={cn(
				"flex flex-col gap-(--sable-stack-gap)",
				ALIGN[align],
				JUSTIFY[justify],
				className,
			)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
