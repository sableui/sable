"use client"

import { type AnimationEvent, type CSSProperties, type ReactNode, useRef, useState } from "react"
import { cn } from "../lib/cn"
import type { PaletteColor } from "../lib/palette"
import { type MotionLevel, motionAttribute, useMotionLevel } from "./MotionProvider"

export interface BurstProps {
	/**
	 * Plays the burst each time this value changes. Nothing plays on mount, so
	 * a page that loads with a post already liked stays still. A counter that
	 * goes up on each "on" is the usual trigger; leave it alone on "off" so
	 * un-liking is quiet.
	 */
	trigger: unknown
	/**
	 * The palette families the dots take in turn. The ring blooms in the host's
	 * `currentColor` and fades into the first. Families, not colours: the
	 * palette is generated from the active theme, so the confetti re-themes
	 * with everything else. @default ["pink", "purple", "blue", "orange"]
	 */
	palette?: readonly PaletteColor[]
	/** How many places dots fly from; each throws a pair. @default 7 */
	count?: number
	/**
	 * Throw this instead of dots: copies of the glyph being celebrated (an
	 * emoji reaction), larger than a dot and with no ring, the way a reaction
	 * sprays its own emoji. Text only — it is repeated once per piece.
	 */
	particle?: ReactNode
	/**
	 * Also play once when it mounts. For a glyph that arrives BECAUSE of the
	 * action — a reaction pill that did not exist until the reader chose it —
	 * where mounting is the change. Never for a page that loads.
	 * @default false
	 */
	playOnMount?: boolean
	/** Sizing (`[--burst-size:…]`) or placement. */
	className?: string
	/**
	 * How much motion this component uses. A burst is pure flourish, so it
	 * renders only at `full`: `subtle` and `off` render nothing.
	 */
	motion?: MotionLevel
}

/**
 * The palette families lean toward the brand, so the confetti belongs to
 * whatever theme is painting. Each dot is a `data-palette` scope painting its
 * `--palette-dot` slot, the family's anchor, which is vivid in both modes.
 */
const DEFAULT_PALETTE: readonly PaletteColor[] = ["pink", "purple", "blue", "orange"]

/**
 * Burst — the follow-through after a small celebratory toggle: a disc that
 * hollows into a ring, then dots thrown outward that shrink as they go. Place
 * it inside a `relative` wrapper around the glyph it celebrates, beside a
 * `motion-bloom` on the glyph itself:
 *
 *   <span className="relative inline-flex">
 *     <span key={likes} className={liked ? "motion-bloom" : undefined}><Icon name="heart" /></span>
 *     <Burst trigger={likes} />
 *   </span>
 *
 * It sizes from `--burst-size` (the ring's diameter, default 2.25em — about
 * twice the glyph) and colours from the themed palette families. Decorative and
 * `aria-hidden`; it draws outside its box and never takes pointer events.
 * Use it for a moment of delight on an action a person chose — a like, a
 * star, a finished task — never on something the system did, and never on
 * every row of a list at once.
 */
export function Burst({
	trigger,
	palette = DEFAULT_PALETTE,
	count = 7,
	particle,
	playOnMount = false,
	className,
	motion,
}: BurstProps) {
	const { expressive } = useMotionLevel(motion)
	// Each change of `trigger` is one shot. Keyed by the shot, so a press that
	// lands mid-burst restarts it from the first frame instead of being lost.
	const [last, setLast] = useState(trigger)
	const [shot, setShot] = useState(playOnMount ? 1 : 0)
	if (!Object.is(trigger, last)) {
		setLast(trigger)
		setShot((n) => n + 1)
	}
	// When every thrown piece has landed the shot is over and the burst
	// unmounts, so a feed of liked posts keeps no invisible pieces behind.
	const [done, setDone] = useState(0)
	const landed = useRef({ shot: 0, pieces: 0 })
	if (shot === 0 || shot === done || !expressive || palette.length === 0) return null

	const places = Math.max(1, Math.round(count))
	const onAnimationEnd = (event: AnimationEvent<HTMLSpanElement>) => {
		if (!(event.target as HTMLElement).classList.contains("sable-burst-dot")) return
		if (landed.current.shot !== shot) landed.current = { shot, pieces: 0 }
		landed.current.pieces += 1
		if (landed.current.pieces >= places * 2) setDone(shot)
	}
	const step = 360 / places
	// A glyph needs about twice a dot's size to read as itself.
	const scale = particle === undefined ? 1 : 2.5
	return (
		<span
			key={shot}
			aria-hidden={true}
			data-motion={motionAttribute(motion)}
			className={cn("sable-burst [--burst-size:2.25em]", className)}
			onAnimationEnd={onAnimationEnd}
		>
			{particle === undefined ? <span className="sable-burst-ring" data-palette={palette[0]} /> : null}
			{Array.from({ length: places }, (_, i) => {
				const angle = i * step - 90
				// A pair per place: a larger dot thrown far, a smaller one a little
				// round and short of it, in the next colour, so the spray reads as
				// scattered rather than a clock face.
				return [
					{ angle, reach: 0.95, size: `calc(var(--burst-size) * ${0.14 * scale})`, family: palette[i % palette.length] },
					{
						angle: angle + step / 3,
						reach: 0.75,
						size: `calc(var(--burst-size) * ${0.1 * scale})`,
						family: palette[(i + 1) % palette.length],
					},
				].map((dot, j) => (
					<span
						key={`${i}-${j}`}
						className="sable-burst-dot"
						data-palette={particle === undefined ? dot.family : undefined}
						data-particle={particle === undefined ? undefined : ""}
						style={
							{
								"--burst-dot-angle": `${dot.angle}deg`,
								"--burst-dot-reach": dot.reach,
								"--burst-dot-size": dot.size,
							} as CSSProperties
						}
					>
						{particle}
					</span>
				))
			})}
		</span>
	)
}
