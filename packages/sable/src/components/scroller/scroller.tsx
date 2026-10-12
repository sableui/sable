"use client";

import type { ComponentPropsWithRef, KeyboardEvent, UIEvent } from "react"
import { useCallback, useRef } from "react"
import { cn } from "../../lib/cn"
import { setRef } from "../../lib/refs"
import { useEdgeFade } from "../../lib/use-edge-fade"
import { useScrollActivity } from "../../lib/use-scroll-activity"
import {
	scrollRegionKeyDown,
	useWheelToHorizontal,
} from "../../lib/use-wheel-to-horizontal"

export interface ScrollerProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Scroll axis. "vertical" scrolls top-to-bottom with top/bottom edge fades;
	 * "horizontal" scrolls left-to-right with left/right edge fades.
	 * @default "vertical"
	 */
	orientation?: "vertical" | "horizontal"
	/**
	 * On a horizontal Scroller, let a vertical mouse wheel scroll it sideways.
	 * On by default, and the reason is arithmetic: most mice have no horizontal
	 * wheel, so without it the content past the fold is unreachable on the most
	 * common pointing device there is. Trackpad gestures and `shift+wheel` are
	 * left to the browser, and the strip releases the wheel at both ends so it
	 * never traps the page. Ignored when `orientation="vertical"`.
	 * @default true
	 */
	wheelScroll?: boolean
	/**
	 * Accessible name for the scroll region. A scrollable region that takes
	 * focus should say what it contains — without one, a screen reader announces
	 * an unnamed group.
	 */
	label?: string
	/**
	 * Classes for the inner element that actually scrolls. Narrow on purpose:
	 * `className` styles and sizes the Scroller and is what you want ~always.
	 * This is for the handful of utilities that only mean something on the
	 * scrolling box itself — `snap-x`, `scroll-smooth`, `scroll-p-*`.
	 */
	viewportClassName?: string
}

/**
 * Scroller — a scroll container that fades its edges when content overflows.
 * A single overflow-auto region (thin scrollbar) that alpha-masks its content at
 * the leading/trailing edges so it fades to transparent (blending with any
 * background, never painting over edge content). The fades appear only when there
 * is more content to scroll toward: the start fade once scrolled past the start,
 * the end fade until scrolled to the end. Self-contained state (useState +
 * onScroll); no Base UI behavior.
 *
 * **`className` styles and sizes the Scroller.** `h-64`, `max-h-80`, `flex-1
 * min-h-0`, `rounded-lg border`, `bg-card` — all of it goes there and all of it
 * behaves. Sizing still bounds the scroll region: the outer box is a flex column
 * and the scrolling element inside it is `flex-1 min-h-0`, so a cap on the
 * Scroller is a cap on what scrolls.
 *
 * ── Why there is a wrapper, given there deliberately wasn't one ──────────────
 * The edge fade is a `mask-image`, and a mask applies to everything its element
 * paints — border and background included. With chrome and mask on one box, a
 * `rounded-lg border` Scroller had its FRAME dissolve at the scrolling edge:
 * reported from a consuming app, and it reads as a rendering fault rather than
 * an affordance. `mask-clip: padding-box` is the obvious fix and is not one —
 * `mask-clip` sets the area the element is painted *within*, so it deletes the
 * border instead of exempting it (verified side by side in a browser). No CSS
 * masks the padding box while sparing the border ring. Splitting chrome from the
 * masked box is the only fix.
 *
 * This reverses the 0.44 decision, and the reason that decision existed is gone.
 * The old wrapper failed because the inner was `h-full`: a `max-h-*` bounded the
 * wrapper, the percentage resolved against an auto height, and the region grew
 * to full content height — clipped, unscrollable, no scrollbar and no fade to
 * say so. `flex-1 min-h-0` in a flex column has no percentage to resolve, and
 * bounds correctly from `h-*`, `max-h-*` and `flex-1` alike. Both shapes were
 * re-measured before making this change.
 *
 * `ref` and `onScroll` still address the scrolling element, so nothing that
 * reads or drives scroll position moves. Only `className` changed box, and
 * `viewportClassName` exists for the few utilities that must be on the scroller
 * itself (`snap-x`, `scroll-smooth`).
 *
 *   <Scroller className="h-64">
 *     …long content…
 *   </Scroller>
 *
 *   <Scroller className="max-h-80">
 *     …content that scrolls once it passes 20rem…
 *   </Scroller>
 *
 *   <Scroller orientation="horizontal" className="w-full">
 *     <div className="flex gap-3">…wide content…</div>
 *   </Scroller>
 */
export function Scroller({
	orientation = "vertical",
	wheelScroll = true,
	label,
	className,
	viewportClassName,
	children,
	ref,
	style,
	onScroll,
	onKeyDown,
	...props
}: ScrollerProps) {
	const regionRef = useRef<HTMLDivElement>(null)
	const isHorizontal = orientation === "horizontal"
	// Memoized rather than an inline `mergeRefs(ref, regionRef)`: that would be a
	// new function on every render, and React detaches (calls with null) then
	// reattaches a changed callback ref each time. A consumer whose ref callback
	// does work on attach — CommandMenu seeds its keyboard highlight there — would
	// have that work redone on every render, undoing whatever happened since.
	const trackActivity = useScrollActivity()
	const trackWheel = useWheelToHorizontal(isHorizontal && wheelScroll)
	const setRegion = useCallback(
		(node: HTMLDivElement | null) => {
			setRef(ref, node)
			trackActivity(node)
			trackWheel(node)
			regionRef.current = node
		},
		[ref, trackActivity, trackWheel],
	)

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			onKeyDown?.(event)
			// The consumer gets first refusal — a strip of interactive chips may want
			// the arrow keys for roving focus, and it opts out with preventDefault().
			if (event.defaultPrevented) return
			scrollRegionKeyDown(event, orientation)
		},
		[onKeyDown, orientation],
	)
	// The mask lives on the SCROLL element — it has to stay put while the
	// content moves under it — and not on the chrome wrapper, or the border
	// fades with the content, which is the whole reason the wrapper exists.
	// See the note on the component and useEdgeFade.
	const { sync: syncFade, style: fadeStyle } = useEdgeFade(regionRef, orientation)

	const handleScroll = useCallback(
		(event: UIEvent<HTMLDivElement>) => {
			syncFade()
			onScroll?.(event)
		},
		[syncFade, onScroll],
	)

	const isVertical = orientation === "vertical"

	return (
		// The chrome box. Carries the consumer's border/background/radius and the
		// sizing, and is NOT masked — which is the entire point of the split. A
		// flex column so the scroller below can be `flex-1 min-h-0`, which bounds
		// off `h-*`, `max-h-*` and `flex-1` alike with no percentage to resolve.
		<div style={style} className={cn("flex flex-col", className)}>
			{/*
			 * Everything EXCEPT className/style spreads here, not onto the chrome box.
			 * The split is by meaning, not convenience: className and style are
			 * appearance and size, which is what the outer box is for; `role`, `id`,
			 * `aria-*`, `data-*` and event handlers all describe the thing that
			 * scrolls. CommandMenu is the proof — it hands this component
			 * `role="listbox"` and the `id` its combobox points `aria-controls` at,
			 * and both have to land on the scrolling element or the palette's ARIA
			 * wiring addresses an empty wrapper.
			 */}
			<div
				ref={setRegion}
				onScroll={handleScroll}
				onKeyDown={handleKeyDown}
				/*
				 * Focusable, and named. Chrome 128+ and Firefox make scrollable regions
				 * keyboard-focusable on their own; Safari does not — so a strip with a
				 * hidden scrollbar and no focusable children is simply unreachable there.
				 * Declaring it makes the behaviour a property of the component instead of
				 * a property of the reader's browser. `group` rather than `region` so a
				 * page of chip rows does not litter the landmark list.
				 */
				tabIndex={0}
				role="group"
				aria-label={label}
				/*
				 * `data-orientation`, NOT `aria-orientation` — which is invalid on
				 * `role="group"` and was flagged critical by axe the moment a caller's
				 * own role stopped shadowing ours. The axis is styling and test
				 * information, not something ARIA has a place for on a scroll region.
				 */
				data-orientation={orientation}
				style={fadeStyle}
				className={cn(
					// Fill the chrome box without a percentage height. `min-h-0` /
					// `min-w-0` because a flex item's default `min-size: auto` refuses to
					// shrink below its content — which is exactly how a scroll region
					// silently stops scrolling.
					"min-h-0 min-w-0 flex-1",
					// Inherit the wrapper's radius so content clips to the same curve the
					// border draws; a scroll container already clips to its own padding
					// box, so this needs no `overflow-hidden` fighting the scroll axis.
					"rounded-[inherit]",
					"motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					// Contained overscroll: a Scroller is almost always a bounded region
					// inside a page or a popup, and a wheel gesture that reaches its end
					// should stop rather than start scrolling whatever is behind it.
					"overscroll-contain",
					isVertical
						? // Vertical: a thin bar, revealed while scrolling. The fade says
							// "more below"; the bar says how much and where you are — a long
							// list needs both.
							"scrollbar-quiet overflow-y-auto overflow-x-hidden"
						: // Horizontal: no bar at all. The edge fades this component already
							// draws ARE the affordance, and they say the same thing better —
							// which is the carousel read a media strip or chip row wants. A
							// 4px rail under a row of tiles adds chrome and no information.
							"scrollbar-hidden overflow-x-auto overflow-y-hidden",
					viewportClassName,
				)}
				{...props}
			>
				{children}
			</div>
		</div>
	)
}
Scroller.displayName = "Scroller"
