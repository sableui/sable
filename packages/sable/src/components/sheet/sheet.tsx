import { Drawer as Base } from "@base-ui/react/drawer"
import type { VariantProps } from "class-variance-authority"
import {
	type ComponentProps,
	type CSSProperties,
	createContext,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react"
import { cn } from "../../lib/cn"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { PresentationProvider, StackedActionsContext, usePresentation } from "../../lib/presentation"
import { mergeRefs } from "../../lib/refs"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { sheetVariants } from "./sheet.variants"

declare const process: { env: { NODE_ENV?: string } }

/**
 * Sheet — an edge-anchored drawer built on Base UI's Drawer (focus trap, scroll
 * lock, ARIA, Esc/click-outside dismissal all come from Base UI, the same as
 * Dialog). Unlike the centered Dialog, the popup slides in from a viewport edge
 * (`side`) and can be swiped back out toward that edge on touch. Compose:
 *
 *   <Sheet>
 *     <SheetTrigger render={<Button>Open</Button>} />
 *     <SheetContent side="right">
 *       <SheetHeader>
 *         <SheetTitle>Filters</SheetTitle>
 *         <SheetDescription>Narrow the feed.</SheetDescription>
 *       </SheetHeader>
 *       …
 *       <SheetFooter>
 *         <SheetClose render={<Button variant="secondary">Cancel</Button>} />
 *         <SheetClose render={<Button>Apply</Button>} />
 *       </SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 *
 * `side` defaults to "right". Left/right are full-height side panels; top/bottom
 * span the width and auto-size up to 80vh.
 */

type SheetSide = NonNullable<VariantProps<typeof sheetVariants>["side"]>

/** The swipe that dismisses a sheet is always back toward the edge it came from. */
const SWIPE_DIRECTION = {
	right: "right",
	left: "left",
	top: "up",
	bottom: "down",
} as const satisfies Record<SheetSide, Base.Root.Props["swipeDirection"]>

/**
 * `side` lives on SheetContent, but Base UI reads the swipe direction from the
 * Root. SheetContent reports its side up through `reportSide` so the API stays
 * where it always was, and reads back whether the Root was given snap points.
 */
const SheetRootContext = createContext<{ reportSide: (side: SheetSide) => void; snaps: boolean } | null>(null)

/** A snap point: a fraction of the viewport (0–1), pixels (> 1), or a `px` / `rem` string. */
export type SheetSnapPoint = number | string

/**
 * Root props: everything Base UI Drawer.Root takes except the swipe direction,
 * which comes from SheetContent's `side`.
 *
 * Snap points are a bottom sheet's: stops the panel rests at between closed
 * and fully open, dragged between by its handle or any touch swipe. They take
 * effect only with `side="bottom"`; a side or top sheet ignores them and a
 * development build says so, rather than half-applying a bottom-sheet gesture
 * to a panel that slides sideways.
 */
export type SheetProps<Payload = unknown> = Omit<Base.Root.Props<Payload>, "swipeDirection">

export function Sheet<Payload = unknown>({
	snapPoints,
	snapPoint,
	defaultSnapPoint,
	onSnapPointChange,
	snapToSequentialPoints,
	...props
}: SheetProps<Payload>) {
	const [side, setSide] = useState<SheetSide>("right")
	const snaps = Boolean(snapPoints?.length)
	const context = useMemo(() => ({ reportSide: setSide, snaps }), [snaps])
	// Only the stops are gated to a bottom sheet (Base UI also applies them to an
	// upward swipe, which the top panel is not styled for). The snap point's
	// state is always forwarded: `side` arrives from SheetContent after the
	// first render, and Base UI decides controlled-or-not on that first render
	// for good, so withholding `snapPoint` then made a controlled sheet
	// uncontrolled for its whole life.
	return (
		<SheetRootContext.Provider value={context}>
			<Base.Root
				{...props}
				snapPoints={snaps && side === "bottom" ? snapPoints : undefined}
				snapPoint={snapPoint}
				defaultSnapPoint={defaultSnapPoint}
				onSnapPointChange={onSnapPointChange}
				snapToSequentialPoints={snapToSequentialPoints}
				swipeDirection={SWIPE_DIRECTION[side]}
			/>
		</SheetRootContext.Provider>
	)
}

/**
 * Inside try, not behind `typeof process`, for the reason Icon gives: bundlers
 * replace the literal text, and a build that defines nothing reads as production.
 */
function isDevelopment() {
	try {
		return process.env.NODE_ENV !== "production"
	} catch {
		return false
	}
}

/**
 * The height the on-screen keyboard takes from the bottom of the layout
 * viewport, from `visualViewport`. Neither Base UI's Drawer nor `dvh` accounts
 * for it: on iOS, and on Android's default `resizes-visual`, the keyboard
 * covers the page instead of resizing it, so a bottom sheet pinned to
 * `bottom: 0` keeps its focused field under the keys. 0 where the API is
 * missing or the keyboard is down.
 */
function useKeyboardInset(enabled: boolean) {
	const [inset, setInset] = useState(0)
	useIsomorphicLayoutEffect(() => {
		const viewport = typeof window === "undefined" ? undefined : window.visualViewport
		if (!enabled || !viewport) return
		// A pinch-zoomed viewport is also shorter than the window, but that is the
		// reader's zoom, not a keyboard: lifting the sheet then floated it half a
		// screen up. Zoomed, the keyboard is not measured at all.
		const measure = () =>
			setInset(
				Math.abs(viewport.scale - 1) > 0.01
					? 0
					: Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop)),
			)
		measure()
		const listeners = new AbortController()
		const { signal } = listeners
		viewport.addEventListener("resize", measure, { signal })
		viewport.addEventListener("scroll", measure, { signal })
		return () => {
			listeners.abort()
			setInset(0)
		}
	}, [enabled])
	return inset
}

export const SheetTrigger = Base.Trigger
export const SheetClose = Base.Close
export const SheetPortal = withPortalThemeScope(Base.Portal)

type ContentProps = Omit<ComponentProps<typeof Base.Popup>, "className"> &
	VariantProps<typeof sheetVariants> & {
		className?: string
	}

/**
 * Backdrop + edge-anchored popup surface. Renders through a portal. Pick the
 * entry edge with `side` ("right" | "left" | "top" | "bottom", default "right").
 *
 * The children sit in Base UI's Drawer.Content (as `display: contents`, so they
 * stay flex items of the popup column): a mouse drag that starts on content
 * selects text instead of dragging the sheet. Touch swipes work anywhere.
 */
let warnedSnapSide = false

export function SheetContent({
	className,
	children,
	side,
	initialFocus,
	ref,
	style,
	...props
}: ContentProps) {
	const root = useContext(SheetRootContext)
	const resolvedSide = side ?? "right"
	const reportSide = root?.reportSide
	useIsomorphicLayoutEffect(() => {
		reportSide?.(resolvedSide)
	}, [reportSide, resolvedSide])
	const snaps = Boolean(root?.snaps) && resolvedSide === "bottom"
	if (root?.snaps && resolvedSide !== "bottom" && !warnedSnapSide && isDevelopment()) {
		warnedSnapSide = true
		console.warn(`Sable: <Sheet snapPoints> applies to side="bottom" only; this sheet opens from the ${resolvedSide}, so its snap points are ignored.`)
	}
	const popupRef = useRef<HTMLDivElement>(null)
	// The popup mounts when the sheet opens, after this component, so its width
	// is followed through state rather than read from the ref at mount.
	const [popup, setPopup] = useState<HTMLDivElement | null>(null)
	const mergedRef = useMemo(() => mergeRefs(popupRef, ref, setPopup), [ref])

	// Measured only while this bottom sheet is open: a closed one has nothing
	// to lift, and every sheet on a page listening would re-render them all on
	// each viewport scroll.
	const keyboardInset = useKeyboardInset(resolvedSide === "bottom" && popup !== null)
	const keyboardVars = { "--sheet-keyboard-inset": `${keyboardInset}px` } as CSSProperties

	// A toast stack on this sheet's edge moves beside it (styles.css). It needs
	// the sheet's real width, which a className can change, so a side sheet
	// publishes it on <html> while it is mounted.
	useIsomorphicLayoutEffect(() => {
		if (!popup || (resolvedSide !== "left" && resolvedSide !== "right")) return
		const root = document.documentElement
		const name = `--sable-sheet-${resolvedSide}-w`
		const publish = () => root.style.setProperty(name, `${popup.offsetWidth}px`)
		publish()
		const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(publish)
		observer?.observe(popup)
		return () => {
			observer?.disconnect()
			root.style.removeProperty(name)
		}
	}, [popup, resolvedSide])

	return (
		<SheetPortal>
			<Base.Backdrop className="fixed inset-0 z-(--z-overlay) bg-overlay/(--scrim-alpha) opacity-[calc(1_-_var(--drawer-swipe-progress))] motion-fade data-[swiping]:transition-none" />
			<Base.Viewport className="fixed inset-0 z-(--z-overlay)">
				<Base.Popup
					ref={mergedRef}
					// Match Dialog's default: first tabbable on mouse/keyboard, the panel
					// itself on touch so the virtual keyboard does not jump up. (Drawer's
					// own default is always the panel.)
					initialFocus={
						initialFocus === undefined
							? (type) => (type === "touch" ? popupRef.current : true)
							: initialFocus
					}
					// Toasts read this to keep clear of the sheet's actions (styles.css).
					data-sable-sheet={resolvedSide}
					data-snap-points={snaps ? "" : undefined}
					className={cn(sheetVariants({ side }), className)}
					{...props}
					// The keyboard inset is merged under the caller's style, which Base UI
					// also accepts as a function of the popup's state.
					style={
						typeof style === "function"
							? (state) => ({ ...keyboardVars, ...style(state) })
							: { ...keyboardVars, ...style }
					}
				>
					{snaps ? (
						// The grip says "drag me". Decorative: the stops are reached by
						// swipe, and the sheet's content stays reachable by scrolling
						// and by keyboard whichever stop it rests at.
						<div
							aria-hidden
							data-slot="sheet-handle"
							className="-mt-(--sheet-handle-pull) mb-0 h-1 w-10 shrink-0 self-center rounded-full bg-border-strong"
						/>
					) : null}
					<Base.Content className="contents">
						{/* A bottom sheet is the phone's sheet: it owns its content's actions
						    (lib/presentation). A side sheet is a page again, even one opened
						    from inside a bottom sheet. */}
						<PresentationProvider value={resolvedSide === "bottom" ? "sheet" : "page"}>{children}</PresentationProvider>
					</Base.Content>
				</Base.Popup>
			</Base.Viewport>
		</SheetPortal>
	)
}

type TitleProps = Omit<ComponentProps<typeof Base.Title>, "className"> & {
	className?: string
}
export function SheetTitle({ className, ...props }: TitleProps) {
	return (
		<Base.Title
			className={cn("text-title-lg text-popover-foreground", className)}
			{...props}
		/>
	)
}

type DescriptionProps = Omit<
	ComponentProps<typeof Base.Description>,
	"className"
> & { className?: string }
export function SheetDescription({ className, ...props }: DescriptionProps) {
	return (
		<Base.Description
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

/** Stacked title + description block, pinned to the top of the sheet. */
export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-1.5", className)} {...props} />
}

/**
 * Rows that run edge to edge in the sheet — Entity rows, most often: a queue,
 * notifications, a picker. The list bleeds through the sheet's padding and
 * hands it back to each row (`--entity-px` from `--sheet-p`), so a row's
 * avatar and text line up with SheetHeader while its hover fill reaches the
 * panel's edges. Without it, Entity's own inset stacks on the sheet's and the
 * rows sit 12px in from the header. The Sheet equivalent of CardList.
 *
 *   <SheetContent>
 *     <SheetHeader><SheetTitle>Up next</SheetTitle></SheetHeader>
 *     <SheetList>{queue.map((t) => <Entity key={t.id} title={t.title} … />)}</SheetList>
 *   </SheetContent>
 */
export function SheetList({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-list"
			className={cn(
				"-mx-(--sheet-p) flex flex-col [--entity-radius:0px] [--entity-px:var(--sheet-p)]",
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Action row, pushed to the bottom edge of the sheet via mt-auto. In a bottom
 * sheet it stacks: full width, the primary (last, on a page) on top, capped at
 * a phone's width so a wide screen does not stretch two buttons across it.
 */
export function SheetFooter({ className, children, ...props }: ComponentProps<"div">) {
	const stacked = usePresentation() === "sheet"
	return (
		<div
			data-actions={stacked ? "stack" : "row"}
			className={cn(
				"mt-auto flex items-center justify-end gap-2",
				className,
				stacked && "w-full max-w-sm flex-col-reverse items-stretch justify-start self-center",
			)}
			{...props}
		>
			{stacked ? <StackedActionsContext.Provider value={true}>{children}</StackedActionsContext.Provider> : children}
		</div>
	)
}
