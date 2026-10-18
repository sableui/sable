"use client"

import { type CSSProperties, type MouseEvent, useMemo, useState } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import type { PaletteColor } from "../../lib/palette"
import { Burst } from "../../motion/Burst"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { Button, type ButtonProps } from "../button/button"
import { NumberTicker } from "../number-ticker/number-ticker"

type LabelledSize = "xs" | "sm" | "md"

/** A count is a label; without one the button is a square icon button. */
const ICON_SIZE = { xs: "icon-xs", sm: "icon-sm", md: "icon" } as const

export interface LikeButtonProps
	extends Omit<
		ButtonProps,
		"children" | "variant" | "size" | "iconStart" | "iconEnd" | "badge" | "loading" | "loadingLabel" | "render" | "type"
	> {
	/** Pressed (liked), controlled. */
	pressed?: boolean
	/** Pressed (liked) at first, uncontrolled. @default false */
	defaultPressed?: boolean
	/** Called when a press turns it on or off, with the new state. */
	onPressedChange?: (pressed: boolean, event: MouseEvent<HTMLButtonElement>) => void
	/**
	 * The total, shown beside the glyph and rolled when it changes. Pressing
	 * adds or removes the viewer's like at once, before your handler has saved
	 * it, and the button goes back to showing `count` exactly whenever `count`
	 * changes — so pass the server's total and update it when the save lands.
	 * Omit it for a bare glyph.
	 */
	count?: number
	/** How to write the count — `{ notation: "compact" }` for 1.2K. Passed to `Intl.NumberFormat`. */
	format?: Intl.NumberFormatOptions
	/** The glyph, by icon name. Its `solid` variant is shown while pressed. @default "heart" */
	icon?: string
	/**
	 * The palette family the glyph fills with while pressed; the burst blooms
	 * from it. A family, not a colour, so it follows the theme. @default "red"
	 */
	tone?: PaletteColor
	/** The accessible name, read before the count. @default "Like" */
	label?: string
	/** @default "ghost" */
	variant?: "ghost" | "outline" | "secondary"
	/** @default "sm" */
	size?: LabelledSize
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it.
	 * It can only turn motion down — it never overrides a reader's reduce-motion
	 * setting. The bloom and burst are the flourish; the fill and the count
	 * changing stay.
	 */
	motion?: MotionLevel
}

/**
 * LikeButton — a pressed-or-not toggle for a like, a star, a save. Pressing
 * it on fills the glyph, which blooms past its size and settles while a ring
 * and a spray of dots burst from it, and the count rolls up a digit. Pressing
 * it off is quiet: the glyph empties and the count rolls back.
 *
 *   <LikeButton count={post.likes} defaultPressed={post.liked} onPressedChange={(on) => save(on)} />
 *   <LikeButton icon="star" tone="yellow" label="Star" count={repo.stars} />
 *
 * A Sable Button carrying `aria-pressed`, with Toggle's controlled/uncontrolled
 * contract (`pressed` / `defaultPressed` / `onPressedChange`). It composes
 * Button rather than Toggle: Toggle's pressed fill is the one thing a like
 * must not show — its state is the glyph.
 */
export function LikeButton({
	className,
	count,
	format,
	icon = "heart",
	tone = "red",
	label = "Like",
	variant = "ghost",
	size = "sm",
	motion,
	pressed: pressedProp,
	defaultPressed = false,
	onPressedChange,
	onClick,
	...props
}: LikeButtonProps) {
	const [innerPressed, setInnerPressed] = useState(defaultPressed)
	const pressed = pressedProp ?? innerPressed
	// The viewer's own like, shown before `count` catches up with it: the
	// difference between pressed now and pressed when `count` last changed. A
	// new `count` is the server's answer arriving, so it resets the baseline —
	// and a controlled `pressed` the parent refused never moves the number.
	const [baseline, setBaseline] = useState({ count, pressed })
	// Object.is, so a NaN count compares equal to itself instead of resetting forever.
	if (!Object.is(count, baseline.count)) setBaseline({ count, pressed })
	const shown = count === undefined ? undefined : count + Number(pressed) - Number(baseline.pressed)
	// Goes up on each press ON that took. It keys the glyph (remounting it
	// replays the bloom) and triggers the burst, and it stays put on a press
	// off. A press arms it; the render that follows counts it only if `pressed`
	// is now on, so a controlled parent that refuses the like (signed out, rate
	// limited) gets no celebration for a heart that stays empty.
	const [likes, setLikes] = useState(0)
	const [armed, setArmed] = useState(false)
	if (armed) {
		setArmed(false)
		if (pressed) setLikes((n) => n + 1)
	}
	const formatter = useMemo(() => new Intl.NumberFormat(undefined, format), [format])

	return (
		<Button
			{...props}
			variant={variant}
			size={shown === undefined ? ICON_SIZE[size] : size}
			className={cn("tabular-nums", className)}
			aria-pressed={pressed}
			data-pressed={pressed ? "" : undefined}
			onClick={(event) => {
				onClick?.(event)
				if (event.defaultPrevented) return
				const next = !pressed
				if (pressedProp === undefined) setInnerPressed(next)
				if (next) setArmed(true)
				onPressedChange?.(next, event)
			}}
			// Named outright ("Like 1,301"): built from the label and the count's
			// own text, the two concatenated with no space between them.
			aria-label={
				props["aria-label"] ??
				(shown === undefined ? label : `${label} ${formatter.format(shown)}`)
			}
			data-motion={motionAttribute(motion)}
		>
			<span className="relative inline-flex">
				<span
					key={likes}
					// The ring leads; the glyph holds at nothing for a beat, then blooms.
					style={{ "--motion-bloom-delay": "90ms" } as CSSProperties}
					className={cn("inline-flex", pressed && likes > 0 && "motion-bloom")}
					data-palette={pressed ? tone : undefined}
				>
					<Icon
						name={icon}
						variant={pressed ? "solid" : "regular"}
						className={cn("size-(--button-icon)", pressed && "text-palette-dot")}
					/>
				</span>
				<span data-palette={tone} className="contents text-palette-dot">
					<Burst trigger={likes} motion={motion} className="[--burst-size:calc(var(--button-icon)*2.25)]" />
				</span>
			</span>
			{shown === undefined ? null : <NumberTicker value={shown} format={format} motion={motion} />}
		</Button>
	)
}
LikeButton.displayName = "LikeButton"
