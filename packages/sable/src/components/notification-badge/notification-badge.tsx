"use client"

import type { VariantProps } from "class-variance-authority"
import { type ComponentPropsWithRef, useState } from "react"
import { cn } from "../../lib/cn"
import { type MotionLevel, motionAttribute } from "../../motion/MotionProvider"
import { NumberTicker } from "../number-ticker/number-ticker"
import {
	notificationCountVariants,
	notificationDotVariants,
} from "./notification-badge.variants"

export interface NotificationBadgeProps
	extends ComponentPropsWithRef<"span">,
		Omit<VariantProps<typeof notificationCountVariants>, "overlay"> {
	/** Render a bare dot indicator (no number). Takes precedence over `count`. */
	dot?: boolean
	/** Unread count. Renders nothing when `<= 0` and `dot` is unset. */
	count?: number
	/** Cap before showing "{max}+". Defaults to 99. */
	max?: number
	/**
	 * Pin to the top-end corner of the nearest `relative` host (an icon button).
	 * One placement for every caller, so badges across an app sit on the same
	 * corner. @default false
	 */
	overlay?: boolean
	/**
	 * How much motion this component uses: `full` (default) inherits the app's
	 * policy, `subtle` keeps feedback and drops the flourish, `off` stills it. It
	 * can only turn motion down — it never overrides a reader's reduce-motion
	 * setting.
	 */
	motion?: MotionLevel
}

/**
 * An unread indicator. Two modes: a bare `dot`, or a `count` pill that shows
 * "{max}+" past the cap. Renders nothing when there's nothing to show. `tone`
 * picks the fill (destructive default; primary/neutral for non-alarming counts),
 * `size` scales it, and `overlay` pins it to the corner of a `relative` host.
 *
 * A count that changes rolls to its new number (NumberTicker), and a badge that
 * shows up after being empty pops in (motion-appear) — but never on first
 * paint, so a page that loads with three unread does not perform them.
 *
 * Decorative: it is `aria-hidden`, so the count reaches assistive tech through
 * the host's own name ("Notifications, 3 unread"). Pass `aria-hidden={false}`
 * only when the badge stands alone and its number is the information.
 */
export function NotificationBadge({
	dot,
	count,
	max = 99,
	tone,
	size,
	overlay = false,
	motion,
	className,
	...props
}: NotificationBadgeProps) {
	const empty = !dot && (count === undefined || count <= 0)
	// Has this badge been empty while mounted? Only then does showing it count as
	// news worth the pop. A badge that mounts with a count is page content.
	const [wasEmpty, setWasEmpty] = useState(empty)
	if (empty && !wasEmpty) setWasEmpty(true)
	const appear = wasEmpty && "motion-appear"

	if (dot) {
		return (
			<span
				data-slot="notification-badge"
				data-motion={motionAttribute(motion)}
				aria-hidden
				className={cn(notificationDotVariants({ tone, size, overlay }), appear, className)}
				{...props}
			/>
		)
	}

	if (count === undefined || count <= 0) {
		return null
	}

	const over = count > max

	return (
		<span
			data-slot="notification-badge"
			data-motion={motionAttribute(motion)}
			aria-hidden
			className={cn(notificationCountVariants({ tone, size, overlay }), appear, className)}
			{...props}
		>
			{/* A numeral centred in a small circle is the least forgiving case for
			    line-box centring — there is no descender to visually balance the
			    ascent, so any metric asymmetry reads as the count sitting high.
			    The trim wraps the ticker as it wrapped the bare label (see trimLabel).
			    Capped, the ticker holds at {max} and the "+" is a static suffix, so
			    112 → 140 does not roll at all: the badge did not change. Grouping is
			    off, as String(count) had it. */}
			<span className="sable-label-trim">
				<NumberTicker value={over ? max : count} suffix={over ? "+" : undefined} format={NO_GROUPING} motion={motion} />
			</span>
		</span>
	)
}

const NO_GROUPING: Intl.NumberFormatOptions = { useGrouping: false }
NotificationBadge.displayName = "NotificationBadge"
