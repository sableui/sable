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

/**
 * A duration token as the element sees it, in ms. A custom property's computed
 * value has its var()s substituted but its calc() unevaluated, so the theme's
 * `calc(300ms * var(--motion-scale))` arrives as `calc(300ms * 1)`. Handles a
 * plain time and a product of times and numbers; anything else is null and the
 * caller falls back.
 */
function durationToken(node: HTMLElement, name: string): number | null {
	const raw = getComputedStyle(node).getPropertyValue(name).trim()
	if (!raw) return null
	// Only products are understood, so grouping does not matter: drop it.
	if (/[+/]|\s-\s/.test(raw)) return null
	const body = raw.replace(/calc/g, "").replace(/[()]/g, "")
	let ms: number | null = null
	let factor = 1
	for (const term of body.split("*").map((t) => t.trim())) {
		const time = term.match(/^(-?[\d.]+)(ms|s)$/)
		if (time) {
			if (ms !== null) return null
			ms = Number(time[1]) * (time[2] === "s" ? 1000 : 1)
			continue
		}
		const n = Number(term)
		if (term === "" || !Number.isFinite(n)) return null
		factor *= n
	}
	return ms === null ? null : Math.max(0, ms * factor)
}

/** An easing token as the element sees it, or null when unset. */
function easingToken(node: HTMLElement, name: string): string | null {
	return getComputedStyle(node).getPropertyValue(name).trim() || null
}

/** The curve an exit leaves on: accelerate. The contract has no token for it. */
const EXIT_EASING = "cubic-bezier(0.4, 0, 1, 1)"

export interface PresenceProps {
	/** When false, the child animates out, then unmounts. */
	show: boolean
	/** A single element that accepts a ref (a DOM element or a forwardRef). */
	children: ReactElement
	/**
	 * Enter / exit durations in ms, multiplied by --motion-scale. Omitted, each
	 * takes the theme's `--motion-duration-enter` / `--motion-duration-exit`
	 * (already scaled), else 200 / 150.
	 */
	duration?: { enter?: number; exit?: number }
	/**
	 * Enter / exit easing curves. The defaults suit a small element: decelerate
	 * in, accelerate out. A large surface leaving to REVEAL what is under it (a
	 * splash, a full-bleed overlay) reads better decelerating out, so the reveal
	 * settles instead of snapping at the end.
	 * Omitted, enter takes the theme's `--motion-ease-decelerate`; exit keeps an
	 * accelerate curve, which the motion contract has no token for.
	 * @default { enter: "var(--motion-ease-decelerate)", exit: "cubic-bezier(0.4, 0, 1, 1)" }
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

		// Sample before canceling: removing fill first would expose a fixed pose
		// and make a rapid reversal jump. This preserves position, not velocity.
		let interrupted: Keyframe | undefined
		if (enabled && node && animRef.current) {
			const displayed = getComputedStyle(node)
			const opacity = Number.parseFloat(displayed.opacity)
			if (Number.isFinite(opacity)) interrupted = { opacity, transform: displayed.transform || "none" }
		}
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
		// A duration given as a prop follows --motion-scale like every token-driven
		// duration. Without one, the theme's enter/exit tokens apply — already
		// scaled — so a theme's tempo (Ember's slower enter, Prism's quicker one)
		// and the docs' Customize → Motion reach Presence too.
		const resolve = (given: number | undefined, token: string, fallback: number) => {
			if (!node) return given ?? fallback
			if (given !== undefined) return given * motionScale(node)
			return durationToken(node, token) ?? fallback * motionScale(node)
		}

		if (show) {
			setMounted(true)
			if (!canAnimate || !node) return
			animRef.current = node.animate(
				[
					interrupted ?? { opacity: 0, transform: `translateY(${offset}px)` },
					{ opacity: 1, transform: "translateY(0)" },
				],
				{
					duration: resolve(duration?.enter, "--motion-duration-enter", 200),
					easing: easing?.enter ?? easingToken(node, "--motion-ease-decelerate") ?? "cubic-bezier(0, 0, 0.2, 1)",
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
				interrupted ?? { opacity: 1, transform: "translateY(0)" },
				{ opacity: 0, transform: `translateY(${offset}px)` },
			],
			{
				duration: resolve(duration?.exit, "--motion-duration-exit", 150),
				easing: easing?.exit ?? EXIT_EASING,
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
