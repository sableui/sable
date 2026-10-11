import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { Pill } from "../pill/pill"
import {
	bubbleTailVariants,
	bubbleReactionsVariants,
	bubbleVariants,
} from "./bubble.variants"

export interface BubbleProps extends ComponentPropsWithRef<"div"> {
	/**
	 * Surface treatment. `muted` for the other party, `primary` for the reader's
	 * own messages, `outline` for a quieter own-side, `plain` for long-form
	 * assistant output that should not sit in a box.
	 * @default "muted"
	 */
	variant?: "muted" | "primary" | "outline" | "plain"
	/**
	 * Which side of the conversation the bubble is on — puts the tail on
	 * the speaker's side. Match it to the enclosing `<Message align>`.
	 * @default "start"
	 */
	align?: "start" | "end"
	/** Draw the speaker-side tail. Turn it off for a run of grouped messages. @default true */
	tail?: boolean
}

/**
 * Bubble — the surface a message's content sits on.
 *
 * Deliberately separate from `<Message>`: the row's layout and the content's
 * surface change independently. An assistant's markdown answer wants
 * `variant="plain"` in exactly the same row a one-line reply wants a tinted
 * bubble, and a tool-call card wants no bubble at all.
 *
 *   <Message align="end">
 *     <Bubble variant="primary" align="end">Shipping it now.</Bubble>
 *   </Message>
 *
 * With reactions:
 *
 *   <Message>
 *     <Bubble>Shipping it now.</Bubble>
 *     <BubbleReactions>
 *       <BubbleReaction emoji="🎉" count={3} active onClick={() => toggle("🎉")} />
 *       <BubbleReaction emoji="👀" count={1} onClick={() => toggle("👀")} />
 *     </BubbleReactions>
 *   </Message>
 *
 * Two judgment calls worth inheriting: the bubble is capped at a readable
 * measure (~42rem) so a wide window does not produce 140-character lines, and
 * the tail is a small ear off a squared top corner, the same 5px in every
 * theme's radius language, so the speaker's side always reads.
 */
export function Bubble({
	variant = "muted",
	align = "start",
	tail = true,
	className,
	children,
	...props
}: BubbleProps) {
	const tier = useTypeTier()
	return (
		<div
			data-align={align}
			// `tier.prose` after the variants, so cn()'s paired-typography group
			// swaps the page-register size out rather than stacking a second one
			// on top of it. A transcript inside a compact Workspace has to speak
			// the tool's register — see lib/density.tsx → Registers.
			className={cn(bubbleVariants({ variant, align, tail }), tier.prose, className)}
			{...props}
		>
			{children}
			{tail && variant !== "plain" ? <BubbleTail variant={variant ?? "muted"} align={align ?? "start"} /> : null}
		</div>
	)
}

/*
 * The tail, in a 6×9.5px box whose x = 1 is the bubble's outer edge (x 0–1 tucks
 * under the bubble, so no anti-aliased seam shows where they meet): it sticks out
 * 5px and drops 7px down the bubble's side. Two shapes: rounded, a 1.6px-softened
 * tip and a 2.5px fillet where the diagonal meets the
 * bubble's side so the tail grows out of it rather than sitting on it; and sharp,
 * a plain triangle for a square theme. `sign(--radius-sm)` picks one (1 when the
 * theme rounds anything, 0 when it is square), so no preset needs its own rule.
 * Outline strokes the same outline inset by half a pixel, so its 1px edge lands
 * exactly on the bubble's border and continues it.
 */
const TAIL = {
	roundFill: "M0 0H4.4Q6 0 5.07 1.3L2.45 4.97Q1 7 1 9.5H0Z",
	sharpFill: "M0 0H6L1 7V9.5H0Z",
	roundEdge: "M0 .5H3.43Q5.03 .5 4.1 1.8L1.95 4.81Q.5 6.84 .5 9.34V9.5",
	sharpEdge: "M0 .5H5.03L.5 6.84V9.5",
}
const ROUND = "[opacity:sign(var(--radius-sm))]"
const SHARP = "[opacity:calc(1-sign(var(--radius-sm)))]"
const TAIL_FILL = { muted: "fill-muted", primary: "fill-primary", outline: "fill-card" } as const

function BubbleTail({ variant, align }: { variant: "muted" | "primary" | "outline"; align: "start" | "end" }) {
	const outline = variant === "outline"
	return (
		<svg
			aria-hidden="true"
			focusable="false"
			viewBox="0 0 6 9.5"
			className={bubbleTailVariants({ surface: outline ? "outline" : "solid", align })}
		>
			<path d={TAIL.roundFill} className={cn(TAIL_FILL[variant], ROUND)} />
			<path d={TAIL.sharpFill} className={cn(TAIL_FILL[variant], SHARP)} />
			{outline ? (
				<>
					<path d={TAIL.roundEdge} className={cn("fill-none stroke-border", ROUND)} strokeWidth={1} />
					<path d={TAIL.sharpEdge} className={cn("fill-none stroke-border", SHARP)} strokeWidth={1} />
				</>
			) : null}
		</svg>
	)
}
Bubble.displayName = "Bubble"

export interface BubbleReactionsProps extends ComponentPropsWithRef<"div"> {
	/** Match the enclosing `<Bubble align>` so the row hangs off the right edge. @default "start" */
	align?: "start" | "end"
}

/** The row of reaction pills belonging to one bubble. */
export function BubbleReactions({
	align = "start",
	className,
	...props
}: BubbleReactionsProps) {
	return (
		<div
			className={cn(bubbleReactionsVariants({ align }), className)}
			{...props}
		/>
	)
}
BubbleReactions.displayName = "BubbleReactions"

export interface BubbleReactionProps
	extends Omit<ComponentPropsWithRef<"button">, "children"> {
	/** The reaction glyph. Rendered as text, so any emoji works with no icon mapping. */
	emoji: ReactNode
	/** How many people reacted this way. Hidden at 1 — the pill already says "one". */
	count?: number
	/** The reader reacted this way. Drives `aria-pressed`, not just the styling. */
	active?: boolean
}

/**
 * One reaction pill — a toggle, not a label. It reports `aria-pressed` because
 * "did I react to this" is state a screen-reader user needs before deciding
 * whether pressing it adds or removes their reaction.
 */
export function BubbleReaction({
	emoji,
	count,
	active = false,
	className,
	...props
}: BubbleReactionProps) {
	// The pill's own height already reads the density ladder; its label has to
	// follow, or a 24px pill in a compact scope carries page-register type.
	const tier = useTypeTier()
	return (
		// Pill's own quiet chip: outline (a hairline at rest, a primary tint when
		// it is the reader's) at the xs control height. No overrides — a reaction
		// is a Pill, not a private look built on top of one.
		<Pill
			appearance="outline"
			size="sm"
			selected={active}
			className={cn(tier.secondary, className)}
			{...props}
		>
			<span aria-hidden="true">{emoji}</span>
			{count !== undefined && count > 1 ? (
				<span className="text-mono-caption tabular-nums">{count}</span>
			) : null}
		</Pill>
	)
}
BubbleReaction.displayName = "BubbleReaction"
