"use client";

import { cloneElement, isValidElement, useRef, useState } from "react"
import type { ReactElement, Ref } from "react"
import { mergeRefs } from "../lib/refs"
import { useIsomorphicLayoutEffect } from "../lib/use-isomorphic-layout-effect"
import { useMotion } from "./MotionProvider"

/** The element's --motion-scale (1 when unset or unreadable). */
function motionScale(node: HTMLElement): number {
	const raw = Number.parseFloat(getComputedStyle(node).getPropertyValue("--motion-scale"))
	return Number.isFinite(raw) ? Math.max(0, raw) : 1
}

export interface PresenceProps {
	/** When false, the child animates out, then unmounts. */
	show: boolean
	/** A single element that accepts a ref (a DOM element or a forwardRef). */
	children: ReactElement
	/** Enter / exit durations in ms. @default { enter: 200, exit: 150 } */
	duration?: { enter?: number; exit?: number }
	/**
	 * Enter / exit easing curves. The defaults suit a small element: decelerate
	 * in, accelerate out. A large surface leaving to REVEAL what is under it (a
	 * splash, a full-bleed overlay) reads better decelerating out, so the reveal
	 * settles instead of snapping at the end.
	 * @default { enter: "cubic-bezier(0, 0, 0.2, 1)", exit: "cubic-bezier(0.4, 0, 1, 1)" }
	 */
	easing?: { enter?: string; exit?: string }
	/** Fade offset (translateY), in px. @default 8 */
	offset?: number
	/** Fires after the exit animation finishes and the child has unmounted. */
	onExitComplete?: () => void
}

/**
 * Presence — animates a single child IN when `show` flips to true and OUT before
 * it unmounts (the one motion case React + CSS can't orchestrate alone — React
 * removes the node before a CSS exit can play). Content that is already showing
 * on the first mount (show=true initially) appears without an enter animation;
 * only `show` transitions animate. Built on the Web Animations API — zero
 * dependency, compositor-friendly. Honors the motion policy (off/reduced →
 * mount/unmount with no animation). The child must accept a `ref`.
 *
 *   <Presence show={open}>
 *     <Banner>Heads up — your trial ends soon.</Banner>
 *   </Presence>
 */
export function Presence({
	show,
	children,
	duration,
	easing,
	offset = 8,
	onExitComplete,
}: PresenceProps) {
	const { enabled } = useMotion()
	const [mounted, setMounted] = useState(show)
	const nodeRef = useRef<HTMLElement | null>(null)
	const prevShow = useRef(show)
	const animRef = useRef<Animation | null>(null)
	const exitCompleteRef = useRef(onExitComplete)
	const didExit = useRef(false)

	useIsomorphicLayoutEffect(() => {
		exitCompleteRef.current = onExitComplete
	})

	// Release the animation's fill and handlers when the owner unmounts.
	useIsomorphicLayoutEffect(() => () => {
		if (!animRef.current) return
		animRef.current.onfinish = null
		animRef.current.oncancel = null
		animRef.current.cancel()
		animRef.current = null
	}, [])

	useIsomorphicLayoutEffect(() => {
		if (!mounted && didExit.current) {
			didExit.current = false
			exitCompleteRef.current?.()
		}
	}, [mounted])

	useIsomorphicLayoutEffect(() => {
		const node = nodeRef.current
		const was = prevShow.current
		prevShow.current = show
		// A policy change must settle an animation already in flight, even when
		// visibility has not changed. Changing other props does not replay it.
		if (was === show && (enabled || !animRef.current)) return

		// Cancel any in-flight animation from a previous toggle BEFORE starting a
		// new one — detach its handlers first so a cancelled exit can't fire
		// `finish` and unmount a child that is now showing again (rapid toggles).
		if (animRef.current) {
			animRef.current.onfinish = null
			animRef.current.oncancel = null
			animRef.current.cancel()
			animRef.current = null
		}

		const canAnimate = enabled && node && typeof node.animate === "function"
		// Durations follow --motion-scale like every token-driven duration, so the
		// app's motion speed (and the docs' Customize → Motion) reaches Presence too.
		const scale = node ? motionScale(node) : 1

		if (show) {
			setMounted(true)
			if (!canAnimate || !node) return
			animRef.current = node.animate(
				[
					{ opacity: 0, transform: `translateY(${offset}px)` },
					{ opacity: 1, transform: "translateY(0)" },
				],
				{
					duration: (duration?.enter ?? 200) * scale,
					easing: easing?.enter ?? "cubic-bezier(0, 0, 0.2, 1)",
					fill: "backwards",
				},
			)
			return
		}

		// Exiting.
		const finish = () => {
			if (animRef.current) {
				animRef.current.onfinish = null
				animRef.current.oncancel = null
				animRef.current.cancel()
			}
			animRef.current = null
			didExit.current = true
			setMounted(false)
		}
		if (!canAnimate || !node) {
			finish()
			return
		}
		const anim = node.animate(
			[
				{ opacity: 1, transform: "translateY(0)" },
				{ opacity: 0, transform: `translateY(${offset}px)` },
			],
			{
				duration: (duration?.exit ?? 150) * scale,
				easing: easing?.exit ?? "cubic-bezier(0.4, 0, 1, 1)",
				fill: "forwards",
			},
		)
		animRef.current = anim
		anim.onfinish = finish
		anim.oncancel = finish
	}, [show, enabled, offset, duration?.enter, duration?.exit, easing?.enter, easing?.exit])

	// Render an entering child in this commit, so the layout effect can animate
	// its actual node. A passive-effect remount misses the visibility transition.
	if (!show && !mounted) return null
	if (!isValidElement(children)) return children
	const element = children as ReactElement<{ ref?: Ref<HTMLElement> }>
	const childRef = element.props.ref
	return cloneElement(element, {
		ref: mergeRefs(nodeRef, childRef),
	})
}
Presence.displayName = "Presence"
