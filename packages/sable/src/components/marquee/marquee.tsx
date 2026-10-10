"use client";

import { useCallback, useMemo, useRef, useState } from "react"
import type { CSSProperties, ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { PlayPauseGlyph } from "../../lib/glyphs"
import { mergeRefs } from "../../lib/refs"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { useMotion } from "../../motion/MotionProvider"
import { Button } from "../button/button"

export interface MarqueeProps
	extends Omit<ComponentPropsWithRef<"div">, "dir"> {
	children: ReactNode
	/** Scroll direction. @default "left" */
	direction?: "left" | "right" | "up" | "down"
	/** Constant speed in px/s — independent of content length. @default 40 */
	speed?: number
	/**
	 * Gap between items (any CSS length). Prefer a spacing-scale value so it
	 * moves with density, e.g. `"calc(var(--spacing) * 4)"`.
	 * @default "calc(var(--spacing) * 8)"
	 */
	gap?: string
	/** Pause while hovered or keyboard-focused (WCAG 2.2.2). @default true */
	pauseOnHover?: boolean
	/** Render a visible pause/play control — recommended for WCAG 2.2.2 when content auto-scrolls. @default false */
	controls?: boolean
	/** Controlled play state (overrides the internal pause control — e.g. an app-level motion toggle). */
	play?: boolean
	/** Notified when the play state changes via the control. */
	onPlayChange?: (play: boolean) => void
	/** Fade the leading/trailing edges with a mask. @default false */
	fade?: boolean
	/** Accessible label for the scrolling region (only set a role/name when meaningful). */
	label?: string
}

/**
 * Marquee — a seamless, constant-speed infinite loop (logos, tags, testimonials).
 * Zero-dependency: it duplicates its children into enough groups to cover the
 * track, measures one group, and advances exactly one group + gap per iteration
 * so the loop never seams. Pauses on hover/focus, and respects the motion policy
 * — when motion is off/reduced it stops and becomes a normal scroll region.
 *
 *   <Marquee>
 *     {logos.map((l) => <img key={l.id} src={l.src} alt={l.name} />)}
 *   </Marquee>
 */
export function Marquee({
	children,
	direction = "left",
	speed = 40,
	gap = "calc(var(--spacing) * 8)",
	pauseOnHover = true,
	controls = false,
	play,
	onPlayChange,
	fade = false,
	label,
	className,
	style,
	ref,
	...props
}: MarqueeProps) {
	const { enabled } = useMotion()
	const [userPaused, setUserPaused] = useState(false)
	const isPaused = play != null ? !play : userPaused
	const togglePlay = () => {
		if (play != null) onPlayChange?.(!play)
		else setUserPaused((p) => !p)
	}
	const containerRef = useRef<HTMLDivElement | null>(null)
	const groupRef = useRef<HTMLDivElement | null>(null)
	const [copies, setCopies] = useState(2)
	const [metrics, setMetrics] = useState({ distance: 0, duration: 0 })

	const vertical = direction === "up" || direction === "down"
	const reverse = direction === "right" || direction === "down"

	const measure = useCallback(() => {
		const container = containerRef.current
		const group = groupRef.current
		if (!container || !group) return
		const cs = getComputedStyle(group)
		const gapPx =
			Number.parseFloat(vertical ? cs.rowGap : cs.columnGap) || 0
		const groupSize = vertical ? group.offsetHeight : group.offsetWidth
		const containerSize = vertical
			? container.offsetHeight
			: container.offsetWidth
		if (groupSize <= 0) return
		// One full group + the gap that follows it — the exact advance per loop.
		const distance = groupSize + gapPx
		const duration = distance / speed
		// Enough groups so that after advancing one, the rest still cover the view.
		const needed = Math.min(
			8,
			Math.max(2, Math.ceil(containerSize / distance) + 1),
		)
		setCopies((c) => (c === needed ? c : needed))
		// Dead zone (mirrors the carousel's pitch guard) so a sub-pixel reflow
		// doesn't rewrite animationDuration and restart/seam the keyframe.
		setMetrics((m) =>
			Math.abs(m.distance - distance) < 0.5 &&
			Math.abs(m.duration - duration) < 0.01
				? m
				: { distance, duration },
		)
	}, [speed, vertical])

	useResizeObserver(measure, [containerRef, groupRef])
	const setContainer = useMemo(() => mergeRefs(containerRef, ref), [ref])

	const animate = enabled && metrics.duration > 0
	const trackStyle: Record<string, string | number | undefined> = { gap }
	if (animate) {
		trackStyle["--sable-marquee-distance"] = `${metrics.distance}px`
		trackStyle.animationName = vertical ? "sable-marquee-y" : "sable-marquee-x"
		trackStyle.animationDuration = `${metrics.duration}s`
		trackStyle.animationTimingFunction = "linear"
		trackStyle.animationIterationCount = "infinite"
		trackStyle.animationDirection = reverse ? "reverse" : "normal"
		trackStyle.willChange = "transform"
		if (isPaused) trackStyle.animationPlayState = "paused"
	}

	const groups = animate ? copies : 1
	const fadeMask = fade
		? // design-lint-disable-next-line inline-color -- CSS edge-fade mask: #000 is alpha-mask machinery (only the mask alpha matters), not a rendered color
			`linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, #000 calc(var(--spacing) * 8), #000 calc(100% - var(--spacing) * 8), transparent)`
		: undefined

	return (
		<div
			ref={setContainer}
			data-sable-marquee=""
			data-pause-on-hover={pauseOnHover ? "" : undefined}
			role={label ? "group" : undefined}
			aria-label={label}
			className={cn(
				"group/marquee relative max-w-full overflow-hidden",
				// When motion is off, fall back to a normal scroll region.
				!animate &&
					(vertical
						? "overflow-y-auto overscroll-contain scrollbar-quiet"
						: "overflow-x-auto overscroll-x-contain scrollbar-quiet"),
				className,
			)}
			style={{ ...style, maskImage: fadeMask, WebkitMaskImage: fadeMask }}
			{...props}
		>
			{controls && animate && (
				// The floating Button — the same control that sits over Carousel's
				// slides and MessageScroller's thread, read over moving content.
				<Button
					variant="floating"
					size="icon-xs"
					onClick={togglePlay}
					aria-label={isPaused ? "Play" : "Pause"}
					className="absolute right-1 top-1 z-10"
				>
					<PlayPauseGlyph playing={!isPaused} />
				</Button>
			)}
			<div
				data-sable-marquee-track=""
				className={cn(
					"flex",
					// Vertical track is absolute ONLY while animating, so it doesn't
					// drive container height (the feedback loop). When motion is
					// off it stays in-flow so the scroll fallback has content.
					vertical
						? animate
							? "absolute inset-x-0 top-0 flex-col"
							: "flex-col"
						: "w-max",
				)}
				style={trackStyle as CSSProperties}
			>
				{Array.from({ length: groups }, (_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed-order duplicate groups
						key={i}
						ref={i === 0 ? groupRef : undefined}
						aria-hidden={i > 0 ? true : undefined}
						inert={i > 0 || undefined}
						className={cn(
							"flex shrink-0 items-center",
							vertical ? "flex-col" : "w-max",
						)}
						style={{ gap }}
					>
						{children}
					</div>
				))}
			</div>
		</div>
	)
}
Marquee.displayName = "Marquee"
