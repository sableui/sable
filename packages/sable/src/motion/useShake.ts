"use client";

import { useCallback, useEffect, useRef, useState } from "react"
import type { AnimationEvent } from "react"

/**
 * Drives the `motion-shake` recipe: call `shake()` when an answer is refused
 * (a wrong code, a submit with invalid fields) and spread `shakeProps` on the
 * element carrying `motion-shake`.
 *
 *   const { shake, shakeProps } = useShake()
 *   <div className="motion-shake" {...shakeProps}>…</div>
 *
 * The attribute is cleared when the animation ends, so the next refusal plays
 * it again. A refusal that lands mid-shake restarts it: the attribute is
 * dropped for one frame and set again, which is the only way to replay a CSS
 * animation without remounting the element.
 *
 * The recipe's duration is expressive, so under `subtle` and reduced motion it
 * is 0 — the shake resolves instantly, and the field's own error colour and
 * message carry the refusal. Never shake without one.
 */
export function useShake(): {
	shake: () => void
	shakeProps: {
		"data-shake": "" | undefined
		onAnimationEnd: (event: AnimationEvent<HTMLElement>) => void
	}
} {
	const [shaking, setShaking] = useState(false)
	const frame = useRef(0)

	useEffect(() => () => cancelAnimationFrame(frame.current), [])

	const shake = useCallback(() => {
		cancelAnimationFrame(frame.current)
		setShaking(false)
		frame.current = requestAnimationFrame(() => {
			frame.current = requestAnimationFrame(() => setShaking(true))
		})
	}, [])

	const onAnimationEnd = useCallback((event: AnimationEvent<HTMLElement>) => {
		// Only our own animation: a descendant's animationend bubbles here too.
		if (event.target === event.currentTarget && event.animationName === "sable-shake") {
			setShaking(false)
		}
	}, [])

	return { shake, shakeProps: { "data-shake": shaking ? "" : undefined, onAnimationEnd } }
}
