"use client";

import { type CSSProperties, type RefObject, useCallback, useState } from "react"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

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
 * Measures once before paint, then only when something can have changed the
 * answer: the region or one of its direct children resizes (content growing
 * changes a child's size, not the region's), a direct child is added or
 * removed, and on each `sync()` — call it from `onScroll`.
 *
 * It used to measure in a layout effect after EVERY render. Reading
 * scrollTop/scrollHeight right after React's DOM writes forces a synchronous
 * layout, so any parent re-render (a streaming chat, a list that updates, a
 * theme drag) paid one forced layout per Scroller, CodeBlock and TabsList on
 * the page. A ResizeObserver callback runs after layout, when the read is free.
 *
 * `present` is for an element that is not always rendered (CodeBlock has no
 * `<pre>` in prompt mode): pass whether it is, and the observers attach when it
 * appears. A ref filling in later is not something an effect can see.
 */
export function useEdgeFade(
	ref: RefObject<HTMLElement | null>,
	orientation: "vertical" | "horizontal",
	present = true,
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

	useIsomorphicLayoutEffect(() => {
		const el = ref.current
		if (!el) return
		sync()
		if (typeof ResizeObserver === "undefined") return
		// Called after layout, so its reads are free. Unchanged booleans bail out
		// of the state update, so this never loops.
		const ro = new ResizeObserver(sync)
		const observe = () => {
			ro.disconnect()
			ro.observe(el)
			for (const child of el.children) ro.observe(child)
		}
		observe()
		// A child added or removed: observe the new set. A newly observed element
		// reports once after the next layout, which re-syncs; a removal changes no
		// remaining size, so it syncs on the next frame instead.
		let frame = 0
		const mo =
			typeof MutationObserver === "undefined"
				? null
				: new MutationObserver((records) => {
						if (records.some((record) => record.type === "childList" && record.target === el)) observe()
						if (!frame)
							frame = requestAnimationFrame(() => {
								frame = 0
								sync()
							})
					})
		// Text that grows in place (a streamed answer in one node) resizes no
		// child element, so character data is watched too.
		mo?.observe(el, { childList: true, characterData: true, subtree: true })
		return () => {
			cancelAnimationFrame(frame)
			mo?.disconnect()
			ro.disconnect()
		}
	// biome-ignore lint/correctness/useExhaustiveDependencies: present re-attaches the observers
	}, [ref, sync, present])

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
