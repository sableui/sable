"use client";

import type { ComponentPropsWithRef } from "react"
import { useCallback, useRef, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { Button } from "../button/button"

export interface ShowMoreProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Collapsed height of the content region, in px. The inner wrapper clips to
	 * this height until expanded. Prefer `collapsedLines`, which keeps its line
	 * count when the type scale or density changes.
	 * @default 96
	 */
	collapsedHeight?: number
	/**
	 * Collapsed height as a number of the content's own lines. Wins over
	 * `collapsedHeight`, and is the one to prefer: it is measured from the
	 * content's line height, so the preview keeps the same number of lines when
	 * the type scale or density changes, where a px height would show fewer.
	 */
	collapsedLines?: number
}

/** The first text-bearing element's line height, in px. */
function lineHeightOf(el: HTMLElement): number {
	const target = (el.firstElementChild as HTMLElement | null) ?? el
	const style = getComputedStyle(target)
	const lh = Number.parseFloat(style.lineHeight)
	if (Number.isFinite(lh)) return lh
	// `line-height: normal` — the UA's ~1.2 of the font size.
	return (Number.parseFloat(style.fontSize) || 16) * 1.2
}

/**
 * ShowMore — a collapsible content region with a bottom fade and a toggle.
 * Clips its children to `collapsedLines` (or `collapsedHeight`) while
 * collapsed, overlays a gradient fade (from-background) so the cut text
 * dissolves, and reveals the full content on toggle. Self-contained state
 * (useState); no Base UI behavior.
 *
 *   <ShowMore collapsedLines={4}>
 *     <p className="text-body-md text-foreground">…long content…</p>
 *   </ShowMore>
 *
 * The toggle button swaps label ("Show more" / "Show less") and chevron
 * direction with the expanded state, and exposes aria-expanded for AT.
 */
export function ShowMore({
	children,
	collapsedHeight = 96,
	collapsedLines,
	className,
	...props
}: ShowMoreProps) {
	const [expanded, setExpanded] = useState(false)
	// The unclipped content box. Observed (not the clipping wrapper, whose
	// height is pinned by max-height) so a reflow from a type or density change
	// is still seen while collapsed.
	const contentRef = useRef<HTMLDivElement>(null)
	// Seed to the collapsed height so it's never 0 — the toggle/fade only appear
	// once a measured height proves the content overflows.
	const [contentHeight, setContentHeight] = useState(collapsedHeight)
	const [linesHeight, setLinesHeight] = useState<number | null>(null)

	// Measure the full content (pre-paint) so max-height animates to a concrete
	// px target — transitioning to `none` snaps because it's not interpolatable.
	const measure = useCallback(() => {
		const el = contentRef.current
		if (!el) return
		setContentHeight(el.offsetHeight)
		setLinesHeight(
			collapsedLines !== undefined ? Math.round(collapsedLines * lineHeightOf(el)) : null,
		)
	}, [collapsedLines])
	useResizeObserver(measure, [contentRef])

	const collapsed = linesHeight ?? collapsedHeight
	// Only a region taller than the collapsed height needs a toggle + fade;
	// short content shows in full with no (no-op) control.
	const overflowing = contentHeight > collapsed
	const maxHeight = expanded ? contentHeight : collapsed

	return (
		<div className={cn("flex flex-col gap-2", className)} {...props}>
			<div className="relative">
				<div
					className="overflow-hidden transition-[max-height] duration-(--motion-duration-slow) ease-decelerate"
					style={{ maxHeight }}
				>
					<div ref={contentRef}>{children}</div>
				</div>
				{/* Mounted only when clipping, so it can fade out as the region expands. */}
				{overflowing && (
					<div
						aria-hidden
						className={cn(
							"pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent motion-interactive",
							expanded && "opacity-0",
						)}
					/>
				)}
			</div>
			{overflowing && (
			<Button
				variant="link"
				size="sm"
				onClick={() => setExpanded((prev) => !prev)}
				aria-expanded={expanded}
				// Flush with the content above: a link-weight toggle, not a padded pill.
				className="self-start px-0"
				iconEnd={
					<Icon
						name="chevron-down"
						className={cn(
							"transition-transform duration-(--motion-duration-fast) ease-standard",
							expanded && "rotate-180",
						)}
					/>
				}
			>
				{expanded ? "Show less" : "Show more"}
			</Button>
			)}
		</div>
	)
}
ShowMore.displayName = "ShowMore"
