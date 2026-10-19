import { AlertDialog as AlertBase } from "@base-ui/react/alert-dialog"
import { Dialog as Base } from "@base-ui/react/dialog"
import { type ComponentProps, useMemo } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { FocusReturnProvider, useFocusReturn, useFocusReturnDefault } from "../../lib/focus-return"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { PresentationProvider } from "../../lib/presentation"
import { mergeRefs } from "../../lib/refs"
import { Button } from "../button/button"

/**
 * Dialog — themed wrapper over Base UI's Dialog (focus trap, scroll lock, ARIA,
 * Esc/click-outside dismissal all come from Base UI). Compose:
 *
 *   <Dialog>
 *     <DialogTrigger render={<Button>Open</Button>} />
 *     <DialogContent>
 *       <DialogHeader><DialogTitle>…</DialogTitle><DialogDescription>…</DialogDescription></DialogHeader>
 *       …
 *       <DialogFooter><DialogClose render={<Button variant="secondary">Close</Button>} /></DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * `size="fullscreen"` turns the same parts into a media viewer — a near-opaque
 * scrim, an edge-to-edge popup that centres its children with no card chrome,
 * and a floating close button shown by default:
 *
 *   <Dialog>
 *     <DialogTrigger render={<Button>View full size</Button>} />
 *     <DialogContent size="fullscreen" aria-label="Studio, 2026">
 *       <img src="…" alt="Studio, 2026" className="max-h-full max-w-full object-contain" />
 *     </DialogContent>
 *   </Dialog>
 *
 * Opened from your own button through controlled `open`, with no DialogTrigger,
 * it still returns focus to that button on close: the root records whatever
 * held focus when `open` turned true and makes it DialogContent's default
 * `finalFocus` (lib/focus-return has the why). An explicit `finalFocus` wins.
 */
export function Dialog<Payload = unknown>({ open, onOpenChange, ...props }: Base.Root.Props<Payload>) {
	const focus = useFocusReturn(open, onOpenChange)
	return (
		<FocusReturnProvider value={focus.focusReturn}>
			<Base.Root {...props} open={open} onOpenChange={focus.onOpenChange} />
		</FocusReturnProvider>
	)
}
export const DialogTrigger = Base.Trigger
export const DialogClose = Base.Close
export const DialogPortal = withPortalThemeScope(Base.Portal)

/**
 * `size` is the dialog's footprint, not its look — the same convention as every
 * other `size` prop in Sable (`appearance` is reserved for a different drawing of
 * the same footprint, as on Badge and Spinner). "fullscreen" takes the whole
 * viewport, and the darker scrim and the floating close button follow from that: at
 * full bleed the backdrop is the viewing surface, not a dimming layer.
 */
export type DialogSize = "default" | "fullscreen"

type OverlayProps = Omit<ComponentProps<typeof Base.Backdrop>, "className"> & {
	className?: string
	/** Match the scrim to DialogContent's size. "fullscreen" is near-opaque. @default "default" */
	size?: DialogSize
}

/**
 * The scrim behind the dialog — a dimming layer by default, a near-opaque
 * viewing surface at size="fullscreen". Composed into DialogContent by default;
 * exported so it can be styled or placed manually.
 */
export function DialogOverlay({ className, size = "default", ...props }: OverlayProps) {
	return (
		<Base.Backdrop
			data-size={size}
			className={cn(
				"fixed inset-0 z-(--z-overlay) motion-fade",
				size === "fullscreen" ? "bg-overlay/95" : "bg-overlay/(--scrim-alpha)",
				className,
			)}
			{...props}
		/>
	)
}

type PopupProps = Omit<ComponentProps<typeof Base.Popup>, "className"> & {
	className?: string
	/**
	 * "default" is the centred card (max-width 500px). "fullscreen" is the media
	 * viewer: near-opaque scrim, edge-to-edge popup that centres its children with
	 * no card chrome, fade instead of pop, and a safe-area-aware floating close
	 * button shown by default. Content-agnostic — an <img>, a <video>, a Carousel.
	 * @default "default"
	 */
	size?: DialogSize
	/**
	 * Render a built-in close (X) button in the top-right corner.
	 * @default false — true at size="fullscreen", where there is no header or
	 * footer chrome and the button is the only visible way out besides Esc.
	 */
	showCloseButton?: boolean
	/**
	 * Wrap the children in a scrolling region so content taller than the viewport
	 * cap scrolls instead of being clipped. Turn it off only when the dialog owns
	 * its own internal layout — a pinned header over a scrolling body, say (the
	 * shape CommandMenu needs) — in which case the popup is a plain flex column
	 * and the dialog is responsible for its own `min-h-0` scroll region.
	 * @default true — false at size="fullscreen", where the popup centres its
	 * children directly and the media sizes itself to the viewport.
	 */
	scroll?: boolean
	/**
	 * Keep the content mounted while the dialog is closed, hidden, instead of
	 * unmounting it. Opt in for a draft the user may come back to: a half-written
	 * form closed by Esc or a stray click keeps its fields (typed values, React
	 * state, scroll position) when it reopens. Leave it off otherwise: a dialog
	 * that should start fresh each time, or one with live content (polling,
	 * video), should not keep running behind a closed door. Reset the draft
	 * yourself once it is submitted or discarded.
	 * @default false
	 */
	keepMounted?: boolean
}

/** Backdrop + popup surface. Renders through a portal. */
export function DialogContent({
	size = "default",
	showCloseButton,
	scroll,
	finalFocus,
	ref,
	...props
}: PopupProps) {
	// The root's default focus return (whatever held focus when the dialog
	// opened). An explicit finalFocus, `false` included, wins.
	const focusReturn = useFocusReturnDefault()
	const popupRef = useMemo(
		() => (focusReturn ? mergeRefs(focusReturn.popupRef, ref) : ref),
		[focusReturn, ref],
	)
	const focus = { ref: popupRef, finalFocus: finalFocus === undefined ? focusReturn?.finalFocus : finalFocus }
	return size === "fullscreen" ? (
		<FullscreenContent showCloseButton={showCloseButton ?? true} {...focus} {...props} />
	) : (
		<CardContent
			showCloseButton={showCloseButton ?? false}
			scroll={scroll ?? true}
			{...focus}
			{...props}
		/>
	)
}

function FullscreenContent({
	className,
	children,
	showCloseButton,
	keepMounted,
	...props
}: Omit<PopupProps, "size" | "scroll">) {
	return (
		<DialogPortal keepMounted={keepMounted}>
			<DialogOverlay size="fullscreen" />
			<Base.Popup
				data-size="fullscreen"
				className={cn(
					// No scale pop at full-bleed size — the popup IS the viewport, so a
					// scale reads as the whole screen lurching. Fade with the scrim.
					"fixed inset-0 z-(--z-overlay) flex items-center justify-center outline-none motion-fade",
					className,
				)}
				{...props}
			>
				{/* A dialog presents its own content: a page, even opened from a sheet. */}
				<PresentationProvider value="page">{children}</PresentationProvider>
				{showCloseButton ? (
					// The floating Button: Sable's control over content. Its own
					// translucent popover chip and border keep it legible over bright
					// or dark media alike, with its hover built in — no restyled
					// ghost. It sits at the screen edge, so it clears the notch and
					// home-indicator insets.
					<Base.Close
						render={
							<Button
								variant="floating"
								size="icon"
								aria-label="Close"
								className="absolute right-[max(--spacing(4),env(safe-area-inset-right))] top-[max(--spacing(4),env(safe-area-inset-top))] z-10"
							/>
						}
					>
						<Icon name="xmark" />
					</Base.Close>
				) : null}
			</Base.Popup>
		</DialogPortal>
	)
}

function CardContent({
	className,
	children,
	showCloseButton,
	scroll,
	keepMounted,
	...props
}: Omit<PopupProps, "size">) {
	return (
		<DialogPortal keepMounted={keepMounted}>
			<DialogOverlay />
			<Base.Popup
				data-size="default"
				className={cn(
					"fixed left-1/2 top-1/2 z-(--z-overlay) flex w-[calc(100%-2rem)] max-w-125 -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-border-floating bg-popover sable-surface-popover p-6 text-popover-foreground shadow-lg outline-none",
					// A dialog is viewport-anchored, so it caps against the viewport with
					// its own 1rem margin on each side accounted for. Without the cap a
					// tall dialog centred on the viewport overflows BOTH edges and the top
					// half is unreachable — Base UI locks the page scroll, so there is
					// nothing left to scroll. `dvh` so a mobile URL bar counts.
					"max-h-[calc(100dvh-2rem)]",
					// The close button is pinned over the popup's top-end corner,
					// inside the p-6 padding; the header gives way to it so a long
					// title wraps before the button instead of running under it.
					showCloseButton && "[&_[data-slot=dialog-header]]:pe-8",
					"motion-pop",
					className,
				)}
				{...props}
			>
				{/* The scroll lives on an inner region, not on the popup, so the close
				    button below stays pinned to the popup's corner instead of scrolling
				    away with the content. `min-h-0` because a flex item's default
				    `min-height: auto` refuses to shrink below its content and would
				    defeat the cap.

				    `-m-2 p-2` cancels itself, so nothing moves — it exists to widen the
				    box that `overflow-y-auto` CLIPS. A scroll container clips at its
				    padding edge, and a footer's last row sits flush against it, so the
				    focus ring on a footer button (drawn outside the border box) was
				    sliced off along with the bottom of the button's own radius. Reported
				    from a consuming app, reproduced in this package's own Dialog demo.
				    The 8px is spent inside the popup's own 24px padding, so it costs no
				    layout and stays clear of the surface edge. */}
				{/* A dialog presents its own content: a page, even opened from a sheet. */}
				<PresentationProvider value="page">
					{scroll ? (
						<div className="-m-2 min-h-0 overflow-y-auto overscroll-contain p-2 scrollbar-quiet">
							{children}
						</div>
					) : (
						children
					)}
				</PresentationProvider>
				{showCloseButton ? (
					<Base.Close
						render={
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Close"
								className="absolute end-4 top-4 text-muted-foreground"
							/>
						}
					>
						<Icon name="xmark" />
					</Base.Close>
				) : null}
			</Base.Popup>
		</DialogPortal>
	)
}

type TitleProps = Omit<ComponentProps<typeof Base.Title>, "className"> & {
	className?: string
}
export function DialogTitle({ className, ...props }: TitleProps) {
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
export function DialogDescription({ className, ...props }: DescriptionProps) {
	return (
		<Base.Description
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

export function DialogHeader({
	className,
	...props
}: ComponentProps<"div">) {
	return <div data-slot="dialog-header" className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
}

export function DialogFooter({
	className,
	...props
}: ComponentProps<"div">) {
	return (
		<div
			className={cn("mt-6 flex items-center justify-end gap-2", className)}
			{...props}
		/>
	)
}

/**
 * AlertDialog — the same surface as Dialog, over Base UI's AlertDialog root: the
 * popup gets role="alertdialog" and is always modal, and a click on the backdrop
 * does NOT dismiss it. The only ways out are an explicit AlertDialogClose (or an
 * action that sets `open` to false) and Esc. Use it for confirmations that
 * interrupt the user and need an answer; use Dialog for everything else.
 *
 * Base UI's AlertDialog shares its Popup / Backdrop / Title / Description /
 * Close / Portal parts with Dialog — only the Root and Trigger differ — so the
 * content parts below are Sable's Dialog parts under AlertDialog names. One
 * surface, one set of classes.
 *
 *   <AlertDialog>
 *     <AlertDialogTrigger render={<Button>Discard draft</Button>} />
 *     <AlertDialogContent>
 *       <AlertDialogHeader><AlertDialogTitle>…</AlertDialogTitle><AlertDialogDescription>…</AlertDialogDescription></AlertDialogHeader>
 *       <AlertDialogFooter>
 *         <AlertDialogClose render={<Button variant="secondary">Cancel</Button>} />
 *         <Button onClick={…}>Discard</Button>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 */
export function AlertDialog<Payload = unknown>({ open, onOpenChange, ...props }: AlertBase.Root.Props<Payload>) {
	const focus = useFocusReturn(open, onOpenChange)
	return (
		<FocusReturnProvider value={focus.focusReturn}>
			<AlertBase.Root {...props} open={open} onOpenChange={focus.onOpenChange} />
		</FocusReturnProvider>
	)
}
export const AlertDialogTrigger = AlertBase.Trigger
export const AlertDialogClose = DialogClose
export const AlertDialogContent = DialogContent
export const AlertDialogOverlay = DialogOverlay
export const AlertDialogTitle = DialogTitle
export const AlertDialogDescription = DialogDescription
export const AlertDialogHeader = DialogHeader
export const AlertDialogFooter = DialogFooter
