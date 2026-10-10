import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef } from "react"
import { cn } from "../../lib/cn"
import { trimLabel } from "../../lib/trim-label"
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
}

/**
 * An unread indicator. Two modes: a bare `dot`, or a `count` pill that shows
 * "{max}+" past the cap. Renders nothing when there's nothing to show. `tone`
 * picks the fill (destructive default; primary/neutral for non-alarming counts),
 * `size` scales it, and `overlay` pins it to the corner of a `relative` host.
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
	className,
	...props
}: NotificationBadgeProps) {
	if (dot) {
		return (
			<span
				data-slot="notification-badge"
				aria-hidden
				className={cn(notificationDotVariants({ tone, size, overlay }), className)}
				{...props}
			/>
		)
	}

	if (count === undefined || count <= 0) {
		return null
	}

	const label = count > max ? `${max}+` : String(count)

	return (
		<span
			data-slot="notification-badge"
			aria-hidden
			className={cn(notificationCountVariants({ tone, size, overlay }), className)}
			{...props}
		>
			{/* A numeral centred in a small circle is the least forgiving case for
			    line-box centring — there is no descender to visually balance the
			    ascent, so any metric asymmetry reads as the count sitting high. */}
			{trimLabel(label)}
		</span>
	)
}
NotificationBadge.displayName = "NotificationBadge"
