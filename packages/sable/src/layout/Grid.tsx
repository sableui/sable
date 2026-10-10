import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"
import { type Responsive, responsiveVars } from "./_responsive"

export interface GridProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Fixed column count — a number, or a breakpoint map (`{ base: 2, md: 4, lg: 6 }`)
	 * for fewer columns on small screens. Ignored when `minItemWidth` is set.
	 * Default 12.
	 */
	cols?: Responsive<number>
	/**
	 * Make cells "breathe": `repeat(auto-fit, minmax(minItemWidth, 1fr))`.
	 * The grid grows/wraps responsively without breakpoints. e.g. "16rem".
	 */
	minItemWidth?: string
	/** Gap between cells. Number = rhythm units (×8px); string = raw CSS. Default `--grid-gutter`. */
	gap?: number | string
}

function resolveGap(gap: number | string | undefined): string {
	if (gap === undefined) return "var(--grid-gutter)"
	if (typeof gap === "number") return `calc(var(--rhythm-unit) * ${gap})`
	return gap
}

/**
 * CSS Grid layout primitive. Three modes: a fixed `cols` count, a responsive
 * `cols` breakpoint map (fewer columns on small screens), or `minItemWidth`
 * auto-fit cells that breathe with no breakpoints at all.
 */
export function Grid({
	cols = 12,
	minItemWidth,
	gap,
	className,
	style,
	children,
	ref,
	...rest
}: GridProps) {
	// Auto-fit mode: cells breathe responsively with no breakpoints.
	if (minItemWidth) {
		const mergedStyle: CSSProperties = {
			display: "grid",
			gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`,
			gap: resolveGap(gap),
			...style,
		}
		return (
			<div ref={ref} className={cn(className)} style={mergedStyle} {...rest}>
				{children}
			</div>
		)
	}

	// Fixed / responsive column count — the track resolves through the
	// [data-sable-grid-cols] cascade in styles.css.
	const mergedStyle = {
		gap: resolveGap(gap),
		...responsiveVars("--cols", cols),
		...style,
	} as CSSProperties
	return (
		<div
			ref={ref}
			data-sable-grid-cols
			className={cn(className)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
