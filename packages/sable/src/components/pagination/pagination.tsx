"use client";

import type { ComponentPropsWithRef, MouseEvent, ReactElement } from "react"
import { cn } from "../../lib/cn"
import { Button } from "../button/button"
import { Icon } from "../../icon/Icon"

export interface PaginationProps
	extends Omit<ComponentPropsWithRef<"nav">, "onChange"> {
	/** The active page (1-based). */
	page: number
	/** Total number of pages. */
	total: number
	/**
	 * Called with the next page when a control is activated. Optional when
	 * `pageLink` is set and the URL is the page state.
	 */
	onPageChange?: (page: number) => void
	/**
	 * Make every page control a real link: return the element to render for a
	 * page, `(page) => <a href={`?page=${page}`} />` or a router's
	 * `(page) => <Link to={`?page=${page}`} />`. Links are crawlable and open
	 * in a new tab; without this the controls are buttons for client-only paging.
	 * Previous/next at the bounds stay disabled buttons, never a link to nowhere.
	 */
	pageLink?: (page: number) => ReactElement
	/**
	 * How many page buttons to show on each side of the current page before the
	 * list collapses into ellipses. First and last pages are always shown.
	 * @default 1
	 */
	siblingCount?: number
	/** Accessible label for the surrounding nav. @default "Pagination" */
	label?: string
}

const ELLIPSIS = "ellipsis" as const
type PageItem = number | typeof ELLIPSIS

/**
 * Build the sequence of page items to render. Always keeps the first and last
 * page plus a window of `siblingCount` on each side of the current page,
 * inserting an "ellipsis" marker wherever a run is skipped. When the full range
 * fits without any gaps, every page is returned and no ellipsis appears.
 *
 * Once it collapses, it ALWAYS returns `siblingCount * 2 + 5` items: near
 * either end the run extends toward the middle instead of shrinking, so the
 * row keeps one width and the arrows never move under the pointer as you page.
 */
export function buildRange(
	page: number,
	total: number,
	siblingCount: number,
): PageItem[] {
	// One slot for each boundary, the current page, its two sibling runs, and
	// the two possible ellipses. If everything fits, just list every page.
	const totalSlots = siblingCount * 2 + 5
	if (total <= totalSlots) {
		return Array.from({ length: total }, (_, i) => i + 1)
	}

	const range = (from: number, to: number) =>
		Array.from({ length: to - from + 1 }, (_, i) => from + i)

	const left = Math.max(page - siblingCount, 1)
	const right = Math.min(page + siblingCount, total)
	const showLeftEllipsis = left > 2
	const showRightEllipsis = right < total - 1
	// The run at an end when only the far side collapses: every slot except the
	// far boundary and its ellipsis.
	const endRun = totalSlots - 2

	if (!showLeftEllipsis) {
		return [...range(1, endRun), ELLIPSIS, total]
	}
	if (!showRightEllipsis) {
		return [1, ELLIPSIS, ...range(total - endRun + 1, total)]
	}
	return [1, ELLIPSIS, ...range(left, right), ELLIPSIS, total]
}

/**
 * Pagination — page navigation built from our own Button + Icon. Renders a
 * <nav aria-label="Pagination"> with prev/next icon buttons (disabled at the
 * bounds) and numbered page buttons. The current page is a `secondary` Button
 * marked aria-current="page"; the rest are `ghost`. When there are more pages
 * than fit, the list collapses to the first, last, current, and a window of
 * `siblingCount` neighbours, with an ellipsis bridging each skipped run.
 *
 *   const [page, setPage] = useState(1)
 *   <Pagination page={page} total={10} onPageChange={setPage} />
 */
export function Pagination({
	page,
	total,
	onPageChange,
	pageLink,
	siblingCount = 1,
	label = "Pagination",
	className,
	ref,
	...props
}: PaginationProps) {
	const safeTotal = Math.max(total, 1)
	const current = Math.min(Math.max(page, 1), safeTotal)
	const items = buildRange(current, safeTotal, siblingCount)

	const goTo = (next: number, event: MouseEvent) => {
		if (next < 1 || next > safeTotal || next === current) return
		// A modified click on a page link opens it elsewhere (new tab, window,
		// download); the page in front of the reader stays where it is.
		if (pageLink && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
		onPageChange?.(next)
	}
	// A link where one leads somewhere; a disabled button at the bounds.
	const linkTo = (next: number) =>
		pageLink && next >= 1 && next <= safeTotal ? pageLink(next) : undefined

	return (
		<nav
			ref={ref}
			aria-label={label}
			className={cn("flex items-center gap-1", className)}
			{...props}
		>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Previous page"
				disabled={current <= 1}
				render={linkTo(current - 1)}
				onClick={(event) => goTo(current - 1, event)}
			>
				<Icon name="chevron-left" className="text-base" />
			</Button>

			<ul className="flex items-center gap-1">
				{items.map((item, index) =>
					item === ELLIPSIS ? (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: ellipsis slots are positional and stable
							key={`ellipsis-${index}`}
							aria-hidden="true"
							// Sized from the ladder, not a literal: this cell sits in a row of
							// ladder-sized page buttons, so it has to shrink with them.
							className="flex h-(--control-sm) w-(--control-sm) items-center justify-center text-muted-foreground"
						>
							<Icon name="ellipsis" className="text-base" />
						</li>
					) : (
						<li key={item}>
							<Button
								variant={item === current ? "secondary" : "ghost"}
								size="icon-sm"
								// Square for one or two digits; grows for "1000" instead of
								// spilling the numeral past the button's edge.
								className="w-auto min-w-(--control-sm) px-1 tabular-nums"
								aria-label={`Page ${item}`}
								aria-current={item === current ? "page" : undefined}
								render={linkTo(item)}
								onClick={(event) => goTo(item, event)}
							>
								{item}
							</Button>
						</li>
					),
				)}
			</ul>

			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="Next page"
				disabled={current >= safeTotal}
				render={linkTo(current + 1)}
				onClick={(event) => goTo(current + 1, event)}
			>
				<Icon name="chevron-right" className="text-base" />
			</Button>
		</nav>
	)
}
Pagination.displayName = "Pagination"
