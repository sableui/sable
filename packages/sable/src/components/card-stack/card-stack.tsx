"use client"

import { Children, useId, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties } from "react"
import { Button as BaseButton } from "@base-ui/react/button"
import { Button } from "../button"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { useMotionLevel, type MotionLevel } from "../../motion/MotionProvider"

export interface CardStackProps extends ComponentPropsWithRef<"div"> {
	label: string
	expanded?: boolean
	defaultExpanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	/** Use the front card itself for a collection of presentational cards. */
	trigger?: "button" | "stack"
	expandLabel?: string
	collapseLabel?: string
	motion?: MotionLevel
}

const FLIP = "card-stack-flip"

/** The first entry of a computed list, splitting on commas outside parentheses (a cubic-bezier has its own). */
function first(value: string) {
	let depth = 0
	for (let i = 0; i < value.length; i++) {
		if (value[i] === "(") depth++
		else if (value[i] === ")") depth--
		else if (value[i] === "," && depth === 0) return value.slice(0, i).trim()
	}
	return value.trim()
}

/** A computed time ("0.3s", "300ms") in ms. */
function ms(value: string) {
	const time = first(value)
	const n = Number.parseFloat(time)
	return Number.isFinite(n) ? (time.endsWith("ms") ? n : n * 1000) : 0
}

/** Where everything sits now, as drawn: the box's height and each card's centre. */
function measure(box: HTMLElement, list: HTMLElement) {
	return {
		height: box.getBoundingClientRect().height,
		centers: [...list.children].map((card) => {
			const rect = card.getBoundingClientRect()
			return rect.height ? rect.top + rect.height / 2 : null
		}),
	}
}

/**
 * A compact collection with one explicit, keyboard and touch reachable expansion control.
 *
 * Opening and closing is one movement: the box eases to its new height while
 * each card travels from where it was drawn to its new place, with the same
 * duration and curve, so the last card's edge stays on the box's edge. Changing
 * layout moves a card at once, so each one is drawn back where it was (a
 * `translate`, apart from the `transform` that holds its fanned pose) and eased
 * home. Centres, not tops, so a card's rotation doesn't count as movement.
 * Toggling again mid-way starts from what is on screen.
 */
export function CardStack({ children, label, expanded, defaultExpanded = false, onExpandedChange, trigger = "button", expandLabel = "Browse collection", collapseLabel = "Collapse collection", motion, className, ref, ...props }: CardStackProps) {
	const [local, setLocal] = useState(defaultExpanded)
	const open = expanded ?? local
	const policy = useMotionLevel(motion)
	const id = useId()
	const root = useRef<HTMLDivElement>(null)
	const box = useRef<HTMLDivElement>(null)
	const list = useRef<HTMLDivElement>(null)
	const before = useRef<ReturnType<typeof measure> | null>(null)
	const cards = Children.toArray(children)

	const toggle = () => {
		// The way it looks now, read before React moves anything.
		if (box.current && list.current) before.current = measure(box.current, list.current)
		if (expanded === undefined) setLocal(!open)
		onExpandedChange?.(!open)
	}

	useLayoutEffect(() => {
		const from = before.current
		before.current = null
		const element = root.current, outer = box.current, inner = list.current
		if (!from || !element || !outer || !inner) return
		const animations = [outer, ...inner.children].flatMap((node) => node.getAnimations?.().filter((a) => a.id === FLIP) ?? [])
		for (const animation of animations) animation.cancel()
		// Duration and curve come from the theme's tokens, through the root's
		// (inert) transition: the motion policy, the theme's speed and a subtle
		// level all reach it, and nothing here hardcodes a timing.
		const timing = getComputedStyle(element)
		const duration = ms(timing.transitionDuration)
		if (!duration || typeof outer.animate !== "function") return
		const options: KeyframeAnimationOptions = { id: FLIP, duration, easing: first(timing.transitionTimingFunction) }
		const to = measure(outer, inner)
		try {
			if (Math.abs(from.height - to.height) > 0.5) outer.animate([{ height: `${from.height}px` }, { height: `${to.height}px` }], options)
			;[...inner.children].forEach((card, index) => {
				const start = from.centers[index], end = to.centers[index]
				if (start == null || end == null || Math.abs(start - end) < 0.5) return
				card.animate([{ translate: `0 ${start - end}px` }, { translate: "0 0" }], options)
			})
		} catch {
			// A timing the engine rejects: the new layout simply stands, as with motion off.
			for (const node of [outer, ...inner.children]) for (const animation of node.getAnimations?.() ?? []) if (animation.id === FLIP) animation.cancel()
		}
	}, [open])

	return (
		<div {...props} ref={mergeRefs(root, ref)} data-slot="card-stack" data-motion={policy.attribute} data-expanded={open || undefined} role="group" aria-label={label}
			className={cn("flex flex-col gap-4 transition-none duration-[calc(var(--motion-duration-slow)*var(--motion-expressive,1))] ease-(--motion-ease-standard)", className)}>
			<div ref={box}>
				<div ref={list} id={id} className={cn("grid", open && "gap-4")}>
					{cards.map((card, index) => {
						const key = (card as { key?: string }).key ?? index
						const cardProps = {
							hidden: !open && index > 2,
							inert: !open && index > 0,
							"aria-hidden": !open && index > 0 || undefined,
							className: cn("min-w-0 motion-stack-card", !open && "col-start-1 row-start-1"),
							// Front to back in both states: a card coming out from behind the
							// front one, or going back, passes under it, never over.
							style: { zIndex: cards.length - index, "--stack-angle": `${index * 3}deg`, "--stack-shift": `${index * 0.25}rem`, "--stack-scale": 1 - index * 0.035 } as CSSProperties,
						}
						return trigger === "stack" && index === 0 && cards.length > 1
							? <BaseButton key={key} {...cardProps} render={<div />} nativeButton={false} data-slot="card-stack-trigger" className={cn(cardProps.className, "cursor-pointer rounded-lg text-start outline-none focus-visible:ring-2 focus-visible:ring-ring")} aria-expanded={open} aria-controls={id} aria-description={open ? collapseLabel : expandLabel} onClick={toggle}>{card}</BaseButton>
							: <div key={key} {...cardProps}>{card}</div>
					})}
				</div>
			</div>
			{cards.length > 1 && trigger === "button" && <Button variant="secondary" aria-expanded={open} aria-controls={id} onClick={toggle}>{open ? collapseLabel : expandLabel}</Button>}
		</div>
	)
}
CardStack.displayName = "CardStack"
