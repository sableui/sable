"use client"

import {
	Children,
	type ComponentPropsWithRef,
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/cn"
import { useAnchoredDensity, useTypeTier } from "../../lib/density"
import { HighlightGlide } from "../../lib/highlight-glide"
import { applyPortalThemeScope, resolvePortalThemeScope } from "../../lib/portal-theme-scope"
import type { UseCaretTriggerResult } from "../../lib/use-caret-trigger"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { type ItemContent, MENU_ITEM, useItemContent } from "../menu/menu"

/** Room kept between the popup and the viewport's edge, and between it and the caret. */
const EDGE = 8
const GAP = 4

const CaretMenuContext = createContext<{
	activeId: string | null
	setActive: (id: string) => void
} | null>(null)

export interface CaretMenuProps {
	/** The result of `useCaretTrigger`, attached to the field the suggestions are for. */
	trigger: UseCaretTriggerResult
	/** The list's accessible name, e.g. "People" or "Commands". */
	label: string
	/**
	 * A row under the items for what the list is doing: "Searching…", "No one
	 * matches", "Couldn't load people". It is also announced, politely, in place
	 * of the suggestion count. With no items and no status the menu stays shut.
	 */
	status?: ReactNode
	/** `CaretMenuItem`s, already filtered for `trigger.match.query`. */
	children?: ReactNode
	/** Layout classes for the popup (a width, say). */
	className?: string
}

/**
 * CaretMenu — suggestions at the caret of a text field, for mentions and slash
 * commands. Pair it with `useCaretTrigger`, which watches the field; this draws
 * the list beside the trigger and drives it from the field's keys.
 *
 *   const trigger = useCaretTrigger({ triggers: [{ char: "@", allowSpaces: true }] })
 *   const q = trigger.match?.query.toLowerCase() ?? ""
 *   <Textarea ref={trigger.fieldRef} … />
 *   <CaretMenu trigger={trigger} label="People">
 *     {people.filter((p) => p.name.toLowerCase().includes(q)).map((p) => (
 *       <CaretMenuItem key={p.id} onSelect={() => trigger.replace(`@${p.name} `)}>{p.name}</CaretMenuItem>
 *     ))}
 *   </CaretMenu>
 *
 * **Focus never leaves the field.** That is the whole interaction: the person
 * is typing, and a list that took focus would eat the next keystroke. So the
 * field carries the list's semantics and the popup is only ever pointed at:
 *
 * - An `<input>` becomes the ARIA combobox it is (`role="combobox"`,
 *   `aria-expanded`). A `<textarea>` keeps its textbox role, because
 *   `combobox` would lose `aria-multiline` and screen readers would stop
 *   treating it as a place to write paragraphs. A textbox may not carry
 *   `aria-expanded`, so for both, opening is also announced through a polite
 *   status ("3 suggestions"), mounted from the start so it is heard.
 * - Both get `aria-autocomplete="list"`, `aria-controls` (the listbox) and
 *   `aria-activedescendant` (the highlighted option), which is how a screen
 *   reader follows the arrow keys without focus moving.
 * - ↑/↓ move the highlight, Enter or Tab pick it, Escape closes the list and
 *   stays out of the way of a Dialog's own Escape. Shift+Enter is left alone,
 *   so a line break is still a line break.
 * - Rows keep focus where it is on pointer down, so clicking one does not blur
 *   the field (which would close the list before the click lands).
 *
 * Positioned by hand at the caret rather than through a Base UI positioner:
 * every Base UI popup manages focus, and this one must never take it. It
 * flips above the caret when there is more room there, caps its height to the
 * room it has, and keeps clear of the viewport's edges.
 */
export function CaretMenu({ trigger, label, status, children, className }: CaretMenuProps) {
	const { field, match } = trigger
	const listId = useId()
	const anchoredDensity = useAnchoredDensity()
	const tier = useTypeTier()
	const popupRef = useRef<HTMLDivElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const [activeId, setActiveId] = useState<string | null>(null)
	const [count, setCount] = useState(0)
	// The hook returns a fresh object each render; effects read it through a
	// ref so they subscribe once per open, not once per keystroke.
	const triggerRef = useRef(trigger)
	triggerRef.current = trigger
	const hasItems = Children.toArray(children).length > 0
	const open = match !== null && field !== null && (hasItems || status != null)

	// Keep a valid highlight: the first option whenever the one highlighted is
	// gone (the query narrowed the list, or the list just opened).
	useIsomorphicLayoutEffect(() => {
		const options = open ? optionsIn(listRef.current) : []
		setCount(options.length)
		if (!options.some((o) => o.id === activeId)) setActiveId(options[0]?.id ?? null)
	})

	// The field speaks for the list (see above). Set imperatively, because the
	// field belongs to whoever rendered it, and handed back exactly as found:
	// while this menu is mounted an <input> is a combobox, collapsed or not, and
	// when it unmounts every attribute it wrote comes off, or a screen reader
	// keeps announcing a list that no longer exists.
	useEffect(() => {
		if (!field) return
		const isInput = field instanceof HTMLInputElement
		if (isInput) field.setAttribute("role", "combobox")
		field.setAttribute("aria-autocomplete", "list")
		return () => {
			if (isInput) {
				field.removeAttribute("role")
				field.removeAttribute("aria-expanded")
			}
			field.removeAttribute("aria-autocomplete")
		}
	}, [field])
	useEffect(() => {
		if (!field) return
		if (field instanceof HTMLInputElement) field.setAttribute("aria-expanded", String(open))
		if (!open) return
		field.setAttribute("aria-controls", listId)
		if (activeId) field.setAttribute("aria-activedescendant", activeId)
		else field.removeAttribute("aria-activedescendant")
		return () => {
			field.removeAttribute("aria-activedescendant")
			field.removeAttribute("aria-controls")
		}
	}, [field, open, listId, activeId])

	// Keys stay in the field; a native listener runs before React's handlers,
	// so `preventDefault` here is what a ChatComposer reads to skip sending.
	const activeRef = useRef(activeId)
	activeRef.current = activeId
	useEffect(() => {
		if (!field || !open) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.isComposing) return
			const options = optionsIn(listRef.current)
			const index = options.findIndex((o) => o.id === activeRef.current)
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				if (!options.length) return
				event.preventDefault()
				const step = event.key === "ArrowDown" ? 1 : -1
				const next = options[(index + step + options.length) % options.length]
				setActiveId(next.id)
				next.scrollIntoView?.({ block: "nearest" })
			} else if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
				if (index < 0) return
				event.preventDefault()
				options[index].click()
			} else if (event.key === "Escape") {
				event.preventDefault()
				event.stopPropagation()
				triggerRef.current.dismiss()
			}
		}
		// Widened to HTMLElement: on the input | textarea union TypeScript cannot
		// pick the keydown overload.
		const target: HTMLElement = field
		target.addEventListener("keydown", onKeyDown)
		return () => target.removeEventListener("keydown", onKeyDown)
	}, [field, open])

	// Place the popup at the caret, and again whenever anything under it moves.
	const place = useCallback(() => {
		const popup = popupRef.current
		const anchor = triggerRef.current.getAnchorRect()
		if (!popup || !anchor) return
		const view = popup.ownerDocument.defaultView ?? window
		// scrollHeight is the whole list even under a cap. Lifting the cap to
		// measure (the obvious way) clamps the list's scroll to the top on every
		// placement, so a highlight below the fold scrolled straight back out.
		const natural = popup.scrollHeight
		const below = view.innerHeight - (anchor.bottom + GAP) - EDGE
		const above = anchor.top - GAP - EDGE
		const flip = natural > below && above > below
		const room = Math.max(0, flip ? above : below)
		popup.style.maxHeight = `${room}px`
		const height = Math.min(natural, room)
		popup.style.top = `${flip ? anchor.top - GAP - height : anchor.bottom + GAP}px`
		popup.style.setProperty("--transform-origin", flip ? "left bottom" : "left top")
		// Line the rows' text up under the trigger character: pull the popup
		// left by its own inset plus a row's inline padding.
		const option = optionsIn(listRef.current)[0]
		const inset =
			Number.parseFloat(view.getComputedStyle(popup).paddingLeft) +
			(option ? Number.parseFloat(view.getComputedStyle(option).paddingLeft) : 0)
		const width = popup.offsetWidth
		const left = Math.min(anchor.left - inset, view.innerWidth - EDGE - width)
		popup.style.left = `${Math.max(EDGE, left)}px`
	}, [])

	useIsomorphicLayoutEffect(() => {
		if (open) place()
	})

	useEffect(() => {
		if (!open || !field) return
		const view = field.ownerDocument.defaultView ?? window
		// Capture phase sees every scroll on the page; the list's own is not a
		// reason to move the list.
		const onScroll = (event: Event) => {
			if (popupRef.current?.contains(event.target as Node)) return
			place()
		}
		const listeners = new AbortController()
		const { signal } = listeners
		view.addEventListener("resize", place, { signal })
		view.addEventListener("scroll", onScroll, { capture: true, signal })
		return () => listeners.abort()
	}, [open, field, place])

	// Enter: render with data-starting-style, then drop it so motion-pop
	// transitions in. Leaving is instant: the list answers a keystroke and
	// should be gone by the next one.
	const [entered, setEntered] = useState(false)
	useEffect(() => {
		if (!open) {
			setEntered(false)
			return
		}
		const frame = requestAnimationFrame(() => setEntered(true))
		return () => cancelAnimationFrame(frame)
	}, [open])

	// Carry a themed subtree's theme and mode across the portal, as every
	// Sable popup does.
	const setScope = useCallback(
		(node: HTMLDivElement | null) => {
			if (node && field) applyPortalThemeScope(node, resolvePortalThemeScope(field))
		},
		[field],
	)

	const announcement = !open ? "" : status != null && typeof status !== "boolean" ? status : `${count} ${count === 1 ? "suggestion" : "suggestions"}`

	return (
		<CaretMenuContext.Provider value={{ activeId, setActive: setActiveId }}>
			<span role="status" aria-live="polite" className="sr-only">
				{announcement}
			</span>
			{open && field
				? createPortal(
						<div ref={setScope} data-slot="caret-menu-portal">
							<div
								ref={popupRef}
								{...anchoredDensity}
								data-slot="caret-menu"
								data-starting-style={entered ? undefined : ""}
								className={cn(
									"fixed z-(--z-overlay) min-w-48 max-w-[min(24rem,calc(100vw-1rem))] rounded-md border border-border-floating bg-popover popup-inset text-popover-foreground shadow-md outline-none",
									"overflow-y-auto overscroll-contain scrollbar-quiet motion-pop",
									className,
								)}
							>
								<HighlightGlide />
								<div ref={listRef} id={listId} role="listbox" aria-label={label}>
									{children}
								</div>
								{status != null ? (
									<div data-slot="caret-menu-status" className={cn("px-(--item-px) py-1.5 text-muted-foreground", tier.secondary)}>
										{status}
									</div>
								) : null}
							</div>
						</div>,
						field.ownerDocument.body,
					)
				: null}
		</CaretMenuContext.Provider>
	)
}

function optionsIn(list: HTMLElement | null): HTMLElement[] {
	if (!list) return []
	return [...list.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])')]
}

export type CaretMenuItemProps = Omit<ComponentPropsWithRef<"div">, "onSelect"> &
	ItemContent & {
		/** What choosing the row does: `trigger.replace("@Sam Rivera ")` for a mention, run the command and `trigger.replace("")` for a slash command. */
		onSelect: () => void
		/** Shown but not choosable; skipped by the arrow keys. @default false */
		disabled?: boolean
	}

/**
 * One suggestion. Takes `icon` and `description` like MenuItem, and looks
 * like one, so a mention list and a menu are the same rows.
 */
export function CaretMenuItem({
	onSelect,
	disabled = false,
	icon,
	description,
	className,
	children,
	id,
	...props
}: CaretMenuItemProps) {
	const context = useContext(CaretMenuContext)
	const tier = useTypeTier()
	const ownId = useId()
	const optionId = id ?? ownId
	const active = context?.activeId === optionId
	const content = useItemContent(children, { icon, description })
	return (
		<div
			{...props}
			id={optionId}
			role="option"
			aria-selected={active}
			aria-disabled={disabled || undefined}
			data-highlighted={active ? "" : undefined}
			data-disabled={disabled ? "" : undefined}
			className={cn(MENU_ITEM, tier.body, className)}
			// Keep focus in the field: a pointer down here would otherwise blur it,
			// and a blurred field closes the list before the click arrives.
			onMouseDown={(event) => event.preventDefault()}
			onMouseMove={() => {
				if (!disabled && !active) context?.setActive(optionId)
			}}
			onClick={() => {
				if (!disabled) onSelect()
			}}
		>
			{content}
		</div>
	)
}
