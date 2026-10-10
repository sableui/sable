"use client"

import type { ComponentPropsWithoutRef, ElementType } from "react"
import { cn } from "../../lib/cn"
import { useMotion } from "../../motion/MotionProvider"

export interface StreamingTextProps
	extends Omit<ComponentPropsWithoutRef<"p">, "children"> {
	/**
	 * The text received SO FAR. Grow it as tokens arrive; this component assumes
	 * the string only ever gets longer at the end.
	 */
	text: string
	/**
	 * Whether more is still coming. Drives the caret, the softened tail, and
	 * `aria-busy`. @default false
	 */
	streaming?: boolean
	/** Render container element. @default "p" */
	as?: ElementType
	/**
	 * Split granularity. `word` is right for prose; `char` costs one element per
	 * character and is for short strings only. @default "word"
	 */
	split?: "word" | "char"
	/**
	 * Show the caret while streaming. Turn it off when something else already
	 * says "working" beside this text — two indicators for one wait is one too
	 * many. @default true
	 */
	caret?: boolean
}

/**
 * StreamingText — prose arriving from a live source, a token at a time.
 *
 * Three things happen together, and they are the whole component:
 *
 * 1. **Each token resolves out of blur** rather than fading. A fade makes every
 *    word a separate event; blur reads as the word coming into focus, so a
 *    paragraph arrives as one sentence being written instead of a queue.
 * 2. **The trailing edge stays soft** while streaming. A hard cut at the newest
 *    token reads as a sentence that has ENDED — the reader waits for a period
 *    that is not coming. The mask says "more is on the way" and costs no
 *    animation to say it.
 * 3. **The caret is steady, not blinking.** A blink while tokens arrive puts two
 *    rhythms on screen at once — text advancing at one rate, a caret flashing at
 *    another — and the flashing one carries no information, because the moving
 *    text already proves work is happening. Steady reads calm, and the caret
 *    disappearing is what marks completion.
 *
 *    (The `motion-caret` recipe DOES blink without `data-streaming="true"`. That
 *    is for surfaces which keep a caret at rest, like a composer or a terminal.
 *    Here the caret only exists while streaming, so it is always the steady one.)
 *
 * Not TextReveal (exported from `motion/`). That one stages text that is already here, on scroll, with a
 * computed stagger. Nothing here knows the final length, so there is no stagger
 * to compute: tokens animate once, on mount, because React only mounts the new
 * ones. Re-rendering a grown string does not re-animate what was already shown.
 *
 * Accessibility: the text is real text in the accessibility tree, not a set of
 * aria-hidden fragments — a screen reader concatenates the spans. `aria-busy`
 * marks the container while output is incomplete. Deliberately NOT an aria-live
 * region: announcing every token is unusable, and the caller usually wants one
 * announcement when the answer settles, which belongs to whatever owns the turn.
 *
 *   <StreamingText text={answer} streaming={pending} />
 */
export function StreamingText({
	text,
	streaming = false,
	as,
	split = "word",
	caret = true,
	className,
	...props
}: StreamingTextProps) {
	const Comp = (as ?? "p") as ElementType
	const { enabled } = useMotion()

	/*
	 * Keyed by INDEX, and that is load-bearing rather than the usual React
	 * shortcut. Tokens only ever append, so index is stable for everything
	 * already on screen: React mounts exactly the new spans, their mount-time
	 * animation runs once, and nothing already visible re-animates. A
	 * content-derived key would collide on any repeated word and re-run the blur
	 * on text the reader has already read.
	 */
	const units =
		split === "char" ? Array.from(text) : text.split(/(\s+)/).filter(Boolean)
	const last = units.length - 1

	return (
		<Comp
			aria-busy={streaming || undefined}
			className={cn("text-body-md text-foreground", className)}
			{...props}
		>
			{units.map((unit, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: append-only stream — see note above
					key={i}
					className={cn(
						enabled && "motion-stream-in",
						// Only the newest unit, and only mid-stream. Softening a run that
						// has stopped growing would leave the answer permanently out of
						// focus at its own last word.
						enabled && streaming && i === last && "stream-tail",
					)}
				>
					{unit}
				</span>
			))}
			{streaming && caret ? (
				<span
					aria-hidden
					data-streaming="true"
					className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] rounded-full bg-foreground align-baseline motion-caret"
				/>
			) : null}
		</Comp>
	)
}
