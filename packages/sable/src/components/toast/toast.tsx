import { Toast as Base } from "@base-ui/react/toast"
import { type ComponentProps, createContext, type ReactNode, useContext } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { Button } from "../button/button"
import { hitTargetMin } from "../../lib/hit-target"
import { withPortalThemeScope } from "../../lib/portal-theme-scope"
import { Spinner } from "../spinner/spinner"

/**
 * Toast — themed notification system over Base UI's Toast (auto-dismiss timers,
 * swipe-to-dismiss, focus management, ARIA live-region announcements, and a
 * limit-aware stack all come from Base UI). Imperative API: wrap your app in
 * <ToastProvider>, then call the manager hook to push toasts from anywhere:
 *
 *   function App() {
 *     return (
 *       <ToastProvider>
 *         <Composer />
 *       </ToastProvider>
 *     )
 *   }
 *
 *   function Composer() {
 *     const toast = useToast()
 *     return (
 *       <Button onClick={() => toast.add({ title: "Saved", description: "Your post is live." })}>
 *         Publish
 *       </Button>
 *     )
 *   }
 *
 * <ToastProvider> renders Base UI's Provider plus a themed Viewport that maps the
 * manager's `toasts` into styled <Toast.Root> entries (Title + Description + a
 * dismiss Close). State surfaces via Base UI data-attributes:
 * data-[starting-style]/data-[ending-style] (enter/leave), data-[expanded],
 * data-[swiping], data-[swipe-direction].
 */


/**
 * The shared toast store that powers the imperative `toast()` API. Created once
 * at module load so it's callable from anywhere (outside React); <ToastProvider>
 * binds it via Base UI's `toastManager` prop.
 */
const toastManager = Base.createToastManager()

/** Visual/semantic type of a toast — drives the accent and (for loading) a spinner. */
export type ToastType = "success" | "error" | "warning" | "info" | "loading"

/** Screen anchor for the toast stack. */
export type ToastPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right"

/** Position → fixed-anchor utilities for the viewport. */
const POSITION: Record<ToastPosition, string> = {
	"top-left": "top-4 left-4 items-start",
	"top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
	"top-right": "top-4 right-4 items-end",
	"bottom-left": "bottom-4 left-4 items-start",
	"bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
	"bottom-right": "bottom-4 right-4 items-end",
}

/**
 * Each toast enters from the edge its stack is anchored to — sliding in from
 * the right on the right, from the left on the left, and down/up from the top
 * or bottom edge for a centred stack. It used to slide left at every anchor, so
 * a left-anchored toast arrived from inside the page.
 */
const ENTER_MOTION: Record<ToastPosition, string> = {
	"top-left": "motion-slide-right",
	"top-center": "motion-slide-down",
	"top-right": "motion-slide-left",
	"bottom-left": "motion-slide-right",
	"bottom-center": "motion-slide-up",
	"bottom-right": "motion-slide-left",
}

/**
 * The stacked layout: the toasts sit on top of one another like a deck of
 * cards, the newest in front and each older one peeking out behind it, a step
 * smaller. Hovering or focusing the stack fans it out into the list. Base UI
 * measures the toasts and publishes the geometry as CSS variables (each one's
 * index, height and offset in the fanned-out list, and the front toast's
 * height); this is only the drawing. The proportions are Sonner's: a 12px
 * peek and 5% smaller per card, three cards deep at the default limit.
 *
 * Every toast takes the front toast's height while collapsed, so the cards
 * behind it peek by the same amount whatever they say. Their content fades
 * (ToastContent), because only an edge of them shows.
 *
 * The stack is drawn with `transform`, the property Base UI reads back to hold
 * a toast under the finger mid-swipe. Arrival and departure use `translate`,
 * which composes with it, so the two never compete for one property.
 *
 * `--toast-dir` is the direction the stack grows: up from a bottom anchor,
 * down from a top one.
 */
const STACKED_ROOT = [
	// design-lint-disable-next-line raw-z-index -- orders the cards inside the viewport's own stacking context (it is fixed at z-(--z-toast)); not a page layer
	"absolute inset-x-0 z-[calc(100-var(--toast-index))] select-none",
	"[--toast-gap:--spacing(2)] [--toast-peek:--spacing(3)]",
	"[--toast-scale:max(0,1-var(--toast-index)*0.05)]",
	"[--toast-h:var(--toast-frontmost-height,var(--toast-height))]",
	"h-(--toast-h) data-expanded:h-(--toast-height)",
	// Collapsed: shrink about the anchored edge, then lift a peek per card.
	"[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-dir)*(var(--toast-index)*var(--toast-peek)+(1-var(--toast-scale))*var(--toast-h))))_scale(var(--toast-scale))]",
	// Fanned out: Base UI's offset is the heights in front of it; add the gaps.
	"data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-dir)*(var(--toast-offset-y)+var(--toast-index)*var(--toast-gap))))]",
	// Arrive from the anchored edge and leave the same way, unless swiped or
	// pushed out by the limit, which only fade.
	"data-starting-style:[translate:0_calc(var(--toast-dir)*-100%)] data-starting-style:opacity-0",
	"[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[translate:0_calc(var(--toast-dir)*-100%)]",
	"data-ending-style:opacity-0 data-limited:opacity-0",
	// Fanned out, bridges the gap to the next card, so the pointer stays on the
	// stack and the list does not collapse under it.
	"after:absolute after:inset-x-0 after:h-[calc(var(--toast-gap)+1px)] not-data-expanded:after:hidden",
	// Collapsed, the deck lifts as one: cards resting on each other barely shade
	// each other. A full shadow on every card stacked a slab per card, and a
	// theme with hard offset shadows (Poppy's reach 12px, past the 12px peek)
	// painted the front card's slab over the cards behind it. So the front card
	// steps down to shadow-md and the cards behind to shadow-sm; fanned out,
	// each is a toast again and takes the full step back.
	"not-data-expanded:shadow-md not-data-expanded:has-[>[data-behind]]:shadow-sm",
	"transition-[transform,translate,opacity,height,box-shadow] duration-(--motion-duration-slow) ease-emphasized",
].join(" ")

/** The edge a stacked toast is pinned to, and the side its hover bridge reaches. */
const STACKED_EDGE = {
	top: "top-0 origin-top [--toast-dir:1] after:top-full",
	bottom: "bottom-0 origin-bottom [--toast-dir:-1] after:bottom-full",
} as const

const edgeOf = (position: ToastPosition) => (position.startsWith("top") ? "top" : "bottom")

/** The viewport's anchor and layout, read by the toasts inside it. */
const ToastViewportContext = createContext<{ position: ToastPosition; stacked: boolean }>({
	position: "top-right",
	stacked: false,
})

type AddOptions = Parameters<typeof toastManager.add>[0]
/** Options for `toast()` / the `toast.*` helpers (Base UI add-options minus the message). */
export type ToastOptions = Omit<AddOptions, "title" | "type">

export interface ToastApi {
	/** Show a neutral toast. Returns the toast id. */
	(message: ReactNode, options?: ToastOptions): string
	success: (message: ReactNode, options?: ToastOptions) => string
	/** A failure toast. Persists until dismissed unless a `timeout` is given. */
	error: (message: ReactNode, options?: ToastOptions) => string
	warning: (message: ReactNode, options?: ToastOptions) => string
	info: (message: ReactNode, options?: ToastOptions) => string
	/** Alias of the bare call — a neutral toast. */
	message: (message: ReactNode, options?: ToastOptions) => string
	/** A persistent in-progress toast (spinner; no auto-dismiss unless overridden). */
	loading: (message: ReactNode, options?: ToastOptions) => string
	/** Escape hatch: full Base UI add-options (custom title node, positionerProps, …), with the persistence default. */
	custom: (options: AddOptions) => string
	/** Base UI-parity alias of `custom` — add(options), with the persistence default. */
	add: (options: AddOptions) => string
	/** Drive loading → success/error from a promise. */
	promise: typeof toastManager.promise
	/** Dismiss a toast by id, or all toasts when called with no id. */
	dismiss: (id?: string) => void
	/** Update a live toast in place (e.g. swap a loading toast to success). */
	update: typeof toastManager.update
}

/**
 * Which toasts keep themselves on screen when the caller names no timeout.
 *
 * `loading` is the original case — it persists until something updates or
 * dismisses it. Two more belong to the same class:
 *
 * - **`error`**: a failure the reader missed is a failure that never happened
 *   to them. Successes may leave on a schedule; errors wait to be read.
 * - **any toast carrying `actionProps`**: the action is the *only* path to that
 *   affordance. An Undo that expires on a timer is data loss on a schedule, and
 *   the reader has no way to get it back.
 *
 * Base UI already pauses these timers on hover/focus and while the window is
 * hidden — this is about the default, not about pausing.
 */
function persistsByDefault(
	type: ToastType | undefined,
	options?: ToastOptions,
): boolean {
	return (
		type === "loading" ||
		type === "error" ||
		options?.actionProps !== undefined
	)
}

/**
 * Applies the persistence default to raw add-options: when the caller named no
 * timeout, an error, a loading toast, or one carrying `actionProps` stays until
 * dismissed. Shared by `toast.*` and the hook's `add`, so neither path can
 * quietly put an Undo on a timer.
 */
function withPersistence(options: AddOptions): AddOptions {
	const type = options.type as ToastType | undefined
	return options.timeout === undefined && persistsByDefault(type, options)
		? { ...options, timeout: 0 }
		: options
}

/**
 * The manager hook, for use inside components. Returns { toasts, add, close,
 * update, promise } like Base UI's — but `add` applies the same persistence
 * default as `toast.*` (errors, loading, and any toast with `actionProps` wait
 * to be dismissed unless you pass a timeout). Base UI's raw `add` skipped it.
 */
// A named, exported return type: the inferred one referenced Base UI's
// internal manager type, which a consumer cannot name (TS2742 on any exported
// wrapper of useToast). Deriving from `typeof Base.useToastManager` keeps the
// installed Base UI's generic constraints instead of freezing the builder's.
export interface ToastManagerApi extends Omit<ReturnType<typeof Base.useToastManager>, "add"> {
	/** Base UI's add(options), with the persistence default applied. */
	add: (options: AddOptions) => string
}
export function useToast(): ToastManagerApi {
	const manager = Base.useToastManager()
	return { ...manager, add: (options: AddOptions) => manager.add(withPersistence(options)) }
}
/** Alias matching Base UI's name, for callers who prefer it. Same persistence default. */
export const useToastManager = useToast

function show(
	type: ToastType | undefined,
	message: ReactNode,
	options?: ToastOptions,
): string {
	// The persistence default applies ONLY when the caller named no timeout, so
	// an explicit value always wins — including an explicit `0` and an explicit
	// number (which makes an error or an action-carrying toast auto-dismiss
	// again, deliberately).
	return toastManager.add(withPersistence({ title: message, type, ...options }))
}

/**
 * Imperative, Sonner-shaped toast API — call it from event handlers, utilities,
 * or any non-React code. Requires a <ToastProvider> mounted near the app root.
 * Every call returns the toast id.
 *
 *   toast.success("Saved")
 *   toast.error("Upload failed", { description: err.message })
 *   const id = toast.loading("Pinning to Arweave…")
 *   toast.update(id, { title: "Pinned", type: "success", timeout: 4000 })
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" })
 */
export const toast: ToastApi = Object.assign(
	(message: ReactNode, options?: ToastOptions) =>
		show(undefined, message, options),
	{
		success: (m: ReactNode, o?: ToastOptions) => show("success", m, o),
		error: (m: ReactNode, o?: ToastOptions) => show("error", m, o),
		warning: (m: ReactNode, o?: ToastOptions) => show("warning", m, o),
		info: (m: ReactNode, o?: ToastOptions) => show("info", m, o),
		message: (m: ReactNode, o?: ToastOptions) => show(undefined, m, o),
		loading: (m: ReactNode, o?: ToastOptions) => show("loading", m, o),
		custom: (o: AddOptions) => toastManager.add(withPersistence(o)),
		add: (o: AddOptions) => toastManager.add(withPersistence(o)),
		promise: toastManager.promise,
		dismiss: (id?: string) => toastManager.close(id),
		update: toastManager.update,
	},
)

type ViewportProps = Omit<ComponentProps<typeof Base.Viewport>, "className"> & {
	className?: string
	/** Screen anchor for the toast stack. @default "top-right" */
	position?: ToastPosition
	/**
	 * Stack the toasts on top of one another, the newest in front, instead of
	 * listing them. Hovering or focusing the stack fans it out. @default false
	 */
	stacked?: boolean
}

/** Moves the viewport to `<body>`, carrying any themed-subtree scope across. */
const ToastPortal = withPortalThemeScope(Base.Portal)

/**
 * The fixed region that hosts the toast stack. Top-right by default; collision
 * is irrelevant since it's screen-anchored. Pointer events pass through the gaps
 * so the page stays interactive around the toasts. `position` picks the anchor;
 * `className` merges last for safe-area or offset tweaks.
 *
 * Portaled to `<body>`: rendered in place, `fixed` resolved against any ancestor
 * with a transform, translate, filter or contain (a route's enter animation is
 * enough), so the stack landed in the content column instead of the screen corner.
 */
export function ToastViewport({
	className,
	position = "top-right",
	stacked = false,
	...props
}: ViewportProps) {
	return (
		<ToastViewportContext.Provider value={{ position, stacked }}>
			<ToastPortal>
				<Base.Viewport
					// styles.css moves the stack clear of an open Sheet on its edge.
					data-sable-toast-viewport=""
					data-position={position}
					className={cn(
						"fixed z-(--z-toast) w-95 max-w-[90vw] outline-none",
						// Stacked toasts are positioned against the viewport, not laid out in it.
						!stacked && "flex flex-col gap-2",
						POSITION[position],
						className,
					)}
					{...props}
				/>
			</ToastPortal>
		</ToastViewportContext.Provider>
	)
}

type RootProps = Omit<ComponentProps<typeof Base.Root>, "className"> & {
	className?: string
}

/**
 * A single toast surface. Requires the `toast` object from the manager. Enter and
 * leave animate via data-[starting-style]/data-[ending-style]; swipe-to-dismiss
 * is wired by Base UI.
 */
export function ToastRoot({ className, ...props }: RootProps) {
	const { position, stacked } = useContext(ToastViewportContext)
	return (
		<Base.Root
			className={cn(
				"flex w-full gap-3 rounded-md border border-border-floating bg-popover p-4 text-popover-foreground shadow-xl",
				stacked ? [STACKED_ROOT, STACKED_EDGE[edgeOf(position)]] : ENTER_MOTION[position],
				className,
			)}
			{...props}
		/>
	)
}

type ContentProps = Omit<ComponentProps<typeof Base.Content>, "className"> & {
	className?: string
}

/**
 * The toast's contents (icon, text, action, close) as one row. In a stacked
 * viewport the contents of the cards behind the front one fade, since only an
 * edge of them shows, and come back when the stack fans out.
 */
export function ToastContent({ className, ...props }: ContentProps) {
	const { stacked } = useContext(ToastViewportContext)
	return (
		<Base.Content
			className={cn(
				"flex min-w-0 flex-1 gap-3",
				stacked &&
					"transition-opacity duration-(--motion-duration-base) ease-standard data-behind:not-data-expanded:pointer-events-none data-behind:not-data-expanded:opacity-0",
				className,
			)}
			{...props}
		/>
	)
}

type TitleProps = Omit<ComponentProps<typeof Base.Title>, "className"> & {
	className?: string
}

/** The toast headline. Auto-associated as the toast's accessible name. */
export function ToastTitle({ className, ...props }: TitleProps) {
	return (
		<Base.Title
			className={cn("text-title-sm", className)}
			{...props}
		/>
	)
}

type DescriptionProps = Omit<
	ComponentProps<typeof Base.Description>,
	"className"
> & { className?: string }

/** Supporting body copy beneath the title. */
export function ToastDescription({ className, ...props }: DescriptionProps) {
	return (
		<Base.Description
			className={cn("text-body-sm text-muted-foreground", className)}
			{...props}
		/>
	)
}

type CloseProps = Omit<ComponentProps<typeof Base.Close>, "className"> & {
	className?: string
}

/**
 * Dismisses the toast. Base UI handles the close + leave animation.
 *
 * The drawn box stays 24px (21 at the desktop root, which is where this missed
 * WCAG 2.5.8) and `hitTargetMin` grows the target instead. Enlarging the glyph
 * would make the loudest control in a toast the way to get rid of it, and the
 * dismiss is not the point of the toast — the message is. That is also why it
 * is not a composed Button: no Button size is 24px, and growing the dismiss to
 * the nearest one would make it louder than the message.
 */
export function ToastClose({ className, children, ...props }: CloseProps) {
	return (
		<Base.Close
			className={cn(
				"-m-1 ms-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none motion-interactive",
				hitTargetMin,
				"hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
				className,
			)}
			aria-label="Dismiss"
			{...props}
		>
			{children}
		</Base.Close>
	)
}

type ActionProps = Omit<ComponentProps<typeof Base.Action>, "className"> & {
	className?: string
}

/**
 * An inline action button (e.g. Undo). Compose with render={<Button … />}.
 * Base UI sources its children and handlers from the toast's own `actionProps`
 * and renders nothing when there are none, so `ToastList` mounts one on every
 * toast — reach for this directly only when composing a toast by hand.
 */
export function ToastAction({ className, ...props }: ActionProps) {
	// Composed from Button, so the toast's action has the same radius, height,
	// focus ring and press feedback as every other secondary button.
	return <Base.Action render={<Button variant="secondary" size="sm" className={className} />} {...props} />
}

export interface ToastProviderProps {
	children?: ReactNode
	/**
	 * Default auto-dismiss time in ms. `0` keeps toasts until dismissed.
	 * @default 5000
	 */
	timeout?: number
	/**
	 * Max toasts shown at once; older ones are pushed out.
	 * @default 3
	 */
	limit?: number
	/** Override the dismiss-button icon (defaults to an X). */
	closeIcon?: ReactNode
	/** Screen anchor for the toast stack. @default "top-right" */
	position?: ToastPosition
	/**
	 * Stack the toasts like a deck of cards, the newest in front and the older
	 * ones peeking out behind it, instead of listing them one under another.
	 * Hovering or focusing the stack fans it out into the list. @default false
	 */
	stacked?: boolean
	/**
	 * Extra classes merged LAST onto the fixed viewport region — for safe-area
	 * insets or an offset (e.g. clearing a sidebar). @example
	 * "top-[calc(1rem+env(safe-area-inset-top))]"
	 */
	viewportClassName?: string
}

/**
 * Wraps Base UI's Toast.Provider and renders the themed Viewport + the toast
 * list. Mount once near the app root, above any component that calls useToast().
 * Each manager toast renders as a Title + optional Description + an optional
 * action + a Close button. The action comes from `actionProps` on the toast:
 *
 *   toast("Layer deleted", {
 *     actionProps: { children: "Undo", onClick: () => restore(id) },
 *   })
 *
 * The action does NOT dismiss the toast — Base UI leaves that to the handler, so
 * call `toast.dismiss(id)` yourself when the action should close it.
 */
export function ToastProvider({
	children,
	timeout,
	limit,
	closeIcon,
	position,
	stacked,
	viewportClassName,
}: ToastProviderProps) {
	return (
		<Base.Provider timeout={timeout} limit={limit} toastManager={toastManager}>
			{children}
			<ToastList
				closeIcon={closeIcon}
				position={position}
				stacked={stacked}
				viewportClassName={viewportClassName}
			/>
		</Base.Provider>
	)
}

/** Left-edge accent per toast type (semantic tones; loading uses a spinner instead). */
const TYPE_ACCENT: Record<string, string> = {
	success: "bg-success",
	error: "bg-destructive",
	warning: "bg-tone-warning",
	info: "bg-tone-info",
}

function ToastList({
	closeIcon,
	position,
	stacked,
	viewportClassName,
}: {
	closeIcon?: ReactNode
	position?: ToastPosition
	stacked?: boolean
	viewportClassName?: string
}) {
	const { toasts } = useToast()
	return (
		<ToastViewport position={position} stacked={stacked} className={viewportClassName}>
			{toasts.map((item) => {
				const accent = item.type ? TYPE_ACCENT[item.type] : undefined
				return (
					<ToastRoot key={item.id} toast={item}>
						<ToastContent>
							{item.type === "loading" ? (
								<Spinner
									aria-hidden={true}
									className="mt-0.5 size-4 shrink-0 text-muted-foreground"
								/>
							) : accent ? (
								<span
									aria-hidden={true}
									className={cn("w-1 shrink-0 self-stretch rounded-full", accent)}
								/>
							) : null}
							<div className="flex min-w-0 flex-1 flex-col gap-1">
								{item.title ? <ToastTitle>{item.title}</ToastTitle> : null}
								{item.description ? (
									<ToastDescription>{item.description}</ToastDescription>
								) : null}
							</div>
							{/*
								Renders only when the toast carries `actionProps` — Base UI's
								Action returns null without children, so this is free for the
								toasts that have no action. Without it, `actionProps` is
								accepted by the manager and silently dropped.
							*/}
							<ToastAction className="self-center" />
							<ToastClose>{closeIcon ?? <Icon name="xmark" className="text-sm" />}</ToastClose>
						</ToastContent>
					</ToastRoot>
				)
			})}
		</ToastViewport>
	)
}
