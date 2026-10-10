import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { trimLabel } from "../../lib/trim-label"
import { StatusDot } from "../status-dot"
import { type BadgeAppearance, type BadgeTone, badgeVariants } from "./badge.variants"

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
	/** How it is drawn: soft fill, outline, solid, on media, or plain text. @default "soft" */
	appearance?: BadgeAppearance
	/** What it means. @default "neutral" */
	tone?: BadgeTone
	/** @default "md" */
	size?: "sm" | "md"
	/** A leading icon. Ignored when `dot` is set. */
	icon?: ReactNode
	/** A leading status dot in the badge's tone — a status line with `appearance="plain"`. */
	dot?: boolean
	/** Pulse the dot, for something in progress. Needs `dot`. */
	pulse?: boolean
}

/**
 * Badge — a compact, static label. Pick how it is drawn (`appearance`) and what
 * it means (`tone`) separately; add `dot` for a status. One component covers
 * metadata tags, tone-coded labels, badges on artwork (`overlay`) and status
 * lines (`plain` + `dot`). For a chip someone clicks to filter or toggle, use
 * Pill; for an unread count on an icon, NotificationBadge.
 *
 *   <Badge>Draft</Badge>
 *   <Badge tone="edition">12 of 50</Badge>
 *   <Badge appearance="overlay">0:42</Badge>
 *   <Badge appearance="plain" tone="success" dot>Ready</Badge>
 */
export function Badge({
	appearance = "soft",
	tone = "neutral",
	size,
	icon,
	dot = false,
	pulse = false,
	className,
	children,
	...props
}: BadgeProps) {
	return (
		<span className={cn(badgeVariants({ appearance, tone, size }), "[&_svg]:shrink-0", className)} {...props}>
			{dot ? <StatusDot tone={tone} pulse={pulse} size={size === "sm" ? "sm" : "md"} /> : icon}
			{trimLabel(children)}
		</span>
	)
}
Badge.displayName = "Badge"
