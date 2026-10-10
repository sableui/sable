"use client";

import { useCallback, useEffect, useRef } from "react"

/** How long the region stays marked as scrolling after the last scroll event. */
const LINGER_MS = 600

/**
 * Mark a scroll region as actively scrolling.
 *
 * Sets `data-scrolling` on the element while scroll events are arriving and
 * removes it a beat after they stop. `scrollbar-quiet` keys its thumb off that
 * attribute, so the bar fades in as the content moves and fades out again once
 * it settles.
 *
 * ── Why this exists when CSS already reveals on hover ───────────────────────
 * Hover is a decent proxy for "someone is scrolling" and a bad one for the
 * cases that matter most. A touch drag hovers nothing. A programmatic scroll —
 * a chat auto-following a streamed reply, `scrollToMessage`, restoring a saved
 * read position — hovers nothing either, and those are exactly the moments a
 * reader needs to see where they now are in the content. Hover stays as the
 * no-JS baseline in the CSS; this is the signal that covers the rest.
 *
 * ── Why an attribute and not React state ────────────────────────────────────
 * Scroll fires at frame rate. Routing that through `useState` would re-render
 * the whole region — and for `MessageScroller`, a re-render mid-stream on every
 * frame of a scroll — to change one boolean that only CSS reads. The attribute
 * is written directly to the node, so this costs one DOM write per scroll burst
 * and nothing at all in between.
 *
 * Returns a ref callback to put on the scrolling element:
 *
 *   const setNode = useScrollActivity()
 *   <div ref={setNode} className="overflow-y-auto scrollbar-quiet">…</div>
 *
 * Already wired into `Scroller`, `MessageScroller` and `Tree`; reach for it
 * directly only when you are building a new scroll container.
 */
export function useScrollActivity(): (node: HTMLElement | null) => void {
	const nodeRef = useRef<HTMLElement | null>(null)
	const timer = useRef<number | null>(null)

	const clear = useCallback(() => {
		if (timer.current !== null) {
			window.clearTimeout(timer.current)
			timer.current = null
		}
	}, [])

	const onScroll = useCallback(() => {
		const node = nodeRef.current
		if (!node) return
		node.setAttribute("data-scrolling", "")
		clear()
		timer.current = window.setTimeout(() => {
			// Re-read the ref rather than closing over `node`: the element can be
			// detached between the last scroll and this callback, and writing to a
			// node that is no longer in the tree is a leak with no visible symptom.
			nodeRef.current?.removeAttribute("data-scrolling")
			timer.current = null
		}, LINGER_MS)
	}, [clear])

	// Detach cleanly when the element changes or unmounts. A callback ref is the
	// only way to get the "old node" here; an effect on a ref object cannot see it.
	const setNode = useCallback(
		(node: HTMLElement | null) => {
			const previous = nodeRef.current
			if (previous === node) return
			if (previous) {
				previous.removeEventListener("scroll", onScroll)
				previous.removeAttribute("data-scrolling")
			}
			nodeRef.current = node
			// `passive` because this never calls preventDefault, and a non-passive
			// scroll listener blocks the compositor from scrolling until JS returns.
			if (node) node.addEventListener("scroll", onScroll, { passive: true })
		},
		[onScroll],
	)

	useEffect(() => {
		return () => {
			clear()
			const node = nodeRef.current
			if (node) {
				node.removeEventListener("scroll", onScroll)
				node.removeAttribute("data-scrolling")
			}
		}
	}, [clear, onScroll])

	return setNode
}
