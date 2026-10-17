"use client"

import { useLayoutEffect, useRef } from "react"

/**
 * How the glide is timed.
 *
 * - `highlight` (default) — a pointer/keyboard highlight in a list. It moves
 *   on every arrow key and every row the pointer crosses, so it is quick
 *   (`--motion-duration-instant`) and rides a transform. Timing is inline.
 * - `selection` — ONE fill that marks the chosen option of a segmented control.
 *   It moves only when the choice changes, so it can afford the `motion-glide`
 *   recipe's slower, emphasized travel; the caller puts `motion-glide` in
 *   `className` and the engine sets no timing of its own. It lands on its first
 *   option with no transition at all, because a fill that fades or slides in on
 *   page load is a choice the user never made.
 */
export type HighlightGlideTiming = "highlight" | "selection"

export interface HighlightGlideProps {
	/** The travelling element's look (radius, fill, and the recipe under `selection`). */
	className?: string
	/**
	 * The attribute that marks the row to follow. `data-highlighted` for Base
	 * UI's lists (the default); `data-pressed` for a single-select ToggleGroup.
	 * @default "data-highlighted"
	 */
	follow?: string
	/** @default "highlight" */
	timing?: HighlightGlideTiming
}

/**
 * The expressive multiplier on a highlight duration. The highlight is a
 * continuity flourish — the row's own text colour is the answer, the travel
 * between rows only narrates it — so it sits on the expressive level:
 * `data-motion="subtle"` (or a MotionScope) takes it to 0 and the highlight
 * simply jumps, while the fade that shows or hides it stays essential.
 */
const expressive = (token: string) => `calc(var(${token}) * var(--motion-expressive, 1))`

/**
 * HighlightGlide — one highlight that travels to the active row of a
 * Base UI list (Menu, Select, Combobox), instead of each row blinking its own
 * background on and off.
 *
 * Drop it as the FIRST child of the popup. It finds its host (the parent
 * element), follows whichever descendant carries `data-highlighted` (or the
 * `follow` attribute), and marks the host `data-glide` so the rows' own
 * highlight fill steps aside (styles.css → "Highlight glide"). The rows keep
 * their `data-[highlighted]` text colour and their fill as the no-JS fallback.
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
 *   (reduced motion, MotionProvider off) makes every move instant, and the
 *   travel is multiplied by `--motion-expressive`, so "subtle" makes it jump.
 *
 * Decoration only: `aria-hidden`, no semantics. Base UI's ARIA on the rows is
 * what assistive technology reads.
 */
export function HighlightGlide({
	className = "rounded-popup-item bg-accent",
	follow = "data-highlighted",
	timing = "highlight",
}: HighlightGlideProps) {
	const ref = useRef<HTMLSpanElement>(null)

	useLayoutEffect(() => {
		const glide = ref.current
		const host = glide?.parentElement
		if (!glide || !host) return
		host.setAttribute("data-glide", "")
		const selection = timing === "selection"
		let shown = false
		// `selection` only: nothing has been placed yet, so the next placement is
		// the first paint and must not animate from the origin.
		let placed = false
		// `selection` only: the row the fill last went to, and where it was.
		let lastRow: HTMLElement | null = null
		let lastTarget = ""
		let frame = 0

		const place = () => {
			const row = host.querySelector<HTMLElement>(`[${follow}]:not([data-highlight-glide])`)
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
			// `selection` divides by the fractional computed width: offsetWidth is
			// rounded, which left a resting segmented fill a fraction of a pixel off
			// its option — visible against a 1px track border at a 1.5× DPR.
			const layoutWidth = selection
				? Number.parseFloat(getComputedStyle(host).width) || host.offsetWidth
				: host.offsetWidth
			const scale = layoutWidth > 0 ? hostBox.width / layoutWidth || 1 : 1
			const x = (rowBox.left - hostBox.left) / scale + host.scrollLeft - host.clientLeft
			const y = (rowBox.top - hostBox.top) / scale + host.scrollTop - host.clientTop
			const geometry = (s: CSSStyleDeclaration) => {
				s.width = `${rowBox.width / scale}px`
				s.height = `${rowBox.height / scale}px`
				// `selection` rides the standalone `translate` property because that
				// is what `motion-glide` lists; `transform` would be untransitioned.
				if (selection) s.translate = `${x}px ${y}px`
				else s.transform = `translate(${x}px, ${y}px)`
			}
			if (selection) {
				// The SAME row moving or resizing — its container's width easing (a
				// Sidebar collapsing), a reflow, a scroll — is not a selection
				// change, so the fill follows it at once instead of starting a slow
				// glide toward a target that moves again next frame (the fill trailed
				// and stretched behind its row through a collapse). Only a different
				// row glides. An unchanged target is left alone, so a sibling's
				// transitionend mid-glide cannot cut the glide short.
				const target = `${x},${y},${rowBox.width / scale},${rowBox.height / scale}`
				const sameRow = placed && shown && row === lastRow
				lastRow = row
				const moved = target !== lastTarget
				lastTarget = target
				if (sameRow) {
					if (moved) {
						glide.style.transitionProperty = "none"
						geometry(glide.style)
						void glide.offsetWidth
						glide.style.transitionProperty = ""
					}
					return
				}
				if (!placed) {
					// First paint: land with no transition, then flush the style so
					// the browser records this as the starting point. Without the
					// flush, re-enabling transitions in the same frame would animate
					// from the unplaced box — a fill sliding in from the corner.
					glide.style.transitionProperty = "none"
					geometry(glide.style)
					glide.style.opacity = "1"
					void glide.offsetWidth
					glide.style.transitionProperty = ""
					placed = true
					shown = true
					return
				}
				if (!shown) {
					// Back from "nothing chosen": arrive in place and fade, as below.
					glide.style.transitionProperty = "opacity"
					geometry(glide.style)
					void glide.offsetWidth
					glide.style.transitionProperty = ""
					shown = true
				} else {
					geometry(glide.style)
				}
				glide.style.opacity = "1"
				return
			}
			if (!shown) {
				// Arrive in place: move with transitions off, then fade in.
				glide.style.transitionProperty = "opacity"
				geometry(glide.style)
				cancelAnimationFrame(frame)
				frame = requestAnimationFrame(() => {
					// Opacity first: while only opacity is listed, it takes the
					// first (essential) duration below.
					glide.style.transitionProperty = "opacity, transform, width, height"
				})
				shown = true
			} else {
				geometry(glide.style)
			}
			glide.style.opacity = "1"
		}

		place()
		const mutations = new MutationObserver(place)
		mutations.observe(host, { attributes: true, attributeFilter: [follow], subtree: true, childList: true })
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
	}, [follow, timing])

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
				...(timing === "highlight" && {
					transitionProperty: "opacity",
					// One duration per property in "opacity, transform, width, height"
					// order. The fade that shows or hides the highlight is essential;
					// the travel is expressive.
					transitionDuration: [
						"var(--motion-duration-instant)",
						expressive("--motion-duration-instant"),
						expressive("--motion-duration-instant"),
						expressive("--motion-duration-instant"),
					].join(", "),
					transitionTimingFunction: "var(--motion-ease-standard)",
				}),
			}}
		/>
	)
}
