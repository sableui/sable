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
	 * Make cells "breathe": as many columns of at least `minItemWidth` as fit,
	 * sharing the leftover space. The grid grows/wraps responsively without
	 * breakpoints. e.g. "16rem".
	 */
	minItemWidth?: string
	/**
	 * What a `minItemWidth` grid does with columns it has no items for — the
	 * difference only shows when there are fewer items than fit one row.
	 *
	 * - `"fill"` (default) — `auto-fill`: the row keeps every column it has room
	 *   for, so items keep their size whatever their count. One search result is
	 *   one cover wide, not a banner. Right for collections: results, shelves,
	 *   galleries, anything whose count is data.
	 * - `"fit"` — `auto-fit`: empty columns collapse and the items stretch to
	 *   share the row. Right only for a fixed set designed to span it — three
	 *   KPI cards, a row of plan tiers.
	 */
	track?: "fill" | "fit"
	/**
	 * Gap between cells. Number = rhythm units (×8px); `[row, column]` = two
	 * rhythm counts, for a gallery whose rows want more air than its columns;
	 * string = raw CSS. Default `--grid-gutter`.
	 */
	gap?: number | readonly [row: number, column: number] | string
}

function resolveGap(gap: GridProps["gap"]): string {
	if (gap === undefined) return "var(--grid-gutter)"
	if (typeof gap === "number") return `calc(var(--rhythm-unit) * ${gap})`
	if (typeof gap === "string") return gap
	return `calc(var(--rhythm-unit) * ${gap[0]}) calc(var(--rhythm-unit) * ${gap[1]})`
}

/**
 * CSS Grid layout primitive. Three modes: a fixed `cols` count, a responsive
 * `cols` breakpoint map (fewer columns on small screens), or `minItemWidth`
 * cells that breathe with no breakpoints at all (`track` decides whether a
 * sparse row keeps its empty columns or stretches its items across them).
 */
export function Grid({
	cols = 12,
	minItemWidth,
	track = "fill",
	gap,
	className,
	style,
	children,
	ref,
	...rest
}: GridProps) {
	// Breathing mode: cells reflow responsively with no breakpoints. auto-fill
	// by default, because with auto-fit a lone item's empty neighbours collapse
	// and it stretches across the whole row — one search result rendered as a
	// full-width cover.
	if (minItemWidth) {
		const mergedStyle: CSSProperties = {
			display: "grid",
			gridTemplateColumns: `repeat(${track === "fit" ? "auto-fit" : "auto-fill"}, minmax(min(${minItemWidth}, 100%), 1fr))`,
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
