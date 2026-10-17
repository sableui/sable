"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"

/**
 * The height transition the field wears once the hook has pinned it. Written
 * inline because it replaces, rather than adds to, the field's class transition:
 * motion-interactive does not list `height`, and two transition-property
 * declarations on one element would leave whichever class sorts last.
 *
 * Height is EXPRESSIVE (`× --motion-expressive`). The new line of text is the
 * answer to the keystroke and it lands at once either way; the ease only
 * narrates that the box made room, so `data-motion="subtle"` snaps it. `fast`,
 * not `base`: a field that is still growing while the next key lands reads as
 * lag. Opacity stays essential for the disabled fade the class used to carry.
 */
const GROW_TRANSITION =
	"height calc(var(--motion-duration-fast) * var(--motion-expressive, 1)) var(--motion-ease-standard), opacity var(--motion-duration-fast) var(--motion-ease-standard)"

/**
 * Eases a textarea's height as its content grows and shrinks, for a field that
 * sizes to its content up to a cap (ChatComposer).
 *
 * `field-sizing: content` cannot do this by itself: the height it produces is
 * still `height: auto`, and auto-to-auto is not a transition even with
 * `interpolate-size`. So the field keeps `field-sizing` for the server render
 * and the first paint, and on the client this hook measures the content and
 * pins an explicit pixel height, which can ease.
 *
 * Per change, in one synchronous block before paint:
 *   1. read the height the field is at NOW (mid-transition if one is running);
 *   2. drop to `height: auto` with transitions off and read scrollHeight;
 *   3. put the current height back, flush, re-enable the transition, and set
 *      the target, clamped to the computed max-height so a shrink from past the
 *      cap starts moving at once instead of easing through invisible pixels.
 * Each keystroke restarts the ease from wherever the last one had got to, so
 * typing fast never queues up growth.
 *
 * Overflow is hidden until the content passes the cap. Without that, the frames
 * where the box is still shorter than its text flash a scrollbar, and the
 * browser scrolls the first line out of view to reveal the caret, then the line
 * slides back as the box grows. Below the cap the scroll is pinned to the top,
 * so the box grows to reveal the new line instead; past it, the browser's own
 * caret scroll is kept.
 *
 * Width changes (a resized pane) re-measure without easing — the reflow is the
 * window's motion, not the field's.
 *
 * Deliberately not on plain `<Textarea autoResize>`. That field sits in a page
 * form with no cap, so easing it would reflow everything below it on every
 * frame of every line break, and it would trade zero-JS, server-exact sizing for
 * two forced layouts per keystroke. The composer is capped, pinned to the foot
 * of a thread, and grows at the moments a reader is watching it.
 */
export function useEasedGrowth(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
	const mounted = useRef(false)
	const width = useRef(0)

	const fit = useCallback(
		(animate: boolean) => {
			const el = ref.current
			if (!el) return
			const style = getComputedStyle(el)
			// The resolved height is the used one, so mid-transition it is the frame
			// on screen — and unlike getBoundingClientRect it ignores an ancestor's
			// transform (a sheet or dialog still scaling in).
			const from = Number.parseFloat(style.height)
			const scrollTop = el.scrollTop
			el.style.transition = "none"
			el.style.height = "auto"
			// Not rendered (a hidden tab, a closed panel that keeps its content
			// mounted): there is nothing to measure. Hand sizing back to CSS; the
			// resize observer fits it again once it has a width.
			if (el.scrollHeight === 0) {
				el.style.height = ""
				el.style.overflowY = ""
				el.style.transition = GROW_TRANSITION
				return
			}
			const content =
				el.scrollHeight +
				(Number.parseFloat(style.borderTopWidth) || 0) +
				(Number.parseFloat(style.borderBottomWidth) || 0)
			const max = Number.parseFloat(style.maxHeight)
			const target = Number.isNaN(max) ? content : Math.min(content, max)
			const capped = content > target + 0.5
			el.style.overflowY = capped ? "" : "hidden"
			if (animate && Number.isFinite(from)) {
				el.style.height = `${from}px`
				void el.offsetHeight
				el.style.transition = GROW_TRANSITION
				el.style.height = `${target}px`
			} else {
				el.style.height = `${target}px`
				void el.offsetHeight
				el.style.transition = GROW_TRANSITION
			}
			el.scrollTop = capped ? scrollTop : 0
		},
		[ref],
	)

	// Every value change, controlled or not — typing, a paste, the clear after
	// a send. The first fit only pins what field-sizing already drew.
	// biome-ignore lint/correctness/useExhaustiveDependencies: value is the trigger; fit reads the DOM, not it
	useIsomorphicLayoutEffect(() => {
		fit(mounted.current)
		mounted.current = true
	}, [value, fit])

	useEffect(() => {
		const el = ref.current
		if (!el || typeof ResizeObserver === "undefined") return
		width.current = el.clientWidth
		const ro = new ResizeObserver(() => {
			// The observer also fires for the height this hook animates; only a
			// new width changes how the text wraps.
			if (el.clientWidth === width.current) return
			width.current = el.clientWidth
			fit(false)
		})
		ro.observe(el)
		// A web font swapping in changes the line height under a draft restored on
		// load, and nothing else would notice: the width is the same.
		let live = true
		document.fonts?.ready.then(() => {
			if (live) fit(false)
		})
		return () => {
			live = false
			ro.disconnect()
		}
	}, [ref, fit])
}
