"use client"

import { type ComponentPropsWithoutRef, type ReactNode, useLayoutEffect, useRef } from "react"
import { cn } from "../../lib/cn"
import { HighlightGlide } from "../../lib/highlight-glide"

export interface GlidingHighlightProps
	extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
	/**
	 * Index of the item the highlight should sit behind, or `null` for none.
	 *
	 * Pass the HOVERED item when there is one and fall back to the selected item
	 * otherwise (`hovered ?? selected`). That fallback is what makes the pointer
	 * leaving a menu return the highlight home instead of dropping it.
	 */
	active: number | null
	/**
	 * @deprecated The highlight now measures both axes, so a horizontal row of
	 * items needs no flag. Accepted and ignored.
	 */
	orientation?: "vertical" | "horizontal"
	/** The items. Each direct child is one measurable row. */
	children: ReactNode
	/**
	 * Class for the travelling highlight itself. Its radius defaults to
	 * `sable-frame-inner` (concentric inside a `sable-frame`); in a rounded
	 * container with its own inset, pass `rounded-concentric-<outer>/<inset>`.
	 */
	highlightClassName?: string
}

/**
 * GlidingHighlight — ONE highlight that travels to the active item, instead of
 * each item toggling its own background.
 *
 * The difference is only visible in motion, and it is the entire point. With
 * per-item `hover:bg-*`, arrow-keying down a list is a background teleporting
 * between rows: at every step the eye has to re-find where the highlight went.
 * A single element that moves is continuous, so the eye tracks it.
 *
 * This is the same engine Menu, Select, Combobox and ContextMenu mount
 * (`lib/highlight-glide`), for lists Sable does not own: it marks the
 * `active` direct child `data-highlighted` and the glide follows that mark.
 * One engine means one set of behaviours — invisible until something is
 * genuinely active, arrives and leaves in place, measured rather than assumed,
 * durations on the motion tokens — instead of two copies drifting apart.
 *
 * The highlight is `aria-hidden` and carries no semantics: selection state
 * belongs on the items (`aria-selected`, `aria-current`) — this only draws it.
 *
 *   <GlidingHighlight active={hovered ?? selected}>
 *     {items.map((item, i) => (
 *       <button key={item.id} onPointerEnter={() => setHovered(i)}>{item.label}</button>
 *     ))}
 *   </GlidingHighlight>
 */
export function GlidingHighlight({
	active,
	orientation: _orientation,
	children,
	className,
	highlightClassName,
	...props
}: GlidingHighlightProps) {
	const ref = useRef<HTMLDivElement>(null)

	// Mark the active item; the glide follows `data-highlighted`. A layout
	// effect, so the mark and the glide's measurement land in the same frame.
	useLayoutEffect(() => {
		const root = ref.current
		if (!root) return
		const items = Array.from(root.children).filter((el) => !el.hasAttribute("data-highlight-glide"))
		items.forEach((el, i) => {
			if (i === active) el.setAttribute("data-highlighted", "")
			else el.removeAttribute("data-highlighted")
		})
	})

	return (
		<div
			ref={ref}
			className={cn("relative [&>*:not([data-highlight-glide])]:relative", className)}
			{...props}
		>
			{/* The `sable-frame-inner` radius, written as a `rounded-[…]` so cn()
			    lets a `rounded-*` / `rounded-concentric-*` in highlightClassName
			    replace it: inside a `sable-frame` the highlight nests concentrically,
			    anywhere else it falls back to radius-sm. */}
			<HighlightGlide
				className={cn(
					"rounded-[var(--sable-frame-inner-radius,var(--radius-sm))] bg-accent",
					highlightClassName,
				)}
			/>
			{children}
		</div>
	)
}
GlidingHighlight.displayName = "GlidingHighlight"
