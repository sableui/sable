"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * Has this element been on screen yet? For a chart's one-time arrival.
 *
 * A callback ref rather than a ref object: the observer follows whatever
 * element is actually attached, so a chart whose figure mounts late or is
 * replaced (a lazily rendered tab panel, a remount under Suspense) still
 * arrives. A ref read once inside an effect watched nothing in those cases and
 * left the chart in its hidden "out" pose for good. Scroll and resize act as a
 * fallback for environments where the observer never reports.
 */
export function useArrival<T extends Element>(): [(el: T | null) => void, boolean] {
	const [el, setEl] = useState<T | null>(null)
	const [arrived, setArrived] = useState(false)
	const ref = useCallback((node: T | null) => setEl(node), [])

	useEffect(() => {
		if (!el || arrived) return
		const onScreen = () => {
			const r = el.getBoundingClientRect()
			return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth
		}
		if (typeof IntersectionObserver === "undefined" || onScreen()) {
			setArrived(true)
			return
		}
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) setArrived(true)
		})
		observer.observe(el)
		let frame = 0
		const check = () => {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(() => onScreen() && setArrived(true))
		}
		const listeners = new AbortController()
		const { signal } = listeners
		window.addEventListener("scroll", check, { passive: true, capture: true, signal })
		window.addEventListener("resize", check, { passive: true, signal })
		return () => {
			observer.disconnect()
			cancelAnimationFrame(frame)
			listeners.abort()
		}
	}, [el, arrived])

	return [ref, arrived]
}
