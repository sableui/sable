"use client";

import { useEffect, useRef, useState } from "react"

export interface UseInViewOptions {
	/** Stop observing after the first time it enters view. @default true */
	once?: boolean
	/** Fraction of the element that must be visible to count (0–1). @default 0.15 */
	amount?: number
	/** IntersectionObserver rootMargin (e.g. "0px 0px -10% 0px"). */
	rootMargin?: string
}

/**
 * Observe an element's intersection with the viewport. Returns a `ref` to attach
 * and an `inView` boolean. SSR-safe and dependency-free (IntersectionObserver).
 * When IO is unavailable it reports `inView` true immediately so content is never
 * trapped hidden. Drives <Reveal>/<TextReveal>.
 */
export function useInView<T extends Element = HTMLDivElement>(
	options: UseInViewOptions = {},
) {
	const { once = true, amount = 0.15, rootMargin } = options
	const ref = useRef<T | null>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		if (typeof IntersectionObserver === "undefined") {
			setInView(true)
			return
		}
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				if (!entry) return
				if (entry.isIntersecting && entry.intersectionRatio >= amount) {
					setInView(true)
					if (once) observer.disconnect()
				} else if (!once) {
					setInView(false)
				}
			},
			{ threshold: amount, rootMargin },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [once, amount, rootMargin])

	return { ref, inView }
}
