"use client"

import { useEffect, useRef, type ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { useMotionLevel, type MotionLevel } from "../../motion/MotionProvider"

export interface TiltProps extends ComponentPropsWithRef<"div"> {
	maxAngle?: number
	motion?: MotionLevel
}

/** A computed time ("0.2s", "200ms") in ms. */
function ms(value: string) {
	const n = Number.parseFloat(value)
	return Number.isFinite(n) ? (value.trim().split(",")[0].endsWith("ms") ? n : n * 1000) : 0
}

/**
 * Optional pointer depth. Visual samples bypass React; touch and calm motion remain static.
 *
 * The pointer comes in at an edge, where the lean is largest, so the lean ramps
 * up over the base duration (eased out) instead of jumping there; after that the
 * surface follows the pointer directly, one write per frame. Leaving eases back
 * to flat on the CSS transition. The surface takes its own compositor layer
 * (`will-change: transform`) as the lean starts, while it is still flat, and
 * gives it up once it is flat again: promoted mid-lean, the browser re-rendered
 * its text and images at a new scale, a visible pop in labels and avatars; kept
 * promoted at rest, text on a fractional pixel position drew soft.
 */
export function Tilt({ maxAngle = 6, motion, className, ref, onPointerMove, onPointerLeave, onPointerCancel, style, ...props }: TiltProps) {
	const node = useRef<HTMLDivElement>(null)
	const frame = useRef<number | null>(null)
	const sample = useRef({ x: 0, y: 0 })
	const policy = useMotionLevel(motion)
	const fine = useRef(false)
	/** When this visit's ramp began, and how long it runs; null between visits. */
	const ramp = useRef<{ start: number; duration: number } | null>(null)
	/** Drops the layer once the return to flat has finished; null when there is none to drop. */
	const release = useRef<(() => void) | null>(null)
	const reset = () => {
		if (frame.current !== null) cancelAnimationFrame(frame.current)
		frame.current = null
		const element = node.current
		const leaning = ramp.current !== null
		ramp.current = null
		if (!element) return
		element.removeAttribute("data-tracking")
		element.style.transform = style?.transform ?? ""
		if (!leaning) return
		const duration = ms(getComputedStyle(element).transitionDuration)
		let timer: ReturnType<typeof setTimeout> | undefined
		const stop = () => {
			element.removeEventListener("transitionend", onEnd)
			clearTimeout(timer)
		}
		const drop = () => {
			stop()
			element.style.willChange = ""
			release.current = null
		}
		const onEnd = (event: TransitionEvent) => { if (event.target === element && event.propertyName === "transform") drop() }
		release.current?.()
		if (!duration) return drop()
		element.addEventListener("transitionend", onEnd)
		// No transitionend when nothing visibly moved (a lean still near zero).
		timer = setTimeout(drop, duration + 50)
		release.current = stop
	}
	useEffect(() => {
		const query = window.matchMedia("(hover: hover) and (pointer: fine)")
		const update = () => { fine.current = query.matches; if (!query.matches) reset() }
		update()
		query.addEventListener("change", update)
		return () => {
			query.removeEventListener("change", update)
			reset()
			release.current?.()
			if (node.current) node.current.style.willChange = ""
		}
	}, [policy.expressive, maxAngle, style?.transform])
	const draw = (now: number) => {
		frame.current = null
		const element = node.current
		if (!element) return
		const rect = element.getBoundingClientRect()
		if (!rect.width || !rect.height) return
		if (!ramp.current) {
			ramp.current = { start: now, duration: ms(getComputedStyle(element).transitionDuration) }
			// Back before the return to flat ended: keep the layer it still has.
			release.current?.()
			release.current = null
			element.style.willChange = "transform"
			element.setAttribute("data-tracking", "")
		}
		const { start, duration } = ramp.current
		const progress = duration ? Math.min(1, Math.max(0, (now - start) / duration)) : 1
		const lean = 1 - (1 - progress) ** 3
		const clamp = (n: number) => Math.max(-1, Math.min(1, n))
		const angle = Math.max(0, Math.min(15, maxAngle)) * lean
		const x = -clamp((sample.current.y - rect.top) / rect.height * 2 - 1) * angle
		const y = clamp((sample.current.x - rect.left) / rect.width * 2 - 1) * angle
		element.style.transform = `perspective(800px) rotateX(${x}deg) rotateY(${y}deg)`
		// Still ramping: keep drawing even if the pointer has stopped.
		if (progress < 1) frame.current = requestAnimationFrame(draw)
	}
	return (
		<div {...props} ref={mergeRefs(node, ref)} data-slot="tilt" data-motion={policy.attribute} style={style}
			className={cn("transition-transform duration-(--motion-duration-base) ease-(--motion-ease-emphasized) data-[tracking]:transition-none", className)}
			onPointerMove={event => {
				onPointerMove?.(event)
				if (event.defaultPrevented || event.pointerType !== "mouse" || !policy.expressive || !fine.current || maxAngle <= 0) return
				sample.current = { x: event.clientX, y: event.clientY }
				if (frame.current === null) frame.current = requestAnimationFrame(draw)
			}}
			onPointerLeave={event => { onPointerLeave?.(event); reset() }}
			onPointerCancel={event => { onPointerCancel?.(event); reset() }}
		/>
	)
}
