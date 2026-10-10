"use client";

import type { ComponentPropsWithRef } from "react"
import { useEffect, useRef } from "react"
import { cn } from "../../lib/cn"
import { useMotion } from "../../motion/MotionProvider"
import {
	ORB_PX,
	ORB_RENDERERS,
	type OrbMode,
	type OrbSize,
	orbTuning,
} from "./thinking-orb.render"

export type { OrbMode, OrbSize } from "./thinking-orb.render"

export interface ThinkingOrbProps extends ComponentPropsWithRef<"span"> {
	/**
	 * Which cloud to draw. `orbit` is the generic "working" state; `globe` reads
	 * as searching/retrieving; `mesh` as relating things to each other.
	 * @default "orbit"
	 */
	mode?: OrbMode
	/**
	 * Rendered size. `sm` (20px) sits inline in a composer or message row, `md`
	 * (32px) beside a status line, `lg` (64px) stands alone.
	 * @default "md"
	 */
	size?: OrbSize
	/** Speed multiplier on top of the per-size tuning. @default 1 */
	speed?: number
	/** Freeze on a representative frame without unmounting. @default false */
	paused?: boolean
	/**
	 * Accessible label announced by screen readers while the orb is visible.
	 * @default "Thinking"
	 */
	label?: string
}

/**
 * The box per size, on the spacing scale (5 / 8 / 16 units = 20 / 32 / 64px at
 * the default --spacing), so an orb beside a status line grows with density
 * like the text it sits next to. The canvas measures the box it actually got;
 * ORB_PX is the fallback when there is nothing to measure (SSR, jsdom).
 */
const ORB_BOX: Record<OrbSize, string> = {
	sm: "calc(var(--spacing) * 5)",
	md: "calc(var(--spacing) * 8)",
	lg: "calc(var(--spacing) * 16)",
}

/** The frame a paused / reduced-motion orb rests on — mid-cycle, not t=0. */
const STILL_T = 0.6
/** Retina is worth it; beyond 2× is paying for pixels nobody can resolve. */
const MAX_DPR = 2

/**
 * ThinkingOrb — a canvas dot-cloud "agent is thinking" indicator.
 *
 * Three modes (`orbit` / `globe` / `mesh`), each a point cloud generated per
 * frame from pure math and painted back-to-front as arcs. No Base UI, no icon
 * dependency, no animation library: one `requestAnimationFrame` loop and a 2D
 * context. Ink comes from the canvas's own computed `color`, so the orb inherits
 * the surrounding text color — set it with a semantic `text-*` utility on
 * `className`, exactly like `Spinner`.
 *
 * It is a `role="status"` live region wrapping an `aria-hidden` canvas, so the
 * wait is announced rather than being invisible to a screen reader.
 *
 * The loop is deliberately expensive-aware: a `lg` orb paints a few hundred arcs
 * per frame, so it stops entirely when the orb scrolls out of view or the tab is
 * hidden, and never starts at all when motion is off (`prefers-reduced-motion`
 * or `<MotionProvider>` off) — that case paints one still frame. Use `sm` when
 * one orb per message row is on the table; the cost is per orb, not per page.
 */
export function ThinkingOrb({
	mode = "orbit",
	size = "md",
	speed = 1,
	paused = false,
	label = "Thinking",
	className,
	style,
	ref,
	...props
}: ThinkingOrbProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const { enabled } = useMotion()
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		const dpr = Math.min(MAX_DPR, globalThis.devicePixelRatio || 1)
		// The box is sized in spacing units, so its pixel size is whatever
		// density made it. Measure it, and re-measure when density moves it.
		let px = ORB_PX[size]
		const fit = () => {
			const measured = Math.round(canvas.getBoundingClientRect().width)
			px = measured > 0 ? measured : ORB_PX[size]
			canvas.width = Math.round(px * dpr)
			canvas.height = Math.round(px * dpr)
		}
		fit()

		const render = ORB_RENDERERS[mode]
		const tuning = orbTuning(mode, size)
		const rate = tuning.speed * speed

		const draw = (t: number) => {
			// Resolved every frame rather than cached: `color` is a token the theme
			// can change under us (mode flip, theme switch, or just a different
			// text-* on an ancestor), and re-reading it is far cheaper than the arc
			// fills that follow. Canvas accepts any CSS color string, so a token
			// resolving to a wide-gamut color needs no parsing here.
			const ink = globalThis.getComputedStyle(canvas).color
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, px, px)
			ctx.fillStyle = ink
			ctx.strokeStyle = ink
			render(ctx, px, t, tuning)
		}

		const resizer =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(() => {
						fit()
						if (!enabled || paused) draw(STILL_T)
					})
		resizer?.observe(canvas)

		if (!enabled || paused) {
			draw(STILL_T)
			return () => resizer?.disconnect()
		}

		let frame = 0
		let running = false
		const tick = () => {
			draw((performance.now() / 1000) * rate)
			if (running) frame = requestAnimationFrame(tick)
		}
		const start = () => {
			if (running) return
			running = true
			frame = requestAnimationFrame(tick)
		}
		const stop = () => {
			running = false
			cancelAnimationFrame(frame)
		}

		draw((performance.now() / 1000) * rate)

		// Two independent reasons to be idle — off-screen and backgrounded — so
		// both are tracked and the loop runs only when neither applies.
		let visible = true
		const observer =
			typeof IntersectionObserver === "undefined"
				? null
				: new IntersectionObserver(([entry]) => {
						visible = entry.isIntersecting
						if (visible && document.visibilityState !== "hidden") start()
						else stop()
					})
		observer?.observe(canvas)

		const onVisibility = () => {
			if (document.visibilityState === "hidden") stop()
			else if (visible) start()
		}
		document.addEventListener("visibilitychange", onVisibility)
		if (!observer) start()

		return () => {
			stop()
			observer?.disconnect()
			resizer?.disconnect()
			document.removeEventListener("visibilitychange", onVisibility)
		}
	}, [mode, size, speed, paused, enabled])

	return (
		<span
			ref={ref}
			role="status"
			aria-label={label}
			className={cn("inline-flex items-center justify-center", className)}
			style={{ width: ORB_BOX[size], height: ORB_BOX[size], ...style }}
			{...props}
		>
			<canvas
				ref={canvasRef}
				aria-hidden="true"
				className="block size-full"
			/>
		</span>
	)
}
ThinkingOrb.displayName = "ThinkingOrb"
