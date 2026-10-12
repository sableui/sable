"use client";

import {
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"
import { FIELD_SHELL_XS } from "../../lib/field-shell"
import { useIsomorphicLayoutEffect } from "../../lib/use-isomorphic-layout-effect"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "../collapsible/collapsible"
import { SearchInput } from "../search-input/search-input"

/**
 * DisclosurePicker — a property row that names the current value and opens a
 * list IN PLACE beneath it, pushing what follows down, instead of floating a
 * popup over it.
 *
 *   <DisclosurePicker>
 *     <DisclosurePickerTrigger label="Body">Inter</DisclosurePickerTrigger>
 *     <DisclosurePickerPanel>
 *       <DisclosurePickerList aria-label="Body font" value={font} onValueChange={setFont}>
 *         <DisclosurePickerOption value="Inter">Inter</DisclosurePickerOption>
 *       </DisclosurePickerList>
 *     </DisclosurePickerPanel>
 *   </DisclosurePicker>
 *
 * Why not a Select: a tool panel's choices are made while looking at what they
 * change. A popup covers the preview the choice is about; a list that opens in
 * the panel keeps the row, the list and the preview in one column. Built on
 * Collapsible, so the trigger is a real button with aria-expanded/controls and
 * the panel animates with motion-disclosure (static under reduced motion).
 *
 * The list is a listbox, not a radio group: arrow keys move through it and
 * nothing happens until Enter (or Space, or a click) picks. A radio group's
 * checked state follows focus, so each arrow press was a pick — fine for a free
 * toggle, wrong for a choice with a cost (a confirm, a font load, a reset).
 *
 * Grew out of the docs Customize panel, where a font row and a preset row had
 * become two hand copies of the same disclosure.
 */

type Size = "md" | "xs"
type FocusIntent = "keyboard" | "pointer" | null

interface PickerContext {
	open: boolean
	setOpen: (open: boolean) => void
	size: Size
	triggerRef: RefObject<HTMLButtonElement | null>
	panelRef: RefObject<HTMLDivElement | null>
	intentRef: RefObject<FocusIntent>
	/** Moves focus into the open list: the search field when there is one, else the chosen option. */
	focusList: (preferSearch: boolean) => void
}

const Context = createContext<PickerContext | null>(null)

function usePicker(part: string): PickerContext {
	const ctx = useContext(Context)
	if (!ctx) throw new Error(`<${part}> must be rendered inside <DisclosurePicker>.`)
	return ctx
}

/**
 * Open state, the row's size and a `close()` for a list the picker does not own
 * (a Tree, a bespoke grid) that should still close the row when something is
 * picked. Inside a DisclosurePicker only.
 */
export function useDisclosurePicker(): { open: boolean; close: () => void; size: Size } {
	const { open, setOpen, size } = usePicker("useDisclosurePicker")
	return { open, close: () => setOpen(false), size }
}

const SEARCH_SELECTOR = "[data-disclosure-picker-search] input"
const OPTION = '[role="option"]'
const ENABLED_OPTION = '[role="option"]:not([aria-disabled="true"])'
const CHOSEN_OPTION = '[role="option"][aria-selected="true"]'

function chosenOption(panel: HTMLElement | null): HTMLElement | null {
	if (!panel) return null
	return panel.querySelector<HTMLElement>(CHOSEN_OPTION) ?? panel.querySelector<HTMLElement>(ENABLED_OPTION)
}

export interface DisclosurePickerProps
	extends Omit<ComponentProps<typeof Collapsible>, "className" | "open" | "defaultOpen" | "onOpenChange"> {
	/** Controlled open state. Pair with `onOpenChange`; leave both off to let the row own it. */
	open?: boolean
	/** Uncontrolled initial open state. @default false */
	defaultOpen?: boolean
	/** Called with the next open state — on the trigger, on a pick, on Escape. */
	onOpenChange?: (open: boolean) => void
	/**
	 * Which rung the row sits on. `md` is a 40px row in a settings panel; `xs` is
	 * the property-grid rung — a `--control-xs` row on the inset `panel-field`
	 * fill, the same shape as a ScrubField or an xs SelectTrigger beside it.
	 * Height, padding, radius, type and surface move together, which is why it is
	 * a prop and not a className. @default "md"
	 */
	size?: Size
	className?: string
}

/**
 * The root: a Collapsible that also owns focus. Opening from the keyboard moves
 * focus into the list (the search field, or the chosen option when there is no
 * search); closing with focus inside returns it to the trigger. While the panel
 * grows it keeps the whole row on screen, so a picker near the foot of a
 * scrolling panel does not open out of sight; and it opens with the chosen
 * option centred in a scrolling list, not wherever the list last was.
 */
export function DisclosurePicker({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	size = "md",
	className,
	ref,
	children,
	...props
}: DisclosurePickerProps) {
	const [uncontrolled, setUncontrolled] = useState(defaultOpen)
	const controlled = openProp !== undefined
	const open = controlled ? openProp : uncontrolled
	const rootRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement | null>(null)
	const panelRef = useRef<HTMLDivElement | null>(null)
	const intentRef = useRef<FocusIntent>(null)
	const focusInsideRef = useRef(false)

	const setOpen = useCallback(
		(next: boolean) => {
			if (!controlled) setUncontrolled(next)
			onOpenChange?.(next)
		},
		[controlled, onOpenChange],
	)

	const focusList = useCallback((preferSearch: boolean) => {
		const panel = panelRef.current
		const search = preferSearch ? panel?.querySelector<HTMLInputElement>(SEARCH_SELECTOR) : null
		;(search ?? chosenOption(panel))?.focus({ preventScroll: true })
	}, [])

	useEffect(() => {
		const root = rootRef.current
		if (!open || !root) {
			// Closed with focus inside (a pick, Escape, or the parent closing it): the
			// focused row is about to collapse out from under the user, so hand focus
			// back to the row that opened it. Not when focus has already moved on —
			// a confirm dialog the pick opened keeps its own autoFocus.
			const active = document.activeElement
			const lost = !active || active === document.body
			if (panelRef.current?.contains(active) || (focusInsideRef.current && lost)) {
				triggerRef.current?.focus({ preventScroll: true })
			}
			focusInsideRef.current = false
			return
		}
		// Follow the panel while it grows (it animates its height); let go once it
		// has settled, so it never fights a scroll the user starts.
		const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => root.scrollIntoView?.({ block: "nearest" }))
		observer?.observe(root)
		const settle = window.setTimeout(() => observer?.disconnect(), 500)
		const frame = requestAnimationFrame(() => {
			const panel = panelRef.current
			// Open on the current choice, centred in a list that scrolls.
			const chosen = panel?.querySelector<HTMLElement>(CHOSEN_OPTION)
			const list = chosen?.closest<HTMLElement>('[role="listbox"]')
			if (list && chosen && list.scrollHeight > list.clientHeight) {
				list.scrollTop = chosen.offsetTop - (list.clientHeight - chosen.offsetHeight) / 2
			}
			const intent = intentRef.current
			intentRef.current = null
			// Opened by the parent (or defaultOpen): focus is not ours to move.
			if (!intent) return
			const hasSearch = !!panel?.querySelector(SEARCH_SELECTOR)
			// A pointer opens straight into the search field where there is a
			// keyboard to type with; on touch that would raise the on-screen
			// keyboard over the list the user is about to tap, so focus stays put.
			const finePointer = typeof window.matchMedia === "function" && window.matchMedia("(pointer: fine)").matches
			if (intent === "keyboard") focusList(true)
			else if (hasSearch && finePointer) focusList(true)
		})
		return () => {
			observer?.disconnect()
			window.clearTimeout(settle)
			cancelAnimationFrame(frame)
		}
	}, [open, focusList])

	const value = useMemo<PickerContext>(
		() => ({ open, setOpen, size, triggerRef, panelRef, intentRef, focusList }),
		[open, setOpen, size, focusList],
	)

	return (
		<Context.Provider value={value}>
			<Collapsible
				ref={(node: HTMLDivElement | null) => {
					rootRef.current = node
					if (typeof ref === "function") ref(node)
					else if (ref) ref.current = node
				}}
				open={open}
				onOpenChange={(next) => {
					if (!next) intentRef.current = null
					setOpen(next)
				}}
				data-size={size}
				onFocus={(event) => {
					if (panelRef.current?.contains(event.target)) focusInsideRef.current = true
				}}
				onBlur={(event) => {
					if (!panelRef.current?.contains(event.relatedTarget as Node | null)) focusInsideRef.current = false
				}}
				className={cn(
					// Breathing room when the row scrolls itself into view.
					"scroll-my-3",
					size === "xs" ? "rounded-[var(--panel-field-radius,var(--radius-xs))]" : "rounded-sm",
					// Open, the row and its list share one recessed well.
					open && "sable-well",
					className,
				)}
				{...props}
			>
				{children}
			</Collapsible>
		</Context.Provider>
	)
}
DisclosurePicker.displayName = "DisclosurePicker"

export interface DisclosurePickerTriggerProps
	extends Omit<ComponentProps<typeof CollapsibleTrigger>, "className" | "children"> {
	/** A leading caption naming the property ("Body", "Theme"), muted, on a fixed column so stacked rows align. */
	label?: ReactNode
	/** A leading visual before the value — a theme tile, a swatch. Not truncated. */
	media?: ReactNode
	/** The current value. Truncates on one line; render it in its own face or colour if that is the point. */
	children?: ReactNode
	className?: string
}

/**
 * The row: optional caption, optional media, the value, and a chevron that
 * flips when open. A real button — Base UI wires aria-expanded and
 * aria-controls — so its accessible name is its text (caption + value) unless
 * an aria-label says it better.
 */
export function DisclosurePickerTrigger({
	label,
	media,
	children,
	className,
	ref,
	onKeyDown,
	onPointerDown,
	...props
}: DisclosurePickerTriggerProps) {
	const { open, setOpen, size, triggerRef, intentRef, focusList } = usePicker("DisclosurePickerTrigger")
	return (
		<CollapsibleTrigger
			ref={(node: HTMLButtonElement | null) => {
				triggerRef.current = node
				if (typeof ref === "function") ref(node)
				else if (ref) ref.current = node
			}}
			onPointerDown={(event) => {
				intentRef.current = "pointer"
				onPointerDown?.(event)
			}}
			onKeyDown={(event) => {
				onKeyDown?.(event)
				if (event.defaultPrevented) return
				if (event.key === "Enter" || event.key === " ") intentRef.current = "keyboard"
				if (event.key === "Escape" && open) {
					event.preventDefault()
					event.stopPropagation()
					setOpen(false)
				}
				// ArrowDown opens, and once open steps into the list — the way a
				// select's trigger does, so the list is one key away either way.
				if (event.key === "ArrowDown") {
					event.preventDefault()
					if (open) focusList(true)
					else {
						intentRef.current = "keyboard"
						setOpen(true)
					}
				}
			}}
			className={cn(
				"group/disclosure-picker flex w-full items-center gap-2 text-start text-foreground motion-interactive",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
				size === "xs"
					? cn("h-(--control-xs) px-1.5", FIELD_SHELL_XS)
					: cn(
							// Hover is a step off whatever surface the row sits on, never a
							// fixed fill: a popover-coloured hover read as a hole in the panel.
							"h-(--control-md) rounded-[inherit] px-3 sable-surface-interactive",
							// Closed, the row is its own well; open, the root's well holds both.
							!open && "sable-well",
						),
				className,
			)}
			{...props}
		>
			{label != null ? (
				<span className={cn("shrink-0 truncate text-muted-foreground", size === "xs" ? "w-16 text-ui-md" : "w-20 text-body-sm")}>{label}</span>
			) : null}
			{media != null ? <span className="flex shrink-0 items-center">{media}</span> : null}
			<span className={cn("min-w-0 flex-1 truncate", size === "xs" ? "text-ui-md" : "text-body-md")}>{children}</span>
			<Icon
				name="chevron-down"
				className="shrink-0 text-sm text-muted-foreground motion-interactive group-data-[panel-open]/disclosure-picker:rotate-180"
			/>
		</CollapsibleTrigger>
	)
}
DisclosurePickerTrigger.displayName = "DisclosurePickerTrigger"

/** The search field a long list opts into: controlled, because the consumer does the filtering. */
export interface DisclosurePickerSearch {
	/** The query. */
	value: string
	/** Called on every keystroke; cleared with `""` when the picker closes. */
	onValueChange: (value: string) => void
	/** @default "Search" */
	placeholder?: string
	/** Accessible name of the field. @default the placeholder */
	label?: string
}

export interface DisclosurePickerPanelProps
	extends Omit<ComponentProps<typeof CollapsiblePanel>, "className" | "children"> {
	/**
	 * Opt in to a search field above the list. Off by default: a short list
	 * (a handful of presets) reads faster than a field you have to skip past.
	 * Turn it on once the list scrolls — roughly a dozen options or more.
	 */
	search?: DisclosurePickerSearch
	children?: ReactNode
	className?: string
}

/**
 * What opens beneath the row: the optional search field and the list, divided
 * from the row by a hairline. Escape closes it and returns focus to the row
 * (first clearing a query, if there is one) without changing the value;
 * ArrowDown in the search field steps into the list.
 */
export function DisclosurePickerPanel({ search, children, className, ...props }: DisclosurePickerPanelProps) {
	const { open, setOpen, panelRef, focusList } = usePicker("DisclosurePickerPanel")
	// A query belongs to one visit: the list reopens whole.
	const clear = search?.value ? search.onValueChange : null
	useEffect(() => {
		if (!open && clear) clear("")
	}, [open, clear])

	return (
		<CollapsiblePanel {...props}>
			<div
				ref={panelRef}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						event.preventDefault()
						event.stopPropagation()
						const target = event.target as HTMLElement
						if (search?.value && target.matches(SEARCH_SELECTOR)) search.onValueChange("")
						else setOpen(false)
					} else if (event.key === "ArrowDown" && (event.target as HTMLElement).matches(SEARCH_SELECTOR)) {
						event.preventDefault()
						focusList(false)
					}
				}}
				// No gap without a search field: the grid gap only falls between children.
				className={cn("grid gap-1 border-t border-hairline p-1.5", className)}
			>
				{search ? (
					<div data-disclosure-picker-search="">
						<SearchInput
							value={search.value}
							onValueChange={search.onValueChange}
							placeholder={search.placeholder ?? "Search"}
							aria-label={search.label ?? search.placeholder ?? "Search"}
						/>
					</div>
				) : null}
				{children}
			</div>
		</CollapsiblePanel>
	)
}
DisclosurePickerPanel.displayName = "DisclosurePickerPanel"

interface ListContext {
	value: string
	size: Size
	pick: (value: string) => void
}

const ListCtx = createContext<ListContext | null>(null)

/** How long a type-ahead run lasts between keys. */
const TYPEAHEAD_MS = 500

/** The text type-ahead matches: an explicit textValue, else the option's name. */
function textOf(option: HTMLElement): string {
	return (
		option.dataset.textValue ??
		option.querySelector("[data-disclosure-picker-label]")?.textContent ??
		option.textContent ??
		""
	)
		.trim()
		.toLowerCase()
}

/** Focus an option and bring it into view inside the list, never the page. */
function moveTo(option: HTMLElement | undefined) {
	if (!option) return
	option.focus({ preventScroll: true })
	option.scrollIntoView?.({ block: "nearest" })
}

export interface DisclosurePickerListProps
	extends Omit<ComponentProps<"div">, "role" | "onChange" | "defaultValue" | "children"> {
	/** The chosen (committed) option's value. Marked `aria-selected` and lifted out of the well. */
	value: string
	/**
	 * Called once, when an option is picked — Enter, Space or a click — and only
	 * when the pick differs from `value`. Arrow keys, Home/End and type-ahead
	 * move focus through the list and change nothing; Escape closes without a
	 * pick. Picking closes the row.
	 */
	onValueChange: (value: string) => void
	/** Name the list — the property it sets ("Body font"). */
	"aria-label"?: string
	children?: ReactNode
}

/**
 * The options, as a listbox: ArrowUp/ArrowDown, Home/End and type-ahead move
 * focus through them (roving tabindex, so Tab leaves the list in one step);
 * Enter, Space or a click picks the focused option, applies it and closes the
 * row. Nothing is applied while you move. ArrowUp from the first option goes
 * back to the search field, when there is one. Scrolls past 16rem with a quiet
 * scrollbar.
 */
export function DisclosurePickerList({ value, onValueChange, className, ref, onKeyDown, onFocus, children, ...props }: DisclosurePickerListProps) {
	const { setOpen, size, panelRef } = usePicker("DisclosurePickerList")
	const listRef = useRef<HTMLDivElement | null>(null)
	const typeahead = useRef<{ text: string; timer: number }>({ text: "", timer: 0 })

	const pick = useCallback(
		(next: string) => {
			// The value first, then the close: a confirm the pick opens takes focus
			// before the row would hand it back to the trigger.
			if (next !== value) onValueChange(next)
			setOpen(false)
		},
		[value, onValueChange, setOpen],
	)

	// Roving tabindex, kept in the DOM rather than in each option's props: one
	// tab stop — the focused option, else the chosen one, else the first — so
	// Tab enters the list on the choice and leaves it in one step. Re-run every
	// render, because a search can filter the tab stop out.
	useIsomorphicLayoutEffect(() => {
		const list = listRef.current
		if (!list) return
		const options = [...list.querySelectorAll<HTMLElement>(OPTION)]
		const enabled = (option: HTMLElement) => option.getAttribute("aria-disabled") !== "true"
		const stop =
			options.find((option) => option === document.activeElement) ??
			options.find((option) => option.getAttribute("aria-selected") === "true" && enabled(option)) ??
			options.find(enabled)
		for (const option of options) option.tabIndex = option === stop ? 0 : -1
	})

	useEffect(() => () => window.clearTimeout(typeahead.current.timer), [])

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(event)
		const list = listRef.current
		if (event.defaultPrevented || !list) return
		const current = (event.target as HTMLElement).closest<HTMLElement>(OPTION)
		if (!current || !list.contains(current)) return
		const options = [...list.querySelectorAll<HTMLElement>(ENABLED_OPTION)]
		const index = options.indexOf(current)
		const run = typeahead.current
		const typing = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
		// Space continues a type-ahead run ("dm s…"); otherwise it picks.
		if (typing && (event.key !== " " || run.text)) {
			event.preventDefault()
			window.clearTimeout(run.timer)
			run.text += event.key.toLowerCase()
			run.timer = window.setTimeout(() => {
				run.text = ""
			}, TYPEAHEAD_MS)
			// One letter repeated cycles through the options that start with it.
			const repeat = [...run.text].every((char) => char === run.text[0])
			const needle = repeat ? run.text[0] : run.text
			const from = repeat ? index + 1 : Math.max(index, 0)
			const ordered = [...options.slice(from), ...options.slice(0, from)]
			moveTo(ordered.find((option) => textOf(option).startsWith(needle)))
			return
		}
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault()
				moveTo(options[Math.min(index + 1, options.length - 1)])
				break
			case "ArrowUp": {
				event.preventDefault()
				const search = index <= 0 ? panelRef.current?.querySelector<HTMLInputElement>(SEARCH_SELECTOR) : null
				if (search) search.focus()
				else moveTo(options[Math.max(index - 1, 0)])
				break
			}
			case "Home":
				event.preventDefault()
				moveTo(options[0])
				break
			case "End":
				event.preventDefault()
				moveTo(options[options.length - 1])
				break
			case "Enter":
			case " ": {
				event.preventDefault()
				const next = current.getAttribute("aria-disabled") === "true" ? undefined : current.dataset.value
				if (next !== undefined) pick(next)
				break
			}
		}
	}

	const context = useMemo<ListContext>(() => ({ value, size, pick }), [value, size, pick])

	return (
		<ListCtx.Provider value={context}>
			<div
				ref={(node: HTMLDivElement | null) => {
					listRef.current = node
					if (typeof ref === "function") ref(node)
					else if (ref) ref.current = node
				}}
				role="listbox"
				onKeyDown={handleKeyDown}
				onFocus={(event) => {
					onFocus?.(event)
					// The focused option becomes the tab stop, wherever focus came from.
					const option = (event.target as HTMLElement).closest<HTMLElement>(OPTION)
					if (!option || !listRef.current?.contains(option)) return
					for (const other of listRef.current.querySelectorAll<HTMLElement>(OPTION)) other.tabIndex = other === option ? 0 : -1
				}}
				// relative: the list is the offsetParent its options measure from, so
				// centring the chosen option on open lands where it should.
				className={cn("relative grid max-h-64 gap-0.5 overflow-y-auto scrollbar-quiet", className)}
				{...props}
			>
				{children}
			</div>
		</ListCtx.Provider>
	)
}
DisclosurePickerList.displayName = "DisclosurePickerList"

export interface DisclosurePickerOptionProps
	extends Omit<ComponentProps<"div">, "className" | "children" | "role" | "tabIndex" | "onKeyDown"> {
	value: string
	/** The option's name. Render it in its own face or colour when that is what is being picked. */
	children?: ReactNode
	/** A leading visual before the name — a ThemePreview tile, a swatch. Not truncated. */
	media?: ReactNode
	/** A short muted annotation at the row's end. Options without one show a check when chosen. */
	note?: ReactNode
	/** Skipped by arrow keys and type-ahead, and cannot be picked. */
	disabled?: boolean
	/** What type-ahead matches, when the name is not plain text. @default the name's text */
	textValue?: string
	className?: string
}

/**
 * One option: a full-width row, raised out of the well when chosen. Focus
 * (from arrow keys, Home/End or type-ahead) rings it; Enter, Space or a click
 * picks it and closes the row.
 */
export function DisclosurePickerOption({
	value,
	children,
	media,
	note,
	disabled = false,
	textValue,
	className,
	onClick,
	...props
}: DisclosurePickerOptionProps) {
	const list = useContext(ListCtx)
	if (!list) throw new Error("<DisclosurePickerOption> must be rendered inside <DisclosurePickerList>.")
	const { size, pick } = list
	const selected = list.value === value
	return (
		<div
			{...props}
			role="option"
			aria-selected={selected}
			aria-disabled={disabled || undefined}
			data-value={value}
			data-text-value={textValue}
			data-selected={selected ? "" : undefined}
			onClick={(event) => {
				onClick?.(event)
				if (!event.defaultPrevented && !disabled) pick(value)
			}}
			className={cn(
				"flex items-center gap-3 rounded-sm px-(--item-px) text-start motion-interactive",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
				size === "xs" ? "min-h-(--control-xs)" : "min-h-(--control-sm) py-1",
				// Chosen: lifted out of the well, like a segmented control's knob.
				selected ? "bg-popover shadow-sm" : "sable-surface-interactive",
				className,
			)}
		>
			<span className="flex min-w-0 flex-1 items-center gap-2">
				{media != null ? <span className="flex shrink-0 items-center">{media}</span> : null}
				<span data-disclosure-picker-label="" className={cn("min-w-0 truncate", size === "xs" ? "text-ui-md" : "text-body-md")}>
					{children}
				</span>
			</span>
			{note != null ? (
				<span className={cn("shrink-0 text-muted-foreground", size === "xs" ? "text-ui-sm" : "text-caption")}>{note}</span>
			) : selected ? (
				<Icon name="check" className="shrink-0 text-sm" />
			) : null}
		</div>
	)
}
DisclosurePickerOption.displayName = "DisclosurePickerOption"

/** Shown in the list when a search matches nothing. */
export function DisclosurePickerEmpty({ children, className }: { children?: ReactNode; className?: string }) {
	return <p className={cn("px-2.5 py-2 text-caption text-muted-foreground", className)}>{children}</p>
}
DisclosurePickerEmpty.displayName = "DisclosurePickerEmpty"
