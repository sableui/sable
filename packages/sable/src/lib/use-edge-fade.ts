"use client";

import { type CSSProperties, type RefObject, useCallback, useState } from "react"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"
import { useResizeObserver } from "./use-resize-observer"

/**
 * Edge fades for a scroll region — the "there is more this way" affordance
 * shared by Scroller and CodeBlock.
 *
 * Alpha-masks the content edges rather than overlaying an opaque bg-colored
 * gradient: the content itself fades to transparent where there is more to
 * scroll, so it blends with ANY background and never paints over the borders or
 * shadows of edge content. An edge is masked only while there is more to scroll
 * toward it: the start once scrolled past the start, the end until scrolled to
 * the end.
 *
 * The mask belongs on the element that SCROLLS — it has to stay put while the
 * content moves under it — and that element should carry no border of its own,
 * or the border fades with the content (see Scroller).
 *
 * Measures before paint, on every render (content may have changed), whenever
 * the region resizes, and on each `sync()` — call it from `onScroll`.
 */
export function useEdgeFade(
	ref: RefObject<HTMLElement | null>,
	orientation: "vertical" | "horizontal",
): { sync: () => void; style: CSSProperties | undefined } {
	const [showStart, setShowStart] = useState(false)
	const [showEnd, setShowEnd] = useState(false)

	const sync = useCallback(() => {
		const el = ref.current
		if (!el) return
		if (orientation === "horizontal") {
			const { scrollLeft, scrollWidth, clientWidth } = el
			setShowStart(scrollLeft > 0)
			// 1px slack absorbs sub-pixel rounding at the trailing edge.
			setShowEnd(scrollLeft < scrollWidth - clientWidth - 1)
		} else {
			const { scrollTop, scrollHeight, clientHeight } = el
			setShowStart(scrollTop > 0)
			setShowEnd(scrollTop < scrollHeight - clientHeight - 1)
		}
	}, [ref, orientation])

	// Every commit: new content changes the scroll size without resizing the
	// region. Unchanged booleans bail out, so this never loops.
	useIsomorphicLayoutEffect(sync)
	useResizeObserver(sync, [ref])

	// On the spacing scale (7 steps, 28px at the default ladder) so a denser or
	// roomier Character moves the fade with the content it fades.
	const fade = "calc(var(--spacing) * 7)"
	const direction = orientation === "vertical" ? "bottom" : "right"
	// design-lint-disable inline-color -- CSS edge-fade mask: #000 is alpha-mask machinery (only the mask alpha matters), not a rendered color
	const mask =
		showStart || showEnd
			? `linear-gradient(to ${direction}, ${showStart ? "transparent" : "#000"}, #000 ${showStart ? fade : "0"}, #000 ${
					showEnd ? `calc(100% - ${fade})` : "100%"
				}, ${showEnd ? "transparent" : "#000"})`
			: undefined
	// design-lint-enable inline-color
	return { sync, style: mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined }
}
