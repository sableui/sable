import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react"
import { cn } from "../lib/cn"

type Collapse = "sm" | "md" | "lg" | "xl"

export interface SplitPaneProps
	extends Omit<ComponentPropsWithRef<"div">, "children"> {
	/** The leading / larger pane (e.g. the media column). */
	primary: ReactNode
	/** The trailing / supporting pane (e.g. the detail column). */
	secondary: ReactNode
	/**
	 * Breakpoint at/above which the two panes sit side by side; below it they
	 * stack (primary on top). @default "lg"
	 */
	collapseBelow?: Collapse
	/**
	 * Primary:secondary width ratio when side by side, as `"a/b"` fr units.
	 * @default "1/1"  (e.g. "2/1", "3/2")
	 */
	ratio?: string
	/** Gap between panes. Number = rhythm units (×8px); string = raw CSS. Default `--grid-gutter`. */
	gap?: number | string
}

/**
 * Parse an `"a/b"` ratio into primary/secondary `fr` tracks. BOTH sides must be
 * present and a positive finite number; anything else (a bare `"2"`, `"2/"`,
 * `"3/0"`, `"garbage"`) degrades to an even `1fr / 1fr` split — never a
 * half-parsed lopsided result.
 */
function parseRatio(ratio: string): { primary: string; secondary: string } {
	const [a, b] = ratio.split("/")
	const pa = Number(a)
	const pb = Number(b)
	if (!Number.isFinite(pa) || pa <= 0 || !Number.isFinite(pb) || pb <= 0) {
		return { primary: "1fr", secondary: "1fr" }
	}
	return { primary: `${pa}fr`, secondary: `${pb}fr` }
}

function resolveGap(gap: number | string | undefined): string | undefined {
	if (gap === undefined) return undefined
	return typeof gap === "number" ? `calc(var(--rhythm-unit) * ${gap})` : gap
}

/**
 * SplitPane — a responsive two-pane layout. At/above `collapseBelow` the panes
 * sit side by side at `ratio`; below it they stack (primary first). Owns the
 * structural pattern behind list/detail and media/detail pages, so a route stops
 * hand-building a desktop two-column layout plus a separate mobile stack.
 *
 * The breakpoint switch + ratio resolve through the `[data-sable-split]` rules in
 * `styles.css` (inline CSS custom properties), so any `ratio` works.
 *
 * `collapseBelow` is **viewport-relative**, not container-relative: it asks how
 * wide the window is, not how wide this SplitPane is. Dropped inside a narrow
 * column — a sidebar, a modal, one cell of a Grid — it will happily stay
 * side-by-side in 300px because the window is 1440px. The same caveat applies to
 * the breakpoint maps on `Grid cols`, `Columns`, and `Col`. When a block has to
 * adapt to the space it actually occupies, reach for `Grid minItemWidth`, which
 * is intrinsically container-driven and needs no query at all.
 *
 *   <SplitPane collapseBelow="lg" ratio="3/2" primary={<Media />} secondary={<Details />} />
 */
export function SplitPane({
	primary,
	secondary,
	collapseBelow = "lg",
	ratio = "1/1",
	gap,
	className,
	style,
	ref,
	...rest
}: SplitPaneProps) {
	const { primary: p, secondary: s } = parseRatio(ratio)
	const splitGap = resolveGap(gap)
	const mergedStyle = {
		"--split-primary": p,
		"--split-secondary": s,
		...(splitGap ? { "--split-gap": splitGap } : null),
		...style,
	} as CSSProperties
	return (
		<div
			ref={ref}
			data-sable-split
			data-collapse={collapseBelow}
			className={cn(className)}
			style={mergedStyle}
			{...rest}
		>
			<div className="min-w-0">{primary}</div>
			<div className="min-w-0">{secondary}</div>
		</div>
	)
}
SplitPane.displayName = "SplitPane"
