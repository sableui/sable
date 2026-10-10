import type { PointerEvent as ReactPointerEvent } from "react"

export interface ScrubGestureOptions {
	/** Value the drag starts from. Read once, at pointerdown. */
	value: number
	/** Units per pixel of horizontal travel. */
	step: number
	/** Clamp/round applied to every emitted value. */
	clamp: (n: number) => number
	onValueChange?: (next: number) => void
	/** Fired once, when the drag actually arms — not on pointerdown. */
	onGestureStart?: () => void
	/** Fired once, on release, only if the drag armed. */
	onGestureEnd?: () => void
	disabled?: boolean
	/**
	 * Whether to `preventDefault()` the pointerdown itself.
	 *
	 * TRUE for a decorative handle (ScrubField's glyph): nothing is lost and it
	 * suppresses the text-selection drag.
	 *
	 * FALSE for a `<label htmlFor>` (PropertyRow): the default action IS the
	 * feature — it focuses the input the label names. Prevent it and a click on
	 * the property name silently stops focusing the field, which is a worse
	 * regression than the missing gesture this exists to add.
	 *
	 * @default true
	 */
	preventDefaultOnDown?: boolean
}

/**
 * The drag-to-scrub gesture, in one place.
 *
 * Two call sites want identical behaviour and have opposite constraints. A
 * ScrubField's glyph is decorative, so it can swallow its own pointerdown. A
 * PropertyRow's label is a real `<label htmlFor>`, and the click it must not
 * swallow is the one that focuses the field — which is exactly the detail that
 * makes "just add onPointerDown to the label" wrong, and exactly why this is a
 * shared function rather than a second copy.
 *
 * The jitter threshold is what lets both be true at once: nothing happens until
 * the pointer has travelled 2px, so a click stays a click and a drag becomes a
 * drag. Below the threshold no value is emitted, no gesture is opened, and the
 * default action proceeds untouched.
 *
 * After a real drag the click that the browser synthesises on pointerup IS
 * suppressed — one-shot, in the capture phase. Otherwise releasing a scrub over
 * a label would focus the input and select its text, undoing the drag the user
 * just made.
 *
 * Listeners live on `window` rather than the element: pointer capture throws if
 * the pointer id is no longer active, and a throw here would abort before the
 * listeners attached and silently kill the drag.
 */
export function beginScrub(
	e: ReactPointerEvent<Element>,
	{
		value,
		step,
		clamp,
		onValueChange,
		onGestureStart,
		onGestureEnd,
		disabled,
		preventDefaultOnDown = true,
	}: ScrubGestureOptions,
): void {
	if (disabled) return
	if (preventDefaultOnDown) e.preventDefault()

	const startX = e.clientX
	const startValue = value
	const target = e.currentTarget
	let moved = false

	function onMove(ev: PointerEvent) {
		const dx = ev.clientX - startX
		if (!moved) {
			// Jitter guard, so a click isn't a 1px scrub.
			if (Math.abs(dx) < 2) return
			moved = true
			onGestureStart?.()
		}
		// Once armed, stop the browser turning the drag into a text selection.
		ev.preventDefault()
		// Shift = fine control, the inverse of Shift+Arrow's coarse step.
		onValueChange?.(clamp(startValue + dx * step * (ev.shiftKey ? 0.1 : 1)))
	}

	function onUp() {
		if (moved) {
			onGestureEnd?.()
			// Swallow the click this release is about to synthesise — but only
			// after a real drag, so a plain click still reaches the label.
			target.addEventListener(
				"click",
				(ev: Event) => {
					ev.preventDefault()
					ev.stopPropagation()
				},
				{ capture: true, once: true },
			)
		}
		window.removeEventListener("pointermove", onMove)
		window.removeEventListener("pointerup", onUp)
		window.removeEventListener("pointercancel", onUp)
	}

	window.addEventListener("pointermove", onMove)
	window.addEventListener("pointerup", onUp)
	window.addEventListener("pointercancel", onUp)
}
