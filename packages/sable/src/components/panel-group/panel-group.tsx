"use client";

import {
	type ComponentProps,
	type ReactNode,
	useCallback,
	useId,
	useSyncExternalStore,
} from "react"
import { cn } from "../../lib/cn"
import { useBelowBreakpoint, type ViewportBreakpoint } from "../../lib/use-media-query"
import { Sheet, SheetContent, SheetTitle } from "../sheet"

/* ── Persisted widths ───────────────────────────────────────────────────────
   A tiny external store rather than component state, read through
   useSyncExternalStore. The width lives in localStorage, which the server can't
   see — so the server snapshot is the default and the client snapshot is the
   stored value. That is precisely the mismatch useSyncExternalStore exists to
   resolve: it hydrates with the server snapshot and re-renders if the client
   value differs, with no hydration error and no setState inside an effect.
   ────────────────────────────────────────────────────────────────────────── */

const widthCache = new Map<string, number>()
const listeners = new Set<() => void>()

function clampWidth(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, Math.round(value)))
}

function subscribe(listener: () => void) {
	listeners.add(listener)
	return () => listeners.delete(listener)
}

function readWidth(key: string, fallback: number, min: number, max: number): number {
	// getSnapshot must return a referentially stable value across calls, or React
	// re-renders forever — hence the cache rather than a fresh read each time.
	const cached = widthCache.get(key)
	if (cached !== undefined) return cached
	let value = fallback
	try {
		const stored = Number(window.localStorage.getItem(key))
		if (Number.isFinite(stored) && stored > 0) value = clampWidth(stored, min, max)
	} catch {
		// Private mode / disabled storage: fall back to the default silently.
	}
	widthCache.set(key, value)
	return value
}

export interface UsePanelWidthOptions {
	/** localStorage key. Omit to keep the width in memory only (per hook instance). */
	storageKey?: string
	min?: number
	max?: number
}

/** The clamp a width was resolved with — spread onto the paired PanelResizer. */
export interface PanelWidthBounds {
	min: number
	max: number
}

/**
 * Controlled-width helper for a resizable Panel, persisted across reloads.
 *
 *   const [width, setWidth, bounds] = usePanelWidth(240, { storageKey: "app:panel:left", min: 160, max: 320 })
 *   <PanelResizer side="left" width={width} onWidthChange={setWidth} label="Resize layers panel" {...bounds} />
 *
 * The third element is the `{ min, max }` the hook clamps to. Spread it onto the
 * PanelResizer so the separator's aria-valuemin/max and its Home/End keys report
 * the same range the width is actually clamped to — two separate copies of the
 * bounds is how they drift apart.
 */
export function usePanelWidth(
	defaultWidth: number,
	{ storageKey, min = 200, max = 400 }: UsePanelWidthOptions = {},
) {
	// Without a storageKey the width lives in memory, keyed per hook instance:
	// a shared fallback key made every unpersisted panel on the page share one
	// width, so resizing one resized them all.
	const instanceId = useId()
	const persist = Boolean(storageKey)
	const key = storageKey ?? `memory:${instanceId}`
	const width = useSyncExternalStore(
		subscribe,
		() => (persist ? readWidth(key, defaultWidth, min, max) : (widthCache.get(key) ?? defaultWidth)),
		() => defaultWidth,
	)

	const setWidth = useCallback(
		(next: number) => {
			const clamped = clampWidth(next, min, max)
			if (widthCache.get(key) === clamped) return
			widthCache.set(key, clamped)
			if (persist) {
				try {
					window.localStorage.setItem(key, String(clamped))
				} catch {
					// Non-fatal: the width still applies for this session.
				}
			}
			for (const listener of listeners) listener()
		},
		[key, persist, min, max],
	)

	const bounds: PanelWidthBounds = { min, max }
	return [width, setWidth, bounds] as const
}

/* ── Layout ────────────────────────────────────────────────────────────────── */

/**
 * PanelGroup — a horizontal row of docked panels around a flexible centre.
 *
 * Every child must be able to shrink, so the group sets `min-h-0`/`min-w-0`
 * itself: without that, a grid or flex child refuses to shrink below its content,
 * `overflow-y-auto` never activates on a panel, and panels grow instead of
 * scrolling. That single omission is why a tool shell "mysteriously" has no
 * scroll containers.
 */
export function PanelGroup({ className, children, ...props }: ComponentProps<"div">) {
	return (
		<div className={cn("flex min-h-0 min-w-0 flex-1", className)} {...props}>
			{children}
		</div>
	)
}
PanelGroup.displayName = "PanelGroup"

type PanelProps = Omit<ComponentProps<"aside">, "children"> & {
	/** Accessible name for the region — panels are landmarks. */
	label: string
	/** Fixed width in px. Omit to let the panel flex (the centre region). */
	width?: number
	/**
	 * Scroll the panel's own content when it overflows. @default true
	 *
	 * Set `false` for the header + scrolling body + pinned footer shape — a panel
	 * with a pinned "Add layer" action at the bottom must not scroll as a whole,
	 * or the action scrolls away with the list. Put `overflow-y-auto` on the inner
	 * body region instead.
	 */
	scroll?: boolean
	/**
	 * What the panel becomes below `below`, where a docked column no longer fits
	 * beside the canvas. @default "dock"
	 *
	 * - `"dock"` keeps it docked at every width (today's behaviour).
	 * - `"sheet"` moves it into a Sheet on the panel's `side`, open while `open`
	 *   is true: an inspector becomes a sheet over the list, a navigation rail a
	 *   drawer. Wire `onOpenChange` so Esc, the scrim and a swipe can close it.
	 * - `"hidden"` drops it, for chrome a phone does without.
	 */
	narrow?: "dock" | "sheet" | "hidden"
	/**
	 * Whether the panel is showing. Docked, it defaults to `true`, and `false`
	 * removes the column so the canvas takes its width (an inspector with nothing
	 * selected). As a sheet it is the sheet's open state and defaults to `false`:
	 * a modal that opened by itself on every phone load would block the app.
	 */
	open?: boolean
	/** Called when the sheet asks to close (Esc, scrim, swipe) or open. */
	onOpenChange?: (open: boolean) => void
	/**
	 * The edge the sheet slides in from when `narrow="sheet"`. A panel docked
	 * before the canvas is a `"left"` one. @default "right"
	 */
	side?: "left" | "right"
	/** The breakpoint `narrow` applies below. Matches Sidebar's and BottomNav's swap. @default "lg" */
	below?: ViewportBreakpoint
	/** Panel content. Optional: an empty flexible centre is a valid placeholder. */
	children?: ReactNode
}

/**
 * Panel — one docked chrome column. Fixed-width when `width` is set, flexible
 * otherwise. Scrolls its own content; the group never scrolls.
 *
 * Below `below`, `narrow` decides what a docked column becomes. The content is
 * rendered once, in whichever of the two places applies, so an app never mounts
 * its inspector twice (a Panel for desktop and a Sheet for phones, each holding
 * its own copy of the same form). Crossing the breakpoint remounts it, so keep
 * state that must survive a rotation in the app, not in the panel's children.
 */
export function Panel({
	label,
	width,
	scroll = true,
	narrow = "dock",
	open,
	onOpenChange,
	side = "right",
	below = "lg",
	className,
	children,
	...props
}: PanelProps) {
	const isNarrow = useBelowBreakpoint(below)

	if (narrow !== "dock" && isNarrow) {
		if (narrow === "hidden") return null
		return (
			<Sheet open={open ?? false} onOpenChange={(next) => onOpenChange?.(next)}>
				{/* Flush: panel content brings its own insets (PanelSection, a header
				    strip), so the sheet's page padding would double them. A Sidebar
				    moved in here fills the sheet: its docked width is a column's,
				    and kept at 204px it left a strip of empty sheet beside it. */}
				<SheetContent side={side} className="gap-0 p-0 [--sidebar-width:100%]">
					<SheetTitle className="sr-only">{label}</SheetTitle>
					{children}
				</SheetContent>
			</Sheet>
		)
	}

	if (open === false) return null
	return (
		<aside
			aria-label={label}
			style={width !== undefined ? { width: `${width}px` } : undefined}
			className={cn(
				"flex min-h-0 min-w-0 flex-col bg-panel",
				width === undefined && "flex-1",
				width !== undefined && "shrink-0",
				// Thin scrollbar: a panel is chrome, and the platform default is wider
				// than the panel's own padding. Contained overscroll so a panel that
				// runs out of list does not start scrolling the canvas beside it.
				scroll && "overflow-y-auto overscroll-contain scrollbar-quiet",
				className,
			)}
			{...props}
		>
			{children}
		</aside>
	)
}
Panel.displayName = "Panel"

export interface PanelResizerProps {
	/** Which side of the group the panel being resized sits on. */
	side: "left" | "right"
	width: number
	onWidthChange: (next: number) => void
	/** Accessible name, e.g. "Resize layers panel". */
	label: string
	min?: number
	max?: number
	/** Keyboard increment, in px. @default 8 */
	step?: number
	className?: string
}

/**
 * PanelResizer — a draggable panel edge.
 *
 * Renders as a hairline with a wider invisible hit area: the visible edge stays
 * 1px (reference tools separate columns with a single physical pixel) while the
 * grabbable target clears a comfortable 8px.
 *
 * Keyboard-operable on purpose. A resizer that only answers to a pointer drag is
 * a keyboard trap, and `separator` with aria-valuenow is the role that carries
 * the semantics.
 */
export function PanelResizer({
	side,
	width,
	onWidthChange,
	label,
	min = 200,
	max = 400,
	step = 8,
	className,
}: PanelResizerProps) {
	function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
		e.preventDefault()
		const startX = e.clientX
		const startWidth = width

		// Listeners go on `window`, not the resizer. Pointer capture would retarget
		// moves to the element, but setPointerCapture THROWS when the pointer id
		// isn't active — and a throw here aborts before the listeners attach,
		// silently killing the drag. Window listeners also keep tracking when the
		// cursor outruns a 1px-wide target.
		function onMove(ev: PointerEvent) {
			// Dragging a right-hand panel's edge leftward makes it wider, so the
			// delta's sign flips per side.
			const delta = side === "left" ? ev.clientX - startX : startX - ev.clientX
			onWidthChange(startWidth + delta)
		}
		// One controller per drag: releasing aborts all three at once.
		const drag = new AbortController()
		const { signal } = drag
		window.addEventListener("pointermove", onMove, { signal })
		window.addEventListener("pointerup", () => drag.abort(), { signal })
		window.addEventListener("pointercancel", () => drag.abort(), { signal })
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		const grow = side === "left" ? "ArrowRight" : "ArrowLeft"
		const shrink = side === "left" ? "ArrowLeft" : "ArrowRight"
		if (e.key === grow) {
			e.preventDefault()
			onWidthChange(width + step)
		} else if (e.key === shrink) {
			e.preventDefault()
			onWidthChange(width - step)
		} else if (e.key === "Home") {
			e.preventDefault()
			onWidthChange(min)
		} else if (e.key === "End") {
			e.preventDefault()
			onWidthChange(max)
		}
	}

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			aria-label={label}
			aria-valuenow={width}
			aria-valuemin={min}
			aria-valuemax={max}
			tabIndex={0}
			onPointerDown={onPointerDown}
			onKeyDown={onKeyDown}
			className={cn(
				"group relative z-10 w-px shrink-0 cursor-col-resize bg-hairline outline-none",
				className,
			)}
		>
			{/* The hit area is wider than the line, extended symmetrically, so the
			    cursor doesn't have to find a 1px target. */}
			<span
				aria-hidden
				className="absolute inset-y-0 -left-1 -right-1 block motion-interactive group-hover:bg-hairline-strong group-focus-visible:bg-primary/60"
			/>
		</div>
	)
}
PanelResizer.displayName = "PanelResizer"
