"use client";

// No cleanup effect: React invokes a callback ref with `null` on unmount, so the
// detach path in the returned callback already runs.
import { useCallback, useRef } from "react"

/** Rough px-per-line and px-per-page for wheel events that don't report pixels. */
const LINE_HEIGHT = 16
const PAGE_HEIGHT = 400

/**
 * Convert a wheel event's delta to pixels.
 *
 * `deltaMode` is 0 (pixels), 1 (lines) or 2 (pages), and **mice frequently
 * report lines while trackpads report pixels**. Use the raw number and one
 * mouse notch moves ~3px where a trackpad swipe moves ~100 — the feature reads
 * as broken rather than absent, which is worse.
 */
function toPixels(delta: number, mode: number): number {
	if (mode === 1) return delta * LINE_HEIGHT
	if (mode === 2) return delta * PAGE_HEIGHT
	return delta
}

/**
 * Let a vertical wheel scroll a horizontal region.
 *
 * Most mice have no horizontal wheel. Without this, a horizontal strip is
 * operable by trackpad, by dragging a scrollbar we deliberately hide, or not at
 * all — so on the most common pointing device in the world the content past the
 * fold is simply unreachable.
 *
 * Returns a ref callback for the scrolling element. Already wired into
 * `<Scroller orientation="horizontal">`.
 *
 * ── The four things that make naive versions feel broken ────────────────────
 *
 * 1. **It releases at the ends.** Intercepting every wheel event traps the page:
 *    a reader scrolling down the document whose pointer crosses the strip stops
 *    dead. This only calls `preventDefault` while the strip can actually move in
 *    the requested direction; at either end the event passes through and the
 *    page scrolls, which is what the reader was doing.
 *
 * 2. **It leaves trackpads alone.** A trackpad already sends `deltaX` for a
 *    two-finger horizontal swipe. Mapping `deltaY` unconditionally would make a
 *    diagonal gesture scroll twice — once from the browser, once from us. When
 *    `|deltaX| > |deltaY|` the device is already doing the right thing.
 *
 * 3. **It leaves `shift+wheel` alone**, which browsers already map to horizontal.
 *    Handling it as well doubles it.
 *
 * 4. **It normalises `deltaMode`** — see `toPixels`.
 *
 * The listener is non-passive, because `preventDefault` is the whole mechanism.
 * That costs a little scroll performance on this element, which is why it is
 * opt-in per region rather than applied to every scroller.
 */
export function useWheelToHorizontal(
	enabled = true,
): (node: HTMLElement | null) => void {
	const nodeRef = useRef<HTMLElement | null>(null)

	const onWheel = useCallback((event: WheelEvent) => {
		const el = nodeRef.current
		if (!el) return

		// (2) and (3): the platform is already handling this one.
		if (event.shiftKey) return
		if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
		if (event.deltaY === 0) return

		const delta = toPixels(event.deltaY, event.deltaMode)
		const max = el.scrollWidth - el.clientWidth
		if (max <= 0) return

		// (1) Only claim the gesture if we can act on it. `Math.round` because
		// scrollLeft is fractional on zoomed/HiDPI displays and an un-rounded
		// comparison leaves the strip permanently "not quite at the end", which
		// would trap the page exactly where releasing matters most.
		const atStart = Math.round(el.scrollLeft) <= 0
		const atEnd = Math.round(el.scrollLeft) >= max
		if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return

		event.preventDefault()
		el.scrollLeft += delta
	}, [])

	return useCallback(
		(node: HTMLElement | null) => {
			const previous = nodeRef.current
			if (previous === node) return
			previous?.removeEventListener("wheel", onWheel)
			nodeRef.current = node
			// Non-passive: preventDefault is the point. Chrome treats wheel listeners
			// as passive by default, so omitting this silently disables the feature.
			if (node && enabled) {
				node.addEventListener("wheel", onWheel, { passive: false })
			}
		},
		[enabled, onWheel],
	)
}

/**
 * Arrow / Home / End stepping for a scroll region.
 *
 * Browsers that make scrollable regions keyboard-focusable (Chrome 128+,
 * Firefox) already do this for free; Safari does not, and a region with a
 * hidden scrollbar and no focusable children is unreachable there. Handling the
 * keys ourselves makes the behaviour the same everywhere rather than a property
 * of the browser someone happens to use.
 */
export function scrollRegionKeyDown(
	event: React.KeyboardEvent<HTMLElement>,
	orientation: "horizontal" | "vertical",
): void {
	const el = event.currentTarget
	const horizontal = orientation === "horizontal"
	const page = horizontal ? el.clientWidth : el.clientHeight
	// A step short enough to feel like nudging, not paging.
	const step = Math.max(40, page * 0.2)

	const back = horizontal ? "ArrowLeft" : "ArrowUp"
	const forward = horizontal ? "ArrowRight" : "ArrowDown"
	const axis = horizontal ? "scrollLeft" : "scrollTop"
	const max = horizontal
		? el.scrollWidth - el.clientWidth
		: el.scrollHeight - el.clientHeight

	let next: number | null = null
	if (event.key === back) next = el[axis] - step
	else if (event.key === forward) next = el[axis] + step
	else if (event.key === "Home") next = 0
	else if (event.key === "End") next = max
	else if (event.key === "PageUp") next = el[axis] - page
	else if (event.key === "PageDown") next = el[axis] + page
	if (next === null) return

	event.preventDefault()
	el[axis] = Math.max(0, Math.min(max, next))
}
