import { Drawer as Base } from "@base-ui/react/drawer"
import type { VariantProps } from "class-variance-authority"
import {
	type ComponentProps,
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
 * Root. SheetContent reports its side up through this setter so the API stays
 * where it always was.
 */
const SheetSideContext = createContext<((side: SheetSide) => void) | null>(null)

/**
 * Root props. Everything Base UI Drawer.Root takes except the swipe direction
 * (derived from SheetContent's `side`) and snap points (a bottom-sheet feature
 * Sheet's styling does not implement).
 */
export type SheetProps<Payload = unknown> = Omit<
	Base.Root.Props<Payload>,
	| "swipeDirection"
	| "snapPoints"
	| "snapPoint"
	| "defaultSnapPoint"
	| "onSnapPointChange"
	| "snapToSequentialPoints"
>

export function Sheet<Payload = unknown>(props: SheetProps<Payload>) {
	const [side, setSide] = useState<SheetSide>("right")
	return (
		<SheetSideContext.Provider value={setSide}>
			<Base.Root {...props} swipeDirection={SWIPE_DIRECTION[side]} />
		</SheetSideContext.Provider>
	)
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
export function SheetContent({
	className,
	children,
	side,
	initialFocus,
	ref,
	...props
}: ContentProps) {
	const reportSide = useContext(SheetSideContext)
	const resolvedSide = side ?? "right"
	useIsomorphicLayoutEffect(() => {
		reportSide?.(resolvedSide)
	}, [reportSide, resolvedSide])

	const popupRef = useRef<HTMLDivElement>(null)
	const mergedRef = useMemo(() => mergeRefs(popupRef, ref), [ref])

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
					className={cn(sheetVariants({ side }), className)}
					{...props}
				>
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
