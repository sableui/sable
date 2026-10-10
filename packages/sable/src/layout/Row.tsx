import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"

type Align = "start" | "center" | "end" | "stretch" | "baseline"
type Justify = "start" | "center" | "end" | "between" | "around"

const ALIGN: Record<Align, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	stretch: "stretch",
	baseline: "baseline",
}
const JUSTIFY: Record<Justify, string> = {
	start: "flex-start",
	center: "center",
	end: "flex-end",
	between: "space-between",
	around: "space-around",
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

/** Horizontal flow. Inline rows of controls, toolbars, action clusters. */
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
	const mergedStyle: CSSProperties = {
		display: "flex",
		flexDirection: "row",
		alignItems: ALIGN[align],
		justifyContent: JUSTIFY[justify],
		flexWrap: wrap ? "wrap" : "nowrap",
		gap: resolveGap(gap),
		...style,
	}
	return (
		<div ref={ref} className={cn(className)} style={mergedStyle} {...rest}>
			{children}
		</div>
	)
}
