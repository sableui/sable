"use client"

import { useLayoutEffect, useRef } from "react"

/**
 * HighlightGlide — one highlight that travels to the active row of a
 * Base UI list (Menu, Select, Combobox), instead of each row blinking its own
 * background on and off.
 *
 * Drop it as the FIRST child of the popup. It finds its host (the parent
 * element), follows whichever descendant carries `data-highlighted`, and
 * marks the host `data-glide` so the rows' own highlight fill steps aside
 * (styles.css → "Highlight glide"). The rows keep their `data-[highlighted]`
 * text colour and their fill as the no-JS fallback.
 *
 * Three behaviours, each fixing something a naive version gets wrong:
 *
 * - **Arrives in place.** When the highlight appears from nothing (the pointer
 *   enters, or the first arrow key), it snaps to that row and only FADES in.
 *   Sliding over from wherever it last was reads as motion from nowhere.
 * - **Leaves in place.** On exit it fades where it is, rather than collapsing
 *   toward the container origin.
 * - **Moves on the compositor.** Position is a transform; the size change rides
 *   the same short timeline. Durations are tokens, so `--motion-scale: 0`
 *   (reduced motion, MotionProvider off) makes every move instant.
 *
 * Decoration only: `aria-hidden`, no semantics. Base UI's ARIA on the rows is
 * what assistive technology reads.
 */
export function HighlightGlide({ className = "rounded-popup-item bg-accent" }: { className?: string }) {
	const ref = useRef<HTMLSpanElement>(null)

	useLayoutEffect(() => {
		const glide = ref.current
		const host = glide?.parentElement
		if (!glide || !host) return
		host.setAttribute("data-glide", "")
		let shown = false
		let frame = 0

		const place = () => {
			const row = host.querySelector<HTMLElement>("[data-highlighted]:not([data-highlight-glide])")
			if (!row) {
				shown = false
				glide.style.opacity = "0"
				return
			}
			const hostBox = host.getBoundingClientRect()
			const rowBox = row.getBoundingClientRect()
			// Bounding boxes include transforms, and popups open with a scale-in.
			// Measured mid-animation, the highlight kept the shrunken box — narrower
			// than its row and shifted off it. Undo the host's scale so the numbers
			// are layout pixels whatever frame of the animation we are on.
			const scale = host.offsetWidth > 0 ? hostBox.width / host.offsetWidth || 1 : 1
			const x = (rowBox.left - hostBox.left) / scale + host.scrollLeft - host.clientLeft
			const y = (rowBox.top - hostBox.top) / scale + host.scrollTop - host.clientTop
			const geometry = (s: CSSStyleDeclaration) => {
				s.width = `${rowBox.width / scale}px`
				s.height = `${rowBox.height / scale}px`
				s.transform = `translate(${x}px, ${y}px)`
			}
			if (!shown) {
				// Arrive in place: move with transitions off, then fade in.
				glide.style.transitionProperty = "opacity"
				geometry(glide.style)
				cancelAnimationFrame(frame)
				frame = requestAnimationFrame(() => {
					glide.style.transitionProperty = "transform, width, height, opacity"
				})
				shown = true
			} else {
				geometry(glide.style)
			}
			glide.style.opacity = "1"
		}

		place()
		const mutations = new MutationObserver(place)
		mutations.observe(host, { attributes: true, attributeFilter: ["data-highlighted"], subtree: true, childList: true })
		const resize = new ResizeObserver(place)
		resize.observe(host)
		// Capture: an inner list may be the scroller (Combobox without popup scroll).
		host.addEventListener("scroll", place, true)
		// Settle once the open animation finishes, in case a frame was skipped.
		host.addEventListener("transitionend", place)
		host.addEventListener("animationend", place)
		return () => {
			cancelAnimationFrame(frame)
			mutations.disconnect()
			resize.disconnect()
			host.removeEventListener("scroll", place, true)
			host.removeEventListener("transitionend", place)
			host.removeEventListener("animationend", place)
			host.removeAttribute("data-glide")
		}
	}, [])

	return (
		<span
			ref={ref}
			aria-hidden
			data-highlight-glide=""
			className={`pointer-events-none absolute top-0 ${className}`}
			style={{
				// Physical, not logical: the translate is measured from
				// getBoundingClientRect, which is physical in RTL too.
				left: 0,
				opacity: 0,
				transitionProperty: "opacity",
				transitionDuration: "var(--motion-duration-instant)",
				transitionTimingFunction: "var(--motion-ease-standard)",
			}}
		/>
	)
}
