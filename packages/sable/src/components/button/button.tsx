import type { VariantProps } from "class-variance-authority"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { trimLabel } from "../../lib/trim-label"
import { Spinner } from "../spinner"
import { buttonVariants } from "./button.variants"

export interface ButtonProps
	extends ComponentPropsWithRef<"button">,
		VariantProps<typeof buttonVariants> {
	/**
	 * Replace the rendered element or compose with another component
	 * (e.g. `render={<a href="…" />}`) through Base UI's render prop.
	 */
	render?: useRender.RenderProp
	/**
	 * Disable the button and show a leading Spinner while an action is in flight.
	 * Sets `aria-busy`. A native `<button>` is also `disabled`; a polymorphic
	 * `render` element (e.g. an `<a>`, which can't be disabled) gets
	 * `aria-disabled` instead. @default false
	 */
	loading?: boolean
	/** Optional text shown in place of children while loading. */
	loadingLabel?: ReactNode
	/**
	 * An icon before the label, e.g. `iconStart={<Icon name="plus" />}`. The
	 * button takes ~2px off its padding on that side so the icon and label read
	 * as centred (a glyph's visual mass sits inside its box). Replaced by the
	 * spinner while `loading`.
	 */
	iconStart?: ReactNode
	/** An icon after the label — same optical correction on the end side. */
	iconEnd?: ReactNode
	/**
	 * A corner indicator — usually `<NotificationBadge dot />` or a count —
	 * overlaid on the top-end corner of the button's glyph. Meant for icon-only
	 * sizes (a bell with an unread dot); the same anchoring BottomNavItem uses,
	 * so callers never hand-position one with absolute offsets.
	 */
	badge?: ReactNode
}

/*
 * Optical padding: one 2px step off the padding on an icon's side. Symmetric
 * padding around [icon][label] looks lopsided — the label's ink fills its box,
 * an icon's does not — so the icon side gets less. Icon-only sizes are square
 * and unaffected.
 */
const OPTICAL_START: Record<string, string> = { xs: "ps-1.5", sm: "ps-2.5", md: "ps-3.5", cta: "ps-4.5" }
const OPTICAL_END: Record<string, string> = { xs: "pe-1.5", sm: "pe-2.5", md: "pe-3.5", cta: "pe-4.5" }

/**
 * The primary action primitive. Pill-shaped by default; one `primary` per screen.
 * Corner radius is theme-driven via `--button-radius` (falls back to full pill) —
 * see `button.variants.ts`.
 */
export function Button({
	variant,
	size,
	className,
	render,
	ref,
	type,
	loading = false,
	loadingLabel,
	iconStart,
	iconEnd,
	badge,
	disabled,
	children,
	...props
}: ButtonProps) {
	const tier = useTypeTier()
	// A custom `render` element may be an <a> (or any tag) that can't take the
	// native `disabled` attribute — guard so we only set it on a real <button>.
	const isNativeButton = render === undefined
	// Text labels are wrapped so `text-box-trim` has an element to act on — the
	// property is inert on this flex container. Icons and the Spinner stay their
	// own flex items so `gap-2` keeps spacing them. See lib/trim-label.tsx.
	const resolvedSize = size ?? "md"
	const hasLabel = children != null && children !== false
	// The spinner takes the icon slot's size and an icon-weight ring, so it
	// reads as the icon it replaced rather than a heavier foreign object.
	const spinner = <Spinner className="size-(--button-icon)" thickness={2} />
	const start = loading ? spinner : iconStart
	// An icon-only button has one glyph slot: while loading, the spinner IS the
	// icon. Rendering it beside the glyph put two icons in a square button.
	const iconOnly = String(resolvedSize).startsWith("icon")
	const inner =
		loading && iconOnly ? (
			spinner
		) : (
			<>
				{start}
				{trimLabel(loading ? (loadingLabel ?? children) : children)}
				{iconEnd}
			</>
		)
	// The badge anchors to the content box (the glyph, on an icon-only size),
	// not to the button's rounded edge, so it sits on the icon's corner at every
	// control height.
	const content =
		badge != null ? (
			<span data-slot="button-badge-anchor" className="relative inline-flex items-center gap-(--control-gap)">
				{inner}
				<span className="pointer-events-none absolute -end-1 -top-1">{badge}</span>
			</span>
		) : (
			inner
		)
	const optical = cn(
		start && hasLabel ? OPTICAL_START[resolvedSize] : null,
		iconEnd && hasLabel ? OPTICAL_END[resolvedSize] : null,
	)

	return useRender({
		render: render ?? <button type={type ?? "button"} />,
		ref,
		props: {
			...props,
			className: cn(
				buttonVariants({ variant, size }),
				tier.action,
				optical,
				// Busy is not disabled. Loading sets `disabled` so the action cannot
				// double-fire, but fading it to 50% made a working button read as an
				// unavailable one. It keeps full colour; the spinner says "working".
				loading ? "cursor-progress disabled:opacity-100 aria-disabled:opacity-100" : null,
				className,
			),
			children: content,
			...(loading ? { "aria-busy": true } : null),
			...(isNativeButton
				? { disabled: disabled || loading }
				: loading || disabled
					? { "aria-disabled": true }
					: null),
		},
		defaultTagName: "button",
	})
}
Button.displayName = "Button"
