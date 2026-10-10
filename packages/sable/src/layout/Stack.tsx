import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"

type Align = "start" | "center" | "end" | "stretch"
type Justify = "start" | "center" | "end" | "between" | "around"

const ALIGN: Record<Align, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	stretch: "stretch",
}
const JUSTIFY: Record<Justify, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	between: "space-between",
	around: "space-around",
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

/** Vertical flow on the 8px rhythm. The default container for stacked content. */
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
	const mergedStyle: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: ALIGN[align],
		justifyContent: JUSTIFY[justify],
		gap: resolveGap(gap),
		...style,
	}
	return (
		<div ref={ref} className={cn(className)} style={mergedStyle} {...rest}>
			{children}
		</div>
	)
}
