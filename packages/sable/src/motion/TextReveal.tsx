"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cn } from "../lib/cn"
import { useMotion } from "./MotionProvider"
import { useInView, type UseInViewOptions } from "./useInView"

export interface TextRevealProps
	extends Omit<ComponentPropsWithoutRef<"span">, "children">,
		UseInViewOptions {
	/** The text to reveal. */
	text: string
	/** Render container element. @default "span" */
	as?: ElementType
	/** Split granularity. @default "word" */
	split?: "word" | "char"
	/** Delay between units, in ms. @default 40 */
	stagger?: number
	/**
	 * Hold the reveal until this is true, even once in view — for text that
	 * waits on an intro sequence or a load. @default true
	 */
	when?: boolean
}

/**
 * TextReveal — reveals text word-by-word (or char-by-char) with a soft staggered
 * fade-up when it scrolls into view. Zero-dependency. The whole string stays a
 * single accessible label (units are aria-hidden), and when motion is off/reduced
 * the text simply appears. Keep `split="char"` for short strings only.
 *
 *   <TextReveal as="h2" className="text-heading-1" text="Permanent by design." />
 */
export function TextReveal({
	text,
	as,
	split = "word",
	stagger = 40,
	when = true,
	once,
	amount,
	rootMargin,
	className,
	...props
}: TextRevealProps) {
	const Comp = (as ?? "span") as ElementType
	// A scroll reveal is a flourish: under "subtle" the content is simply there.
	const { expressive: enabled } = useMotion()
	const { ref, inView } = useInView({ once, amount, rootMargin })
	const shown = (inView && when) || !enabled

	const units = split === "char"
		? typeof Intl.Segmenter === "function"
			? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), ({ segment }) => segment)
			: Array.from(text)
		: text.split(/(\s+)/).filter(Boolean)
	let animatedIndex = 0

	return (
		<Comp
			ref={ref}
			className={cn("inline-block", className)}
			{...props}
		>
			{/* Real text remains readable even on elements that cannot take an accessible name. */}
			<span className="sr-only">{text}</span>
			{units.map((unit, i) => {
				// Preserve whitespace runs without animating them.
				if (/^\s+$/.test(unit)) {
					return (
						// biome-ignore lint/suspicious/noArrayIndexKey: positional text units
						<span key={i} aria-hidden>
							{unit}
						</span>
					)
				}
				const delay = animatedIndex++ * stagger
				return (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: positional text units
						key={i}
						aria-hidden
						data-reveal={shown ? "in" : "out"}
						className="motion-reveal inline-block"
						style={{ transitionDelay: enabled ? `calc(${delay}ms * var(--motion-scale, 1))` : "0ms" }}
					>
						{unit}
					</span>
				)
			})}
		</Comp>
	)
}
TextReveal.displayName = "TextReveal"
