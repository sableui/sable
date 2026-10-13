import type { VariantProps } from "class-variance-authority"
import {
	type ComponentPropsWithRef,
	type MouseEvent,
	type ReactNode,
	useContext,
	useRef,
	useState,
} from "react"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "../../lib/cn"
import { useTypeTier } from "../../lib/density"
import { StackedActionsContext } from "../../lib/presentation"
import { trimLabel } from "../../lib/trim-label"
import { Spinner } from "../spinner"
import { buttonVariants } from "./button.variants"

export interface ButtonProps
	extends Omit<ComponentPropsWithRef<"button">, "onClick">,
		VariantProps<typeof buttonVariants> {
	/**
	 * May return a promise: the button then shows `loading` until it settles and
	 * ignores further presses meanwhile, from the first click on (a `busy` flag
	 * in React state only takes effect a render later, so three quick clicks
	 * all ran).
	 */
	onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown
	/**
	 * Replace the rendered element or compose with another component
	 * (e.g. `render={<a href="…" />}`) through Base UI's render prop.
	 */
	render?: useRender.RenderProp
	/**
	 * Show a leading Spinner while an action is in flight, and ignore presses.
	 * Sets `aria-busy` and `aria-disabled`, not the native `disabled`: disabling
	 * the focused button dropped focus to the page, so a sheet opened by the
	 * action had nowhere to return it. @default false
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
	/**
	 * Optical alignment for a borderless button: pull the box outward on that
	 * inline side by exactly its own padding (`--button-px`, less the icon-side
	 * step when an icon sits there; an icon-only size bleeds by its inset to the
	 * glyph), so the LABEL lines up with the content edge the row shares — the
	 * grid under a SectionHeader, a card's padding. The hit area and the hover
	 * and focus fill keep their full size; on hover the fill runs past the edge.
	 * Logical sides, so it mirrors in RTL.
	 *
	 * Only the borderless variants bleed — `ghost`, `link`, `on-color-ghost`.
	 * On a variant with a visible edge (primary, secondary, outline, destructive,
	 * floating, field, on-color, on-color-outline) it does nothing: a filled
	 * button aligns its EDGE, not its label.
	 *
	 * Left unset, a borderless button bleeds when its container asks —
	 * SectionHeader, PageHeader and CardAction align their outermost ghost or
	 * link action this way. `none` opts out of that.
	 */
	bleed?: ButtonBleed
}

export type ButtonBleed = "start" | "end" | "both" | "none"

/** The variants with no visible edge — the only ones whose label can align. */
const BORDERLESS = new Set(["ghost", "link", "on-color-ghost"])

/*
 * Optical padding: one 2px step off the padding on an icon's side. Symmetric
 * padding around [icon][label] looks lopsided — the label's ink fills its box,
 * an icon's does not — so the icon side gets less. Icon-only sizes are square
 * and unaffected.
 *
 * The side's padding is named (`--button-ps` / `--button-pe`) so a bleed on that
 * side moves by what the side actually carries, not by the size's plain padding.
 */
const OPTICAL_START = "[--button-ps:calc(var(--button-px)-(--spacing(0.5)))] ps-(--button-ps)"
const OPTICAL_END = "[--button-pe:calc(var(--button-px)-(--spacing(0.5)))] pe-(--button-pe)"

/*
 * Bleed: a negative inline margin of exactly the side's padding. Containers
 * that align their actions automatically (lib/bleed.ts) write the same margin
 * against `data-bleed="auto"`.
 */
const BLEED_CLASS: Record<Exclude<ButtonBleed, "none">, string> = {
	start: "-ms-(--button-ps,var(--button-px))",
	end: "-me-(--button-pe,var(--button-px))",
	both: "-ms-(--button-ps,var(--button-px)) -me-(--button-pe,var(--button-px))",
}

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
	bleed,
	disabled,
	children,
	onClick,
	...props
}: ButtonProps) {
	const tier = useTypeTier()
	// A custom `render` element may be an <a> (or any tag) that can't take the
	// native `disabled` attribute — guard so we only set it on a real <button>.
	const isNativeButton = render === undefined
	// A promise from onClick holds the button busy until it settles. The ref
	// refuses a second press in the same tick, before the state re-renders.
	const [pending, setPending] = useState(false)
	const pendingRef = useRef(false)
	const busy = loading || pending
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		if (busy || pendingRef.current || (!isNativeButton && disabled)) {
			// Keyboard activation still reaches a button with aria-disabled (the
			// pointer does not), and so does a form's implicit submit: refuse both.
			event.preventDefault()
			return
		}
		const result = onClick?.(event)
		if (typeof (result as Promise<unknown> | undefined)?.then === "function") {
			pendingRef.current = true
			setPending(true)
			;(result as Promise<unknown>).finally(() => {
				pendingRef.current = false
				setPending(false)
			})
		}
	}
	// Text labels are wrapped so `text-box-trim` has an element to act on — the
	// property is inert on this flex container. Icons and the Spinner stay their
	// own flex items so `gap-2` keeps spacing them. See lib/trim-label.tsx.
	// In a sheet's stacked action bar every labelled button is the bar's height
	// and width, whatever size the row on a page asked for (lib/presentation).
	const stacked = useContext(StackedActionsContext) && !String(size ?? "md").startsWith("icon")
	const resolvedSize = stacked ? "cta" : (size ?? "md")
	const hasLabel = children != null && children !== false
	// The spinner takes the icon slot's size and an icon-weight ring, so it
	// reads as the icon it replaced rather than a heavier foreign object.
	const spinner = <Spinner className="size-(--button-icon)" thickness={2} />
	const start = busy ? spinner : iconStart
	// An icon-only button has one glyph slot: while loading, the spinner IS the
	// icon. Rendering it beside the glyph put two icons in a square button.
	const iconOnly = String(resolvedSize).startsWith("icon")
	const inner =
		busy && iconOnly ? (
			spinner
		) : (
			<>
				{start}
				{trimLabel(busy ? (loadingLabel ?? children) : children)}
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
				<span className="pointer-events-none absolute -end-1 -top-1 flex">{badge}</span>
			</span>
		) : (
			inner
		)
	const optical = cn(
		start && hasLabel && !iconOnly ? OPTICAL_START : null,
		iconEnd && hasLabel && !iconOnly ? OPTICAL_END : null,
	)
	// Only a borderless button can bleed, and not one stretched across a stacked
	// action bar. `auto` marks it for a container that aligns its actions.
	const bleedable = BORDERLESS.has(variant ?? "primary") && !stacked
	const resolvedBleed = bleedable ? (bleed ?? "auto") : undefined

	return useRender({
		render: render ?? <button type={type ?? "button"} />,
		ref,
		props: {
			...props,
			className: cn(
				buttonVariants({ variant, size: resolvedSize }),
				stacked ? "w-full" : null,
				tier.action,
				optical,
				resolvedBleed && resolvedBleed !== "auto" && resolvedBleed !== "none"
					? BLEED_CLASS[resolvedBleed]
					: null,
				// Busy is not disabled. Loading refuses presses so the action cannot
				// double-fire, but fading it to 50% made a working button read as an
				// unavailable one. It keeps full colour; the spinner says "working".
				busy ? "cursor-progress disabled:opacity-100 aria-disabled:opacity-100" : null,
				className,
			),
			children: content,
			onClick: handleClick,
			...(resolvedBleed ? { "data-bleed": resolvedBleed } : null),
			...(busy ? { "aria-busy": true } : null),
			// A busy native button stays focusable: aria-disabled, with presses
			// refused in handleClick. `disabled` would move focus to <body>.
			...(isNativeButton && disabled ? { disabled: true } : null),
			...(busy || (!isNativeButton && disabled) ? { "aria-disabled": true } : null),
		},
		defaultTagName: "button",
	})
}
Button.displayName = "Button"
