import type { ComponentPropsWithRef, CSSProperties } from "react"
import { cn } from "../lib/cn"
import { type Responsive, responsiveVars } from "./_responsive"

export type { Breakpoint, Responsive } from "./_responsive"

export interface ColumnsProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Number of columns in the track — a number, or a breakpoint map for fewer
	 * columns on small screens (`{ base: 2, md: 6, lg: 12 }`). Default
	 * `--grid-columns` (12).
	 */
	count?: Responsive<number>
	/**
	 * Gap between columns and rows. Number = rhythm units (×8px); string = raw
	 * CSS. Default `--grid-gutter`. The column gap is capped so the `count - 1`
	 * gaps together never exceed 75% of the track's width (see `columnGap`).
	 */
	gap?: number | string
}

export interface ColProps extends ComponentPropsWithRef<"div"> {
	/** Columns to span — a number, or a breakpoint map (`{ base: 12, md: 8, lg: 7 }`). Default 1. */
	span?: Responsive<number>
	/** 1-based column to start at — a number or a breakpoint map. */
	start?: Responsive<number>
}

function resolveGap(gap: number | string | undefined): string {
	if (gap === undefined) return "var(--grid-gutter)"
	if (typeof gap === "number") return `calc(var(--rhythm-unit) * ${gap})`
	return gap
}

/**
 * The column gap, capped so the gaps can never force horizontal overflow.
 *
 * A grid always lays out all `count` tracks, even when every `Col` spans the
 * full row, so `count - 1` gaps are a hard minimum width: 11 × 80px = 880px at
 * `gap={10}`, wider than any phone. Capping each gap at
 * `75% / (count - 1)` keeps all gaps together within three quarters of the
 * container (percent column-gap resolves against the grid's content box),
 * leaving at least a quarter for the tracks. At normal desktop widths the cap
 * sits above any sane gap (a 1200px, 12-column track allows ~82px), so
 * existing layouts render unchanged; it only bites when the container is
 * narrow. `--cols` is the count *as resolved per breakpoint* by the
 * `[data-sable-grid-cols]` cascade in styles.css, so responsive `count` maps
 * get the right cap at every breakpoint; `max(…, 1)` covers `count={1}`,
 * where there is no column gap to cap.
 */
function cappedColumnGap(gap: string): string {
	return `min(${gap}, calc(75% / max(var(--cols, var(--grid-columns)) - 1, 1)))`
}

/**
 * An explicit N-column track (default 12). `count` accepts a breakpoint map so
 * the track itself can thin out on small screens (e.g. 2 → 6 → 12). Pair with
 * `Col` for spans. The track template resolves through the `[data-sable-grid-cols]`
 * rules in `styles.css`, mobile-first.
 *
 * `display` is the `grid` class and the gaps are CSS variables, never inline
 * style, so a `className` utility overrides them at any breakpoint
 * (`hidden md:grid`, `md:gap-x-8`). A bare `gap-*` utility replaces both gaps
 * and with them the column-gap cap, so prefer the `gap` prop unless you mean it.
 */
export function Columns({
	count,
	gap,
	className,
	style,
	children,
	ref,
	...rest
}: ColumnsProps) {
	const resolvedGap = resolveGap(gap)
	const mergedStyle = {
		"--sable-columns-row-gap": resolvedGap,
		"--sable-columns-column-gap": cappedColumnGap(resolvedGap),
		...responsiveVars("--cols", count),
		...style,
	} as CSSProperties
	return (
		<div
			ref={ref}
			data-sable-grid-cols
			className={cn(
				"grid gap-x-(--sable-columns-column-gap) gap-y-(--sable-columns-row-gap)",
				className,
			)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}

/**
 * A cell spanning `span` columns within a `Columns` track. `span` and `start`
 * accept either a number or a breakpoint map for responsive layouts:
 *
 *   <Col span={{ base: 12, md: 8, lg: 7 }} />
 *
 * The per-breakpoint values are emitted as inline CSS custom properties and
 * resolved mobile-first by the `[data-sable-col]` rules in `styles.css`, so any
 * span value works without the consuming app's Tailwind scanning a class.
 */
export function Col({
	span = 1,
	start,
	className,
	style,
	children,
	ref,
	...rest
}: ColProps) {
	const mergedStyle = {
		...responsiveVars("--col-span", span),
		...responsiveVars("--col-start", start),
		...style,
	} as CSSProperties
	return (
		<div
			ref={ref}
			data-sable-col
			className={cn(className)}
			style={mergedStyle}
			{...rest}
		>
			{children}
		</div>
	)
}
