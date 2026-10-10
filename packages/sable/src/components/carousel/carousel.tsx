"use client";

import {
	Children,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	useSyncExternalStore,
} from "react"
import type {
	CSSProperties,
	PointerEvent as ReactPointerEvent,
	ReactNode,
} from "react"
import { Icon } from "../../icon/Icon"
import { cn } from "../../lib/cn"
import { PlayPauseGlyph } from "../../lib/glyphs"
import { useResizeObserver } from "../../lib/use-resize-observer"
import { useMotion } from "../../motion/MotionProvider"
import { Button } from "../button/button"

/** Tailwind's default min-width breakpoints, smallest first. */
const CAROUSEL_BREAKPOINTS = [
	["sm", 640],
	["md", 768],
	["lg", 1024],
	["xl", 1280],
] as const

/**
 * Slides per view — a number, or a mobile-first breakpoint set
 * (`{ base: 1, sm: 2, lg: 3 }`). A missing key inherits from the next smaller
 * defined one; `base` defaults to 1.
 */
export type CarouselSlidesToShow =
	| number
	| { base?: number; sm?: number; md?: number; lg?: number; xl?: number }

/** Resolve a breakpoint set against the viewport; server snapshot is `base`. */
function useSlidesToShow(value: CarouselSlidesToShow): number {
	const set = typeof value === "number" ? null : value
	const base = typeof value === "number" ? value : (value.base ?? 1)
	// Primitive key so an inline object literal doesn't resubscribe every render.
	const key = set ? CAROUSEL_BREAKPOINTS.map(([bp]) => set[bp] ?? "").join() : ""
	const subscribe = useCallback(
		(onChange: () => void) => {
			if (!key || typeof window === "undefined" || !window.matchMedia)
				return () => {}
			const mqls = CAROUSEL_BREAKPOINTS.map(([, px]) =>
				window.matchMedia(`(min-width: ${px}px)`),
			)
			for (const mql of mqls) mql.addEventListener?.("change", onChange)
			return () => {
				for (const mql of mqls) mql.removeEventListener?.("change", onChange)
			}
		},
		[key],
	)
	const getSnapshot = () => {
		if (!set || typeof window === "undefined" || !window.matchMedia) return base
		let n = base
		for (const [bp, px] of CAROUSEL_BREAKPOINTS) {
			const v = set[bp]
			if (v != null && window.matchMedia(`(min-width: ${px}px)`).matches) n = v
		}
		return n
	}
	return useSyncExternalStore(subscribe, getSnapshot, () => base)
}

export interface CarouselProps {
	/** Each top-level child becomes one slide. */
	children: ReactNode
	/**
	 * Slides visible per view — a number, or a breakpoint set like
	 * `{ base: 1, sm: 2, lg: 3 }` (Tailwind's 640/768/1024/1280px min-widths;
	 * missing keys inherit from the next smaller one). @default 1
	 */
	slidesToShow?: CarouselSlidesToShow
	/** Gap between slides (any CSS length). @default "0px" */
	gap?: string
	/** Infinite loop (clones at both ends). @default false */
	loop?: boolean
	/** Auto-advance interval in ms (0 = off). Pauses on hover/focus/reduced-motion. @default 0 */
	autoplay?: number
	/** Prev/next arrow buttons. @default true */
	arrows?: boolean
	/** Pagination dots. @default true */
	dots?: boolean
	/** An N / M slide counter. @default false */
	counter?: boolean
	/** Pointer drag-to-swipe. @default true */
	draggable?: boolean
	/** Controlled active index. */
	index?: number
	/** Initial index (uncontrolled). @default 0 */
	defaultIndex?: number
	/** Notified when the active index changes. */
	onIndexChange?: (index: number) => void
	/** Accessible label for the carousel region. */
	label?: string
	className?: string
	/** Class for the slide wrapper (e.g. aspect ratio). */
	slideClassName?: string
	/**
	 * Class for both prev/next arrow buttons — the theme-level restyle hook.
	 * The arrows are Sable `Button`s, so their radius follows `--button-radius`
	 * (full pill by default). Merged through `cn()`, so a radius or shadow
	 * utility here REPLACES the default rather than stacking with it (e.g.
	 * `rounded-md shadow-none` for a flat, square-cornered chrome). Applies to
	 * the arrows only; the dots and the autoplay toggle keep their own shells.
	 */
	arrowClassName?: string
}

/** Prev/next overlay arrow — shared shell so the two arrows can't drift. */
function CarouselArrowButton({
	side,
	onClick,
	disabled,
	className,
}: {
	side: "prev" | "next"
	onClick: () => void
	disabled: boolean
	className?: string
}) {
	return (
		<Button
			variant="floating"
			size="icon-sm"
			onClick={onClick}
			disabled={disabled}
			aria-label={side === "prev" ? "Previous slide" : "Next slide"}
			// Button's `floating` tier owns the surface that reads over imagery
			// (edge, lift, translucent popover fill); this only positions it and
			// fades it out (rather than dims it) at a non-looping end.
			className={cn(
				"absolute top-1/2 z-10 -translate-y-1/2 disabled:opacity-0",
				side === "prev" ? "left-3" : "right-3",
				className,
			)}
		>
			<Icon name={side === "prev" ? "chevron-left" : "chevron-right"} />
		</Button>
	)
}

/**
 * Carousel — a generic, accessible, zero-dependency slide carousel. Transform
 * track with measured slide pitch; supports multiple slides per view, an
 * infinite `loop` (cloned ends), pointer drag-to-swipe with snap, `autoplay`
 * (with a pause control and hover/focus/reduced-motion pausing), arrows, dots,
 * a counter, and keyboard. Each top-level child is a slide:
 *
 *   <Carousel loop arrows dots>
 *     <img src="…" alt="…" />
 *     <img src="…" alt="…" />
 *   </Carousel>
 *
 * Motion is token-driven, so transitions go instant under the motion policy.
 */
export function Carousel({
	children,
	slidesToShow = 1,
	gap = "0px",
	loop = false,
	autoplay = 0,
	arrows = true,
	dots = true,
	counter = false,
	draggable = true,
	index: controlledIndex,
	defaultIndex = 0,
	onIndexChange,
	label,
	className,
	slideClassName,
	arrowClassName,
}: CarouselProps) {
	const { enabled } = useMotion()
	const slides = Children.toArray(children)
	const count = slides.length
	const perView = Math.min(
		Math.max(useSlidesToShow(slidesToShow), 1),
		Math.max(count, 1),
	)
	const canLoop = loop && count > perView
	const clones = canLoop ? perView : 0
	const maxIndex = canLoop ? count - 1 : Math.max(0, count - perView)

	const baseId = useId()
	const viewportRef = useRef<HTMLDivElement | null>(null)
	const slideRef = useRef<HTMLDivElement | null>(null)
	// Tracks the in-flight target so rapid clicks advance N pages (no creep).
	const logicalRef = useRef(0)
	// The last settled index — lets the controlled effect ignore the echo of our
	// own onIndexChange and dedupes no-op commits. Seeded to the initial index so
	// the first navigation to a non-zero start (or back to 0) isn't mis-skipped.
	const committedRef = useRef(
		Math.min(Math.max(controlledIndex ?? defaultIndex, 0), maxIndex),
	)

	const [uncontrolled, setUncontrolled] = useState(() =>
		Math.min(Math.max(defaultIndex, 0), maxIndex),
	)
	const logical = Math.min(
		Math.max(controlledIndex ?? uncontrolled, 0),
		maxIndex,
	)
	logicalRef.current = logical

	const [docHidden, setDocHidden] = useState(false)
	useEffect(() => {
		if (typeof document === "undefined") return
		const onVis = () => setDocHidden(document.hidden)
		document.addEventListener("visibilitychange", onVis)
		return () => document.removeEventListener("visibilitychange", onVis)
	}, [])

	// `position` is the track slot (including clones). It can briefly sit on a
	// clone during a loop wrap, then snaps back to the real equivalent.
	const [position, setPosition] = useState(logical + clones)
	const [pitch, setPitch] = useState(0)
	const [animating, setAnimating] = useState(false)
	const [drag, setDrag] = useState<{ start: number; delta: number } | null>(
		null,
	)
	const [playing, setPlaying] = useState(autoplay > 0)
	const [hovered, setHovered] = useState(false)
	const [focused, setFocused] = useState(false)

	// Keep position in sync with an EXTERNAL controlled index change. Skip the
	// echo of our own goTo (committedRef), which already positioned the track —
	// possibly on a clone for a seamless wrap that this must not overwrite.
	useEffect(() => {
		if (controlledIndex == null || controlledIndex === committedRef.current)
			return
		const clamped = Math.min(Math.max(controlledIndex, 0), maxIndex)
		// Track the synced value so a later external re-set to a PRIOR value still
		// registers (committedRef must reflect every settled index, not just ours).
		committedRef.current = clamped
		setPosition(clamped + clones)
		setAnimating(enabled)
	}, [controlledIndex, clones, maxIndex, enabled])

	// Re-seat the track when the per-view count changes (a breakpoint crossing):
	// the clone count and the last reachable index move with it.
	const layoutRef = useRef({ clones, maxIndex })
	useEffect(() => {
		const prev = layoutRef.current
		if (prev.clones === clones && prev.maxIndex === maxIndex) return
		layoutRef.current = { clones, maxIndex }
		setAnimating(false)
		setPosition(logicalRef.current + clones)
	}, [clones, maxIndex])

	// Measure the slide pitch (slide size + gap), pre-paint and on resize.
	const measure = useCallback(() => {
		const slide = slideRef.current
		const track = viewportRef.current?.firstElementChild
		if (!slide || !track) return
		const gapPx = Number.parseFloat(getComputedStyle(track).columnGap) || 0
		const next = slide.offsetWidth + gapPx
		if (next > 0) setPitch((p) => (Math.abs(p - next) < 0.5 ? p : next))
	}, [])
	useResizeObserver(measure, [viewportRef, slideRef])

	const commitIndex = useCallback(
		(next: number) => {
			// No-op when the index didn't change — avoids spamming onIndexChange
			// when arrow-key repeat lands on a non-loop boundary.
			if (next === committedRef.current) return
			committedRef.current = next
			if (controlledIndex == null) setUncontrolled(next)
			onIndexChange?.(next)
		},
		[controlledIndex, onIndexChange],
	)

	const goTo = useCallback(
		(targetLogical: number, animate = true) => {
			const wrapped = canLoop
				? ((targetLogical % count) + count) % count
				: Math.min(Math.max(targetLogical, 0), maxIndex)
			logicalRef.current = wrapped

			if (canLoop && (targetLogical < 0 || targetLogical >= count)) {
				// Wrap: animate into the clone slot, then snap to the real one.
				const clonePos = targetLogical + clones
				if (animate && enabled) {
					setAnimating(true)
					setPosition(clonePos)
				} else {
					setPosition(wrapped + clones)
				}
			} else {
				setAnimating(animate && enabled)
				setPosition(wrapped + clones)
			}
			commitIndex(wrapped)
		},
		[canLoop, count, maxIndex, clones, enabled, commitIndex],
	)

	const next = useCallback(() => goTo(logicalRef.current + 1), [goTo])
	const prev = useCallback(() => goTo(logicalRef.current - 1), [goTo])

	// After a wrap animation, jump (no transition) back to the real slot. Guarded
	// so a child's bubbling transitionend (e.g. a hover button) can't trigger it.
	const onTrackTransitionEnd = useCallback(
		(e: React.TransitionEvent) => {
			if (e.target !== e.currentTarget || e.propertyName !== "translate") return
			setAnimating(false)
			if (!canLoop) return
			if (position < clones) setPosition(position + count)
			else if (position >= clones + count) setPosition(position - count)
		},
		[canLoop, clones, count, position],
	)

	// ---- Pointer drag ------------------------------------------------------
	const dragState = useRef<{
		id: number
		startX: number
		/** Whether this gesture has passed the slop threshold and become a real drag. */
		captured: boolean
	} | null>(null)

	/**
	 * Movement (px) before a press is treated as a drag rather than a click.
	 * Below this the gesture stays a click so controls inside a slide keep working.
	 */
	const DRAG_SLOP = 4

	const onPointerDown = (e: ReactPointerEvent) => {
		if (!draggable || count <= perView) return
		if (e.pointerType === "mouse" && e.button !== 0) return
		// Deliberately NOT capturing yet. Pointer capture retargets the click that
		// follows to the capture element, so capturing on pointerdown makes every
		// interactive control inside a slide — a card's own CTA, a link, a checkbox
		// — silently unclickable by mouse: the button highlights, takes focus, and
		// never fires onClick. Capture is taken on the first move past DRAG_SLOP
		// instead, which still guarantees move/up/cancel come back here for any
		// gesture that actually becomes a drag.
		dragState.current = { id: e.pointerId, startX: e.clientX, captured: false }
	}
	const onPointerMove = (e: ReactPointerEvent) => {
		const s = dragState.current
		if (!s || s.id !== e.pointerId) return
		const delta = e.clientX - s.startX
		if (!s.captured) {
			if (Math.abs(delta) < DRAG_SLOP) return
			s.captured = true
			// Capture so move/up/cancel always return here even if the pointer leaves
			// the viewport — otherwise a release-outside strands the drag forever.
			;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
			setAnimating(false)
		}
		setDrag({ start: s.startX, delta })
	}
	const endDrag = (e: ReactPointerEvent) => {
		const s = dragState.current
		if (!s || s.id !== e.pointerId) return
		dragState.current = null
		// A press that never passed the slop threshold was a click, not a drag:
		// nothing was captured, nothing moved, and the click must be left alone.
		if (!s.captured) return
		;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
		const delta = e.clientX - s.startX
		setDrag(null)
		if (pitch > 0 && Math.abs(delta) > DRAG_SLOP) {
			const moved = Math.round(delta / pitch)
			const steps = moved !== 0 ? moved : delta < 0 ? -1 : 1
			const threshold = Math.abs(delta) > pitch * 0.15
			if (threshold) goTo(logical - steps)
			else setAnimating(true) // snap back
		}
	}

	// ---- Autoplay ----------------------------------------------------------
	const paused = hovered || focused || drag != null || !enabled || docHidden
	useEffect(() => {
		if (autoplay <= 0 || !playing || paused || count <= perView) return
		const id = setInterval(next, autoplay)
		return () => clearInterval(id)
	}, [autoplay, playing, paused, count, perView, next])

	// ---- Keyboard ----------------------------------------------------------
	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowLeft") {
			e.preventDefault()
			prev()
		} else if (e.key === "ArrowRight") {
			e.preventDefault()
			next()
		} else if (e.key === "Home") {
			e.preventDefault()
			goTo(0)
		} else if (e.key === "End") {
			e.preventDefault()
			goTo(maxIndex)
		}
	}

	const extended = canLoop
		? [...slides.slice(count - clones), ...slides, ...slides.slice(0, clones)]
		: slides

	const basis = `calc((100% - ${perView - 1} * ${gap}) / ${perView})`
	const translateX = -(position * pitch) + (drag?.delta ?? 0)
	// Visible track slots [visLo, visHi] decide inert/aria-hidden by ON-SCREEN
	// position — so a clone visible at the loop boundary stays interactive while
	// its off-screen real twin goes inert. Widened during a drag so the slide
	// being revealed is live under the finger.
	const visLo = position - (drag ? 1 : 0)
	const visHi = position + perView - 1 + (drag ? 1 : 0)
	const trackStyle: CSSProperties = {
		gap,
		translate: pitch > 0 ? `${translateX}px 0` : undefined,
		transition:
			animating && !drag
				? "translate var(--motion-duration-slow) var(--motion-ease-emphasized)"
				: "none",
	}

	const atStart = !canLoop && logical <= 0
	const atEnd = !canLoop && logical >= maxIndex
	const showArrows = arrows && count > perView
	const showDots = dots && count > perView
	const liveId = `${baseId}-live`

	if (count === 0) return null

	return (
		<section
			aria-roledescription="carousel"
			aria-label={label ?? "Slides"}
			// Flex column so the viewport's negative bleed margin can't collapse
			// through the section into the consumer's own margin.
			className={cn("relative flex flex-col", className)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onFocus={() => setFocused(true)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node))
					setFocused(false)
			}}
		>
			{/* The arrows centre on the SLIDES, so they sit in a wrapper around the
			    viewport only — positioned against the whole section they were pulled
			    down by the dots row beneath. Flex column for the same margin reason
			    as the section. */}
			<div className="relative flex flex-col">
				{/* biome-ignore lint/a11y/useSemanticElements: focusable slides group owning arrow-key nav */}
				<div
					ref={viewportRef}
					role="group"
					aria-label={label ?? "Slides"}
					aria-keyshortcuts="ArrowLeft ArrowRight Home End"
					tabIndex={0}
					onKeyDown={onKeyDown}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={endDrag}
					onPointerCancel={endDrag}
					// The clip edge sits `--carousel-bleed` OUTSIDE the slides (padding,
					// cancelled by an equal negative margin) so glyph overhang — a title's
					// first letter, a descender — isn't shaved at the viewport edge. Capped
					// at half the gap so a neighbouring slide never peeks in (gap 0 = no
					// bleed); the radius grows by the same amount to stay concentric.
					style={{ "--carousel-bleed": `min(0.25rem, calc(${gap} / 2))` } as CSSProperties}
					className={cn(
						"-m-(--carousel-bleed) overflow-hidden rounded-[calc(var(--radius-lg)+var(--carousel-bleed))] p-(--carousel-bleed) outline-none motion-interactive focus-visible:ring-2 focus-visible:ring-ring",
						draggable && count > perView && "touch-pan-y",
						drag ? "cursor-grabbing" : draggable && count > perView && "cursor-grab",
					)}
				>
					<div
						className="flex"
						style={trackStyle}
						onTransitionEnd={onTrackTransitionEnd}
					>
						{extended.map((slide, i) => {
							const realIndex = canLoop
								? (((i - clones) % count) + count) % count
								: i
							const offscreen = i < visLo || i > visHi
							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: positional slides incl. clones
									key={i}
									ref={i === clones ? slideRef : undefined}
									role="group"
									aria-roledescription="slide"
									aria-label={`${realIndex + 1} of ${count}`}
									aria-hidden={offscreen || undefined}
									inert={offscreen || undefined}
									className={cn("shrink-0 select-none", slideClassName)}
									style={{ flex: `0 0 ${basis}`, minWidth: 0 }}
								>
									{slide}
								</div>
							)
						})}
					</div>
				</div>

				{showArrows && (
					<>
						<CarouselArrowButton
							side="prev"
							onClick={prev}
							disabled={atStart}
							className={arrowClassName}
						/>
						<CarouselArrowButton
							side="next"
							onClick={next}
							disabled={atEnd}
							className={arrowClassName}
						/>
					</>
				)}
			</div>

			{/* Polite live region — silent while auto-rotating (APG). */}
			<div
				id={liveId}
				aria-live={playing && !paused ? "off" : "polite"}
				aria-atomic
				className="sr-only"
			>
				{`Slide ${logical + 1} of ${count}`}
			</div>

			{(showDots || counter || autoplay > 0) && (
				<div className="mt-3 flex items-center justify-center gap-3">
					{autoplay > 0 && (
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={() => setPlaying((p) => !p)}
							aria-label={playing ? "Pause autoplay" : "Start autoplay"}
						>
							<PlayPauseGlyph playing={playing} />
						</Button>
					)}
					{showDots && (
						<div
							role="group"
							aria-label="Choose slide"
							className="flex items-center"
						>
							{slides.map((_, i) => (
								// design-lint-disable-next-line raw-button -- a pagination dot is a 24px hit area around a 6px indicator, not a button-shaped action; Button has no dot anatomy
								<button
									// biome-ignore lint/suspicious/noArrayIndexKey: dots map 1:1 to slides
									key={i}
									type="button"
									onClick={() => {
										if (i !== logical) goTo(i)
									}}
									aria-label={`Go to slide ${i + 1}`}
									aria-current={i === logical ? "true" : undefined}
									// 24px hit area (WCAG 2.2 target size) around the small visual dot.
									className="group/dot flex size-6 items-center justify-center rounded-full motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<span
										aria-hidden
										className={cn(
											"h-1.5 rounded-full motion-interactive",
											i === logical
												? "w-4 bg-foreground"
												: "w-1.5 bg-muted-foreground/40 group-hover/dot:bg-muted-foreground/70",
										)}
									/>
								</button>
							))}
						</div>
					)}
					{counter && (
						<span className="text-mono-sm text-muted-foreground tabular-nums">
							{logical + 1}/{count}
						</span>
					)}
				</div>
			)}
		</section>
	)
}
Carousel.displayName = "Carousel"
