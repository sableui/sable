import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * Renders `children` once the spot comes within about a screen of the
 * viewport, and a reserved, empty box of `minHeight` until then.
 *
 * For a docs page of many live demos (the Blocks page mounts 54 blocks): the
 * ones below the fold cost their render, their effects and their DOM before
 * anyone scrolls to them. Once mounted, a demo stays mounted, so scrolling
 * back up never resets one mid-interaction.
 *
 * Not `content-visibility: auto`: that keeps every demo mounted and only skips
 * its rendering work, and on the Customize canvas it made drags slower (the
 * restyle still reaches the skipped subtrees). This defers the mount itself.
 */
export function MountWhenVisible({
	children,
	minHeight,
	rootMargin = "100% 0px",
}: {
	children: ReactNode
	/** The space to hold before mounting: close to the demo's real height, so the page does not jump. */
	minHeight: string
	/** How far ahead of the viewport to mount. @default "100% 0px" (one screen) */
	rootMargin?: string
}) {
	const ref = useRef<HTMLDivElement>(null)
	const [shown, setShown] = useState(() => typeof IntersectionObserver === "undefined")

	// Already on screen at first render: mount before the first paint. Left to
	// the observer, whose first report comes after a paint, an above-the-fold
	// demo flashed its placeholder and then shifted the page.
	useLayoutEffect(() => {
		const el = ref.current
		if (!el) return
		const { top, bottom } = el.getBoundingClientRect()
		if (top < window.innerHeight && bottom > 0) setShown(true)
	}, [])

	useEffect(() => {
		if (shown) return
		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return
				observer.disconnect()
				setShown(true)
			},
			{ rootMargin },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [shown, rootMargin])

	if (shown) return <>{children}</>
	return <div ref={ref} aria-hidden="true" className="w-full" style={{ minHeight }} />
}
