"use client";

import { Avatar as Base } from "@base-ui/react/avatar"
import type { VariantProps } from "class-variance-authority"
import {
	Children,
	type ComponentProps,
	createContext,
	isValidElement,
	type ReactNode,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { mergeRefs } from "../../lib/refs"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { avatarGroupVariants, avatarVariants } from "./avatar.variants"

/**
 * Avatar — themed wrapper over Base UI's Avatar (Root + Image + Fallback). Base
 * UI tracks the image's loading status and swaps to the fallback when the source
 * is missing, still loading, or errors — no manual onError wiring needed.
 *
 * The low-level parts (AvatarRoot/AvatarImage/AvatarFallback) are exported for
 * full control, but most callers want the ergonomic <Avatar> that composes all
 * three from `src` / `alt` / `fallback`:
 *
 *   <Avatar src={user.pfp} alt={user.name} fallback="AM" size="lg" />
 */

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> &
	VariantProps<typeof avatarVariants> & {
		className?: string
	}

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>

/** Set by AvatarGroup so every avatar inside takes the group's size. */
const AvatarGroupContext = createContext<{ size: AvatarSize } | null>(null)

/** The circular frame. Clips the image; holds the `size` axis. */
export function AvatarRoot({ size, className, ...props }: RootProps) {
	const group = useContext(AvatarGroupContext)
	return (
		<Base.Root
			className={cn(avatarVariants({ size: group?.size ?? size }), className)}
			{...props}
		/>
	)
}
AvatarRoot.displayName = "AvatarRoot"

type ImageProps = Omit<ComponentProps<typeof Base.Image>, "className"> & {
	className?: string
}

/** The profile image. Fills and crops the frame; hidden by Base UI until loaded. */
export function AvatarImage({ className, ...props }: ImageProps) {
	return (
		<Base.Image
			className={cn("aspect-square size-full object-cover", className)}
			{...props}
		/>
	)
}
AvatarImage.displayName = "AvatarImage"

type FallbackProps = Omit<ComponentProps<typeof Base.Fallback>, "className"> & {
	className?: string
}

/** Shown when no image is available — typically initials or a glyph. */
export function AvatarFallback({ className, ...props }: FallbackProps) {
	return (
		<Base.Fallback
			// Type comes from the root's size (avatarVariants).
			className={cn("text-muted-foreground", className)}
			{...props}
		/>
	)
}
AvatarFallback.displayName = "AvatarFallback"

export interface AvatarProps extends RootProps {
	/** Image source. When omitted (or it fails to load), the fallback shows. */
	src?: string
	/** Alt text for the image. Falls back to an empty string for decorative use. */
	alt?: string
	/** Initials or a glyph rendered when no image is shown. */
	fallback?: ReactNode
	/** Delay before showing the fallback, in ms — avoids a flash on fast loads. */
	fallbackDelay?: number
	/**
	 * A presence indicator pinned to the bottom-end edge — usually
	 * `<StatusDot tone="success" />`. It sits outside the clipped circle and wears
	 * a ring in the surface colour (the same `--avatar-group-ring` a group uses),
	 * so it reads as a cut-out, not a sticker.
	 */
	status?: ReactNode
}

/**
 * The ergonomic, all-in-one avatar. Composes Root + Image + Fallback from simple
 * props. Pass `src`/`alt` for the picture and `fallback` for the resting state.
 */
export function Avatar({
	src,
	alt,
	fallback,
	fallbackDelay,
	size,
	status,
	className,
	...props
}: AvatarProps) {
	// Without an image the initials are the only thing on screen, and they are
	// not a name — so `alt` becomes the avatar's accessible name instead of
	// being dropped with the <img> that never rendered.
	const named = !src && alt ? { role: "img" as const, "aria-label": alt } : null
	const avatar = (
		<AvatarRoot size={size} className={status == null ? className : undefined} {...named} {...props}>
			{src ? <AvatarImage src={src} alt={alt ?? ""} /> : null}
			<AvatarFallback delay={fallbackDelay} aria-hidden={named ? true : undefined}>
				{fallback}
			</AvatarFallback>
		</AvatarRoot>
	)
	if (status == null) return avatar
	// The root clips (overflow-hidden), so the indicator needs an unclipped
	// anchor around it. `rounded-full` keeps a group's ring round on the anchor.
	return (
		<span data-slot="avatar-status-anchor" className={cn("relative inline-flex shrink-0 rounded-full", className)}>
			{avatar}
			{/* Centred ON the circle's rim at 45°, not in the bounding box's corner
			    (which lies ~15% of the size outside the circle, so the dot floated
			    off it): r(1 − 1/√2) ≈ 14.6% in from each edge, then pulled back by
			    half its own size. */}
			<span
				data-slot="avatar-status"
				className="absolute end-[14.6%] bottom-[14.6%] flex translate-x-1/2 translate-y-1/2 rounded-full rtl:-translate-x-1/2 *:ring-2 *:ring-[color:var(--avatar-group-ring,var(--background))]"
			>
				{status}
			</span>
		</span>
	)
}
Avatar.displayName = "Avatar"

export interface AvatarGroupCountProps
	extends Omit<RootProps, "children"> {
	/** How many people are not shown. Renders as "+N". */
	count: number
	/** What screen readers hear instead of "+N". Defaults to "and N more". */
	label?: string
}

/**
 * The "+N" overflow avatar at the end of a group. Sighted users see "+4";
 * screen readers hear "and 4 more" (or your `label`). AvatarGroup renders one
 * automatically when `max` or `total` leaves people out — use this part
 * directly only when you lay the stack out yourself.
 */
export function AvatarGroupCount({
	count,
	label,
	className,
	...props
}: AvatarGroupCountProps) {
	return (
		<AvatarRoot className={className} {...props}>
			<span aria-hidden className="text-muted-foreground">
				+{count}
			</span>
			<span className="sr-only">{label ?? `and ${count} more`}</span>
		</AvatarRoot>
	)
}
AvatarGroupCount.displayName = "AvatarGroupCount"

/** Two circles less one overlap, per size (see avatarGroupVariants). */
const FIT_MIN_WIDTH: Record<AvatarSize, string> = {
	sm: "min-w-15",
	md: "min-w-[--spacing(18.5)]",
	lg: "min-w-22",
}

export interface AvatarGroupProps
	extends Omit<ComponentProps<"div">, "className"> {
	/** Size of every avatar in the group: 32px / 40px / 48px. Overrides each child's own size. */
	size?: AvatarSize
	/**
	 * The surface the group sits on, so the separating ring matches it. Omit to
	 * inherit `--avatar-group-ring` from an ancestor (falling back to the page
	 * background).
	 */
	surface?: "background" | "card" | "popover" | "muted"
	/** Show at most this many avatars; the rest collapse into a "+N" count. */
	max?: number
	/**
	 * Show only as many avatars as fit the width the group is given, folding the
	 * rest into the "+N" count — "MO SR JL +4" becomes "MO SR +5" when a row
	 * gets tight, instead of the row wrapping. The group fills the space its
	 * container leaves it (`flex-1 min-w-0` in a flex row), always keeps at least
	 * one avatar, and still respects `max`.
	 */
	fit?: boolean
	/**
	 * The real number of people when you only pass some of them (e.g. the first
	 * three of 12 collaborators). The "+N" count is `total` minus the avatars shown.
	 */
	total?: number
	/** Screen-reader text for the "+N" count. Receives N; defaults to "and N more". */
	countLabel?: (count: number) => string
	className?: string
}

/**
 * AvatarGroup — an overlapping stack of avatars with an optional "+N" overflow.
 * Name the group for screen readers with `aria-label` ("12 collaborators").
 *
 *   <AvatarGroup aria-label="12 collaborators" total={12} max={3} surface="card">
 *     {people.map((p) => <Avatar key={p.id} src={p.pfp} alt={p.name} fallback={p.initials} />)}
 *   </AvatarGroup>
 */
export function AvatarGroup({
	size,
	surface,
	max,
	fit = false,
	total,
	countLabel,
	className,
	children,
	ref,
	...props
}: AvatarGroupProps) {
	const items = Children.toArray(children).filter(isValidElement)
	const people = total ?? items.length
	// How many circles (avatars + the count) fit the group's width; null until
	// measured, and always null without `fit`.
	const [slots, setSlots] = useState<number | null>(null)
	const groupRef = useRef<HTMLDivElement>(null)
	const measure = useCallback(() => {
		const el = groupRef.current
		const first = el?.firstElementChild as HTMLElement | null | undefined
		if (!fit || !el || !first) return
		const diameter = first.offsetWidth
		const second = first.nextElementSibling as HTMLElement | null
		// The step between circles is their diameter less the overlap.
		const step = second ? Math.abs(second.offsetLeft - first.offsetLeft) : diameter
		if (!diameter || !step) return
		setSlots(Math.max(1, Math.floor((el.clientWidth - diameter) / step) + 1))
	}, [fit])
	useResizeObserver(measure, [groupRef])

	let limit = max !== undefined && max >= 0 ? max : items.length
	// Out of room: give one slot to the count and fill the rest with avatars.
	if (slots !== null && Math.min(limit, items.length) + (people > Math.min(limit, items.length) ? 1 : 0) > slots) {
		limit = Math.min(limit, Math.max(1, slots - 1))
	}
	const shown = items.length > limit ? items.slice(0, limit) : items
	const overflow = Math.max(0, people - shown.length)
	const resolvedSize: AvatarSize = size ?? "md"
	return (
		<AvatarGroupContext.Provider value={{ size: resolvedSize }}>
			<div
				ref={mergeRefs(groupRef, ref)}
				role="group"
				className={cn(
					avatarGroupVariants({ size: resolvedSize, surface }),
					// Fill the space the container leaves, rather than hug the avatars,
					// so the width measured is the width available. `contain:
					// inline-size` drops the avatars from the group's min-content width;
					// without it a grid or flex parent sizes its track to fit all of
					// them, and the group is never narrow enough to fold.
					fit && "w-auto flex-1 [contain:inline-size]",
					// …but never narrower than the least it will draw (one avatar and
					// the count), so a row that cannot fit even that wraps its other
					// items instead of letting the count slide under them.
					fit && FIT_MIN_WIDTH[resolvedSize],
					className,
				)}
				{...props}
			>
				{shown}
				{overflow > 0 ? (
					<AvatarGroupCount
						count={overflow}
						label={countLabel?.(overflow)}
					/>
				) : null}
			</div>
		</AvatarGroupContext.Provider>
	)
}
AvatarGroup.displayName = "AvatarGroup"
