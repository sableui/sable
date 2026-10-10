"use client";

import { flushSync } from "react-dom"
import type { CSSProperties, ComponentPropsWithoutRef, ElementType } from "react"

type StartViewTransition = (callback: () => void) => unknown

/** Is the cross-document/SPA View Transitions API available? */
export function supportsViewTransitions(): boolean {
	return (
		typeof document !== "undefined" &&
		typeof (document as { startViewTransition?: StartViewTransition })
			.startViewTransition === "function"
	)
}

/** Mirrors the CSS motion policy for JS-driven transitions. */
function motionDisabled(): boolean {
	if (typeof window === "undefined" || typeof document === "undefined")
		return true
	const attr = document.documentElement.getAttribute("data-motion")
	if (attr === "off" || attr === "reduced") return true
	if (attr === "full") return false
	return !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

/**
 * Run a DOM/state update inside a View Transition so the old and new states
 * cross-fade (or morph, for elements sharing a `viewTransitionName`). Degrades in
 * a single branch: where the API is unavailable or motion is off/reduced, the
 * update runs immediately. The update is wrapped in `flushSync` so React commits
 * it synchronously inside the transition.
 *
 *   <a onClick={(e) => { e.preventDefault(); startViewTransition(() => navigate(href)) }}>
 */
export function startViewTransition(update: () => void): void {
	if (!supportsViewTransitions() || motionDisabled()) {
		update()
		return
	}
	;(
		document as unknown as { startViewTransition: StartViewTransition }
	).startViewTransition(() => {
		flushSync(update)
	})
}

export interface ViewTransitionNameProps
	extends ComponentPropsWithoutRef<"div"> {
	/** The shared `view-transition-name`. Must be unique per visible element. */
	name: string
	as?: ElementType
}

/**
 * Tags an element with a `view-transition-name` so it morphs between routes
 * during a `startViewTransition`. Give the same `name` to the before/after
 * element (e.g. a hero image present on both pages).
 */
export function ViewTransitionName({
	name,
	as,
	style,
	...props
}: ViewTransitionNameProps) {
	const Comp = (as ?? "div") as ElementType
	return (
		<Comp
			style={{ ...style, viewTransitionName: name } as CSSProperties}
			{...props}
		/>
	)
}
ViewTransitionName.displayName = "ViewTransitionName"
