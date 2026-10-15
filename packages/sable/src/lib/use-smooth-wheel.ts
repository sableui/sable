"use client";

import { useCallback, useEffect, useRef } from "react"
import { useMotion } from "../motion/MotionProvider"

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
 * Is this a mouse wheel's notch, as opposed to a trackpad or a touch fling?
 *
 * Only notches are eased. A trackpad already delivers momentum of its own, and
 * easing it a second time is the lag every smooth-scroll library is known for.
 * Firefox reports a mouse in lines; Chrome and Safari keep the legacy
 * `wheelDeltaY`, which a notch sets in multiples of 120. Without either, a
 * whole, notch-sized step with no sideways part is the best evidence there is.
 * A misread trackpad event costs one eased step, then the next native scroll
 * cancels it (see `onScroll`), so the guess fails safe.
 */
function isNotch(event: WheelEvent): boolean {
	if (event.deltaMode !== 0) return true
	const legacy = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
	if (legacy) return event.deltaX === 0 && legacy % 120 === 0
	return event.deltaX === 0 && Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 50
}

/**
 * Would something between the pointer and the region take this wheel first?
 * A code block, a textarea or a nested list that can still scroll that way
 * owns the gesture, as it does natively; claiming it here scrolled the outer
 * region instead and left the inner one unreachable by wheel.
 */
function innerScrolls(target: EventTarget | null, region: HTMLElement, deltaY: number): boolean {
	for (let el = target instanceof Element ? target : null; el && el !== region; el = el.parentElement) {
		if (!(el instanceof HTMLElement) || el.scrollHeight <= el.clientHeight) continue
		const overflow = getComputedStyle(el).overflowY
		if (overflow !== "auto" && overflow !== "scroll") continue
		const max = el.scrollHeight - el.clientHeight
		if (deltaY < 0 ? Math.round(el.scrollTop) > 0 : Math.round(el.scrollTop) < max) return true
	}
	return false
}

/**
 * CSS already animating the position (`scroll-behavior: smooth`) or pulling it
 * to snap points: the browser owns the motion, and easing on top of it reads
 * back a position the browser is still moving, which cancels the ease after
 * one frame and leaves a notch moving almost nowhere. Such a region gets the
 * plain step, which the browser then smooths or snaps itself.
 */
function cssOwnsMotion(el: HTMLElement): boolean {
	const style = getComputedStyle(el)
	return style.scrollBehavior === "smooth" || (style.scrollSnapType !== "" && style.scrollSnapType !== "none")
}

/**
 * How much of the remaining distance one 60fps frame covers. Scaled by the
 * real frame time, so a 120Hz display eases over the same duration rather
 * than twice as fast. 0.14 settles a notch in roughly 350ms: enough to read as
 * inertia, short enough that the list never feels like it is catching up.
 */
const EASE_PER_FRAME = 0.14
const FRAME_MS = 1000 / 60
/** Below this the remaining distance is invisible; land exactly. */
const SETTLE_PX = 0.5

export interface SmoothWheelOptions {
	/** The axis the element scrolls on. @default "vertical" */
	axis?: "vertical" | "horizontal"
	/**
	 * Horizontal only: a vertical mouse wheel scrolls the element sideways. Most
	 * mice have no horizontal wheel, so without it the content past the fold is
	 * out of reach. @default true
	 */
	mapVertical?: boolean
	/**
	 * Ease mouse-wheel steps toward their target instead of jumping. Trackpads,
	 * touch, keys and scrollbar drags stay native, and reduced motion (the OS
	 * preference or MotionProvider) turns it off. @default true
	 */
	smooth?: boolean
}

/**
 * Mouse-wheel scrolling for one scroll container: eased steps (the inertia a
 * smooth-scroll library such as Lenis adds), and on a horizontal strip, a
 * vertical wheel mapped sideways. Returns a ref callback for the scrolling
 * element. Already wired into `<Scroller>`; use it directly for a scroll
 * container of your own.
 *
 *   const wheel = useSmoothWheel()
 *   <div ref={wheel} className="overflow-y-auto scrollbar-quiet">…</div>
 *
 * Unlike a page-level smooth scroller, it owns one element and only the mouse
 * wheel, so it never fights the browser over anything else:
 *
 * 1. **It releases at the ends.** At either end the event passes through and
 *    the page (or the scroller around this one) scrolls, which is what the
 *    reader was doing. Intercepting unconditionally traps the page.
 * 2. **It leaves trackpads, touch and `shift+wheel` alone** (see `isNotch`), and
 *    a trackpad's own horizontal swipe on a strip, which the browser already
 *    scrolls.
 * 3. **Anything else that scrolls the element wins.** A scrollbar drag, a key,
 *    `scrollIntoView` from a highlighted row or a stick-to-bottom chat: the
 *    moment the position moves without us, the easing stops and that movement
 *    stands.
 * 4. **It normalises `deltaMode`** — see `toPixels`.
 *
 * The wheel listener is non-passive, because `preventDefault` is the mechanism.
 * It is attached only when there is something to do: a vertical element with
 * easing off, or under reduced motion, gets no listener at all.
 */
export function useSmoothWheel({
	axis = "vertical",
	mapVertical = true,
	smooth = true,
}: SmoothWheelOptions = {}): (node: HTMLElement | null) => void {
	const { enabled: motion } = useMotion()
	const settings = useRef({ axis, mapVertical, smooth: smooth && motion })
	settings.current = { axis, mapVertical, smooth: smooth && motion }
	const horizontal = axis === "horizontal"
	// Work to do: easing, or the sideways mapping, which needs no easing.
	// Work to do: easing that motion allows, or the sideways mapping, which
	// needs no easing. Nothing else pays for a non-passive wheel listener.
	const active = (smooth && motion) || (horizontal && mapVertical)

	const nodeRef = useRef<HTMLElement | null>(null)
	const anim = useRef<{ target: number; pos: number; written: number; last: number; frame: number } | null>(null)

	const stop = useCallback(() => {
		if (anim.current) cancelAnimationFrame(anim.current.frame)
		anim.current = null
	}, [])

	const step = useCallback((now: number) => {
		const el = nodeRef.current
		const a = anim.current
		if (!el || !a) return
		const key = settings.current.axis === "horizontal" ? "scrollLeft" : "scrollTop"
		const dt = Math.min(64, now - a.last)
		a.last = now
		a.pos += (a.target - a.pos) * (1 - (1 - EASE_PER_FRAME) ** (dt / FRAME_MS))
		if (Math.abs(a.target - a.pos) < SETTLE_PX) a.pos = a.target
		el[key] = a.pos
		// What the browser kept, which may be rounded: the yardstick `onScroll`
		// uses to tell our movement from anyone else's.
		a.written = el[key]
		if (a.pos === a.target) anim.current = null
		else a.frame = requestAnimationFrame(step)
	}, [])

	const onWheel = useCallback(
		(event: WheelEvent) => {
			const el = nodeRef.current
			if (!el || event.ctrlKey) return // ctrl+wheel is the browser's zoom
			const { axis: current, mapVertical: map, smooth: ease } = settings.current
			const sideways = current === "horizontal"
			if (event.shiftKey) return
			if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.deltaY === 0) return
			if (sideways && !map) return
			if (innerScrolls(event.target, el, event.deltaY)) return

			const notch = ease && isNotch(event) && !cssOwnsMotion(el)
			// A vertical element with nothing to ease: the browser's scroll is right.
			if (!sideways && !notch) return

			const key = sideways ? "scrollLeft" : "scrollTop"
			const max = sideways ? el.scrollWidth - el.clientWidth : el.scrollHeight - el.clientHeight
			if (max <= 0) return
			const delta = toPixels(event.deltaY, event.deltaMode)
			// Steps accumulate onto the target, not the current position, so four
			// quick notches travel four notches rather than whatever was left.
			const from = notch && anim.current ? anim.current.target : el[key]
			// (1) Only claim the gesture if we can act on it. Rounded, because the
			// position is fractional on zoomed and HiDPI displays and an unrounded
			// end would trap the page exactly where releasing matters most.
			if ((delta < 0 && Math.round(from) <= 0) || (delta > 0 && Math.round(from) >= max)) return

			event.preventDefault()
			const target = Math.max(0, Math.min(max, from + delta))
			if (!notch) {
				stop()
				el[key] = target
				return
			}
			if (anim.current) {
				anim.current.target = target
				return
			}
			anim.current = {
				target,
				pos: el[key],
				written: el[key],
				last: performance.now(),
				frame: requestAnimationFrame(step),
			}
		},
		[step, stop],
	)

	// (3) Someone else moved it: their movement stands.
	const onScroll = useCallback(() => {
		const el = nodeRef.current
		const a = anim.current
		if (!el || !a) return
		const key = settings.current.axis === "horizontal" ? "scrollLeft" : "scrollTop"
		if (Math.abs(el[key] - a.written) > 1) stop()
	}, [stop])

	// Listeners follow `active` (a motion policy can flip it) without the ref
	// callback changing identity: Scroller's consumers do work when their ref
	// attaches (CommandMenu seeds its highlight), and a new callback would make
	// React detach and re-attach theirs too.
	const activeRef = useRef(active)
	activeRef.current = active
	const attached = useRef<HTMLElement | null>(null)
	const sync = useCallback(() => {
		const want = activeRef.current ? nodeRef.current : null
		if (attached.current === want) return
		const was = attached.current
		if (was) {
			was.removeEventListener("wheel", onWheel)
			was.removeEventListener("scroll", onScroll)
			was.removeEventListener("pointerdown", stop)
			stop()
		}
		attached.current = want
		if (want) {
			// Non-passive: preventDefault is the point. Chrome treats wheel
			// listeners as passive by default, so omitting this disables it.
			want.addEventListener("wheel", onWheel, { passive: false })
			want.addEventListener("scroll", onScroll, { passive: true })
			// A press on the scrollbar is a drag about to start: hand it over now.
			want.addEventListener("pointerdown", stop, { passive: true })
		}
	}, [onWheel, onScroll, stop])
	useEffect(sync, [active, sync])

	return useCallback(
		(node: HTMLElement | null) => {
			nodeRef.current = node
			sync()
		},
		[sync],
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
