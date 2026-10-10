"use client";

import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { useState } from "react"
import { Icon } from "../../icon"
import { Badge } from "../badge"
import { Button } from "../button/button"
import { cn } from "../../lib/cn"
import { bannerVariants } from "./banner.variants"

export interface BannerProps
	extends ComponentPropsWithRef<"div">,
		VariantProps<typeof bannerVariants> {
	/**
	 * A short scope label in a leading chip ("Preview", "Staging", a project
	 * name) — what ProjectBanner was. Reads on soft and solid fills alike.
	 */
	label?: ReactNode
	/**
	 * A trailing action (typically a Button). Its presence switches the bar to a
	 * leading-content + trailing-action layout (text left, action right) instead
	 * of the centered announcement.
	 */
	action?: ReactNode
	/** When true, render a trailing close button that hides the banner. */
	dismissible?: boolean
	/** Called after the banner is dismissed. */
	onDismiss?: () => void
	/** Stick the banner to the top of its scroll container (`sticky top-0`). */
	sticky?: boolean
	/**
	 * ARIA live-region politeness, for banners that appear or update at runtime
	 * (status bars, offline / error notices). "polite" announces on the next idle
	 * (role=status); "assertive" interrupts (role=alert). Default "off" keeps a
	 * static labelled region — correct for a banner present on first paint.
	 */
	live?: "off" | "polite" | "assertive"
}

/** A full-width, page-level announcement bar. Optionally dismissible. */
export function Banner({
	tone,
	appearance,
	label,
	action,
	dismissible,
	onDismiss,
	sticky,
	live = "off",
	className,
	children,
	...props
}: BannerProps) {
	const [visible, setVisible] = useState(true)

	if (!visible) {
		return null
	}

	function handleDismiss() {
		setVisible(false)
		onDismiss?.()
	}

	// A trailing action means leading text + trailing controls; otherwise the
	// message is centered and any dismiss button floats at the right edge so it
	// doesn't shift the centering.
	const split = action != null

	// The scope chip has to separate from the fill it sits on. A dark scrim
	// (overlay) does that on a solid TONE fill, but solid neutral is already the
	// inverted ink (near-black in light mode), where a scrim vanishes — there
	// the light secondary chip is the one that reads.
	const labelAppearance =
		appearance === "solid" && (tone ?? "neutral") !== "neutral" ? "overlay" : "soft"

	// `text-current` so the control inherits the bar's ink — legible on a soft
	// tint (foreground) and a solid fill (tone-foreground) alike.
	// Button's on-color ghost takes the banner's own ink, so it reads on every
	// tone and on solid fills without a second colour decision.
	const dismissButton = dismissible ? (
		<Button variant="on-color-ghost" size="icon-xs" aria-label="Dismiss" onClick={handleDismiss} className="shrink-0">
			<Icon name="xmark" />
		</Button>
	) : null

	// A static banner is a labelled landmark; a dynamic status bar opts into a
	// live region so screen readers announce it when it appears or changes. The
	// status/alert roles carry their own implicit politeness, so no aria-label —
	// the message itself is what should be read out.
	const a11yProps =
		live === "off"
			? { role: "region" as const, "aria-label": "Announcement" }
			: { role: live === "assertive" ? ("alert" as const) : ("status" as const) }

	return (
		<div
			{...a11yProps}
			className={cn(
				bannerVariants({ tone, appearance }),
				split ? "justify-between" : "justify-center",
				sticky && "sticky top-0 z-(--z-sticky)",
				// A centred message with a floating dismiss reserves the button's
				// width on BOTH sides: the end so long text never runs under the ×,
				// the start so the message stays optically centred.
				dismissible && !split && "px-[calc(var(--control-xs)+--spacing(4))]",
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					"flex items-center gap-3",
					split ? "min-w-0 flex-1" : "justify-center",
				)}
			>
				{label != null ? (
					<Badge size="sm" appearance={labelAppearance} className="shrink-0">
						{label}
					</Badge>
				) : null}
				{children}
			</div>
			{split ? (
				<div className="flex shrink-0 items-center gap-2">
					{action}
					{dismissButton}
				</div>
			) : dismissButton ? (
				<div className="absolute inset-y-0 end-2 flex items-center">
					{dismissButton}
				</div>
			) : null}
		</div>
	)
}
Banner.displayName = "Banner"
