"use client";

import { useLayoutEffect, useRef } from "react"

/**
 * Lets an element ease to its content's new size when the content changes in
 * place — "Delete" becoming "Confirm delete?", "Copy" becoming "Copied".
 *
 * CSS cannot do this alone. A transition fires when a computed value changes,
 * and a content-sized box computes `width: auto` before AND after the label
 * swap, so there is nothing to interpolate; `interpolate-size` only helps
 * between a keyword and a length. So the outer element gets an explicit pixel
 * size, measured from an inner element that keeps sizing to its content, and
 * `motion-size` on the outer one eases between the two pixel values.
 *
 *   const size = useAutoSize<HTMLButtonElement, HTMLSpanElement>()
 *   <button ref={size.outerRef} className="motion-size">
 *     <span ref={size.innerRef} className="inline-flex w-max">{label}</span>
 *   </button>
 *
 * The outer element's own padding and border are added back, so the inner
 * element is just the content. The first measurement is applied with
 * transitions suppressed, so nothing animates on mount. Under `subtle` and
 * reduced motion the recipe's size duration is 0 and the box simply resizes.
 *
 * Pass `enabled: false` when something else owns the size — a full-width
 * stacked action, a caller's `w-*` class. The inline pixel size would win over
 * any class, so the hook stands down and clears what it wrote.
 */
export function useAutoSize<
	Outer extends HTMLElement = HTMLElement,
	Inner extends HTMLElement = HTMLElement,
>({ axis = "width", enabled = true }: { axis?: "width" | "height" | "both"; enabled?: boolean } = {}) {
	const outerRef = useRef<Outer>(null)
	const innerRef = useRef<Inner>(null)

	useLayoutEffect(() => {
		const outer = outerRef.current
		const inner = innerRef.current
		if (!enabled || !outer || !inner || typeof ResizeObserver === "undefined") return
		let first = true

		const apply = () => {
			const style = getComputedStyle(outer)
			// `|| 0`: an empty or unresolved value parses to NaN, which would turn
			// the whole width into an invalid `NaNpx` that the browser drops.
			const px = (value: string) => Number.parseFloat(value) || 0
			const extraX =
				px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth)
			const extraY =
				px(style.paddingTop) + px(style.paddingBottom) + px(style.borderTopWidth) + px(style.borderBottomWidth)
			// Bounding boxes include transforms (a press scale, an opening popup);
			// offset sizes do not, and layout is what the outer box must match.
			// The rect is only the fallback (an inline inner has no offset size), so
			// it is read only then.
			const width = inner.offsetWidth || inner.getBoundingClientRect().width
			const height = inner.offsetHeight || inner.getBoundingClientRect().height
			if (first) outer.style.transition = "none"
			if (axis !== "height") outer.style.width = `${width + extraX}px`
			if (axis !== "width") outer.style.height = `${height + extraY}px`
			if (first) {
				// Commit the size, then hand the transition back to the recipe.
				void outer.offsetWidth
				outer.style.transition = ""
				first = false
			}
		}

		apply()
		const observer = new ResizeObserver(apply)
		observer.observe(inner)
		return () => {
			observer.disconnect()
			outer.style.width = ""
			outer.style.height = ""
		}
	}, [axis, enabled])

	return { outerRef, innerRef }
}
