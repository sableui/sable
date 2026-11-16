"use client"

import { useState, type ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { useMotionLevel, type MotionLevel } from "../../motion/MotionProvider"

export interface TextSwapProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
	text: string
	effect?: "blur" | "slide" | "fade"
	motion?: MotionLevel
}

/** A short label changing in place. One accessible string; visual copies never announce. */
export function TextSwap({ text, effect = "blur", motion, className, ...props }: TextSwapProps) {
	const policy = useMotionLevel(motion)
	const [frame, setFrame] = useState({ text, previous: "", revision: 0 })
	if (frame.text !== text) setFrame({ text, previous: frame.text, revision: frame.revision + 1 })
	return (
		<span {...props} data-slot="text-swap" data-motion={policy.attribute} className={cn("relative inline-block align-baseline", className)}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" data-effect={effect} className="relative inline-block">
				{/* The outgoing copy keeps its own one-line width: sized to the new label it
				    would wrap a longer old one onto two lines while it fades. */}
				{policy.expressive && frame.previous && <span key={`out-${frame.revision}`} data-text={frame.previous} className="motion-swap-out pointer-events-none absolute start-0 top-0 select-none whitespace-pre before:content-[attr(data-text)]" />}
				<span key={frame.revision} data-text={text} className={cn("relative inline-block whitespace-pre-wrap before:content-[attr(data-text)]", policy.expressive && frame.revision > 0 && "motion-swap-in")} />
			</span>
		</span>
	)
}
TextSwap.displayName = "TextSwap"
