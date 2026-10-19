import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

/**
 * Focus return for a modal surface (Dialog, AlertDialog, Sheet): on close,
 * focus goes back to the element that held it when the surface OPENED — a
 * DialogTrigger or not.
 *
 * Base UI's own default returns to the trigger it knows about (`domReference`)
 * and, without one, to the last entry in a module-wide history it records when
 * the popup mounts. Two things go wrong for a dialog an app opens from its own
 * button through controlled `open`:
 *
 * - The history entry is taken AFTER the popup commits. Anything inside that
 *   focuses itself on mount — an `autoFocus` field, CommandMenu's search box —
 *   has already moved focus by then, so the "previous" element recorded is the
 *   field inside the dialog. On close it is gone, and focus drops to `<body>`.
 * - The history is shared by every popup and never popped, so a dialog opened
 *   while nothing held focus returns to whatever an unrelated popup left last.
 *
 * So the root captures the opener itself, at the moment `open` turns true —
 * from its own `onOpenChange` (a trigger, a detached handle) or, for controlled
 * `open`, during the render that flips it, before any child has mounted — and
 * the popup's `finalFocus` default resolves to it. An explicit `finalFocus` on
 * the content part still wins. When there is no opener to go back to (nothing
 * was focused, or it has since left the DOM) the default falls through to Base
 * UI's own (`true`), so a trigger is still found the way it always was.
 */

/** What a popup's `finalFocus` callback may return — Base UI's contract. */
type FinalFocusResult = boolean | HTMLElement | null | void

interface FocusReturn {
	/** The default `finalFocus` for the content part. */
	finalFocus: (closeType: unknown) => FinalFocusResult
	/**
	 * A callback ref the content part merges onto its popup, so focus inside it
	 * can be told from focus elsewhere. A callback rather than a ref object so it
	 * merges onto any element type.
	 */
	popupRef: (node: HTMLElement | null) => void
}

const FocusReturnContext = createContext<FocusReturn | null>(null)

/** The element that holds focus now, through open shadow roots; `null` for `<body>` or none. */
function focusedElement(): HTMLElement | null {
	if (typeof document === "undefined") return null
	let element: Element | null = document.activeElement
	while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement
	return element instanceof HTMLElement && element !== document.body ? element : null
}

/**
 * The root half: wraps the root's `onOpenChange` and watches `open`, and hands
 * the content part its default through context. Pass `onOpenChange` to the
 * Base UI root and wrap it in `<FocusReturnProvider value={focusReturn}>`.
 */
export function useFocusReturn<Args extends unknown[]>(
	open: boolean | undefined,
	onOpenChange: ((open: boolean, ...rest: Args) => void) | undefined,
) {
	const [opener, setOpener] = useState<HTMLElement | null>(null)
	const popupRef = useRef<HTMLElement | null>(null)

	// Controlled `open`: capture in the render that flips it, the sanctioned
	// "adjust state while rendering" shape. Children have not committed yet, so
	// an autoFocus field inside has not taken focus. A discarded render discards
	// this update with it.
	const [wasOpen, setWasOpen] = useState(false)
	if (open !== undefined && open !== wasOpen) {
		setWasOpen(open)
		if (open) setOpener(focusedElement())
	}

	const handleOpenChange = useCallback(
		(next: boolean, ...rest: Args) => {
			// Uncontrolled (a trigger, a detached handle): the event is the moment.
			if (next && open === undefined) setOpener(focusedElement())
			onOpenChange?.(next, ...rest)
		},
		[open, onOpenChange],
	)

	const value = useMemo<FocusReturn>(
		() => ({
			popupRef(node) {
				popupRef.current = node
			},
			// Base UI reads finalFocus when the popup closes, from the latest props,
			// so a new function per opener is picked up.
			finalFocus() {
				const target = opener
				if (!target?.isConnected) return true
				// Focus the user moved out of the surface on purpose (a non-modal
				// dialog left by clicking into another field) stays where they put
				// it — the same courtesy Base UI's default extends.
				const active = focusedElement()
				const popup = popupRef.current
				if (active && active !== target && popup && !popup.contains(active)) return false
				return target
			},
		}),
		[opener],
	)

	return { onOpenChange: handleOpenChange, focusReturn: value }
}

/** Render around the Base UI root with `value={focusReturn}` from {@link useFocusReturn}. */
export const FocusReturnProvider = FocusReturnContext.Provider

/** The content half: the root's default `finalFocus` and the popup ref to merge, or `null` outside a Sable root. */
export function useFocusReturnDefault() {
	return useContext(FocusReturnContext)
}
