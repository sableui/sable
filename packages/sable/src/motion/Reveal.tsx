"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cn } from "../lib/cn"
import { useMotion } from "./MotionProvider"
import { useInView, type UseInViewOptions } from "./useInView"

export interface RevealProps
	extends ComponentPropsWithoutRef<"div">,
		UseInViewOptions {
	/** Element/component to render. @default "div" */
	as?: ElementType
	/** Stagger this reveal after the trigger, in ms. */
	delay?: number
	/**
	 * Hold the reveal until this is true, even once in view — for content that
	 * waits on an intro sequence or a load. @default true
	 */
	when?: boolean
}

/**
 * Reveal — fades + lifts its children into view the first time they scroll into
 * the viewport. Zero-dependency (IntersectionObserver + the `motion-reveal` CSS
 * recipe). Honors the motion policy: when motion is off/reduced the content is
 * shown immediately with no animation. No layout shift — it animates opacity +
 * translate only, never display.
 *
 *   <Reveal>          {/* fades up on scroll-in *​/}
 *     <Card>…</Card>
 *   </Reveal>
 */
export function Reveal({
	as,
	delay,
	when = true,
	once,
	amount,
	rootMargin,
	className,
	style,
	children,
	...props
}: RevealProps) {
	const Comp = (as ?? "div") as ElementType
	const { enabled } = useMotion()
	const { ref, inView } = useInView({ once, amount, rootMargin })
	const shown = (inView && when) || !enabled
	return (
		<Comp
			ref={ref}
			data-reveal={shown ? "in" : "out"}
			className={cn("motion-reveal", className)}
			style={delay ? {
				transitionDelay: enabled ? `calc(${delay}ms * var(--motion-scale, 1))` : "0ms",
				...style,
			} : style}
			{...props}
		>
			{children}
		</Comp>
	)
}
Reveal.displayName = "Reveal"
