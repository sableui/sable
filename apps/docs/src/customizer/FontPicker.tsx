import {
	Collapsible,
	CollapsiblePanel,
	CollapsibleTrigger,
	Icon,
	Radio,
	RadioGroup,
	SearchInput,
	cn,
} from "@sableui/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { FONT_CATALOG, type FontRole, ROLE_LABEL, loadFont, loadPreviews } from "./fonts"

/** What each role is for, short enough to sit beside the family it names. */
const ROLE_NAME: Record<FontRole, string> = { primary: "Body", secondary: "Headings", mono: "Mono" }

/**
 * One font role: a row that names the current choice in its own face, and
 * opens in place into a searchable list. Inline rather than a popover — this
 * is a tool panel, and a list that pushes the panel down keeps the choice next
 * to the preview it changes.
 *
 * The list is a Sable RadioGroup: arrow keys walk the fonts and each one
 * applies as you land on it, so the page previews the face before you commit;
 * a click or Enter picks it and closes the list.
 */
export function FontPicker({
	role,
	value,
	onChange,
	presetLabel,
	open,
	onOpenChange,
	size = "md",
}: {
	role: FontRole
	value: string
	onChange: (family: string) => void
	/** What "Preset" resolves to right now, shown as its label. */
	presetLabel: string
	open: boolean
	onOpenChange: (open: boolean) => void
	/** md for the simple view; xs is the property-grid rung. */
	size?: "md" | "xs"
}) {
	const [query, setQuery] = useState("")
	const entries = FONT_CATALOG[role]
	const extra = role === "secondary" ? [{ value: "sans", label: "Same as primary" }] : []

	useEffect(() => {
		if (open) loadPreviews(entries)
	}, [open, entries])

	// The pickers sit near the foot of a scrolling panel, so an opening list
	// would grow out of sight. Follow it while it grows (the panel animates its
	// height), keeping the whole picker on screen; let go once it has settled.
	const rootRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		const el = rootRef.current
		if (!open || !el) return
		const observer = new ResizeObserver(() => el.scrollIntoView({ block: "nearest" }))
		observer.observe(el)
		const settle = window.setTimeout(() => observer.disconnect(), 500)
		// Open on the current choice, centred in the list, not on whatever row
		// the list last scrolled to.
		const frame = requestAnimationFrame(() => {
			const list = el.querySelector<HTMLElement>("[role=radiogroup]")
			const chosen = list?.querySelector<HTMLElement>("[data-checked]")
			if (list && chosen) list.scrollTop = chosen.offsetTop - (list.clientHeight - chosen.offsetHeight) / 2
		})
		return () => {
			observer.disconnect()
			window.clearTimeout(settle)
			cancelAnimationFrame(frame)
		}
	}, [open])

	const shown = useMemo(() => {
		const q = query.trim().toLowerCase()
		return q ? entries.filter((e) => e.family.toLowerCase().includes(q) || e.note.toLowerCase().includes(q)) : entries
	}, [entries, query])

	const current =
		value === "theme" ? presetLabel : value === "sans" ? "Same as primary" : value
	const currentFace = value === "theme" || value === "sans" ? undefined : `"${value}"`

	const apply = (family: string) => {
		const entry = entries.find((e) => e.family === family)
		if (entry) loadFont(entry)
		if (family !== value) onChange(family)
	}
	const close = () => {
		onOpenChange(false)
		setQuery("")
	}

	return (
		<Collapsible
			ref={rootRef}
			open={open}
			onOpenChange={(next) => (next ? onOpenChange(true) : close())}
			className={cn("scroll-my-3", size === "xs" ? "rounded-[var(--panel-field-radius,var(--radius-xs))]" : "rounded-sm", open && "sable-well")}
		>
			{/* One line, the way a tool names a property and its value: the role,
			    then the family in its own face. Hover is a step off the surface it
			    sits on, never a fixed fill — a popover-coloured hover read as a hole. */}
			<CollapsibleTrigger
				className={cn(
					"flex w-full items-center gap-2 text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
					size === "xs"
						? "h-(--control-xs) rounded-[inherit] bg-panel-field px-1.5 hover:bg-panel-field-hover"
						: "h-10 rounded-[inherit] px-3 sable-surface-interactive",
					size === "md" && !open && "sable-well",
				)}
			>
				<span className={cn("shrink-0 text-muted-foreground", size === "xs" ? "w-16 text-ui-md" : "w-20 text-body-sm")}>{ROLE_NAME[role]}</span>
				<span className={cn("min-w-0 flex-1 truncate", size === "xs" ? "text-ui-md" : "text-body-md")} style={{ fontFamily: currentFace }}>
					{current}
				</span>
				<Icon name={open ? "chevron-up" : "chevron-down"} className="shrink-0 text-sm text-muted-foreground" />
			</CollapsibleTrigger>
			<CollapsiblePanel>
				<div className="grid gap-1 border-t border-hairline p-1.5">
					<SearchInput
						value={query}
						onValueChange={setQuery}
						placeholder={`Search ${entries.length} fonts`}
						aria-label={`Search ${ROLE_LABEL[role].title.toLowerCase()} fonts`}
					/>
					<RadioGroup
						aria-label={`${ROLE_LABEL[role].title} font`}
						value={value}
						onValueChange={(next) => typeof next === "string" && apply(next)}
						// relative: Base UI scrolls the chosen font into view by its
						// offsetTop, which only measures from the list if the list is the
						// offsetParent — otherwise it overshoots to the bottom.
						className="relative grid max-h-64 gap-0.5 overflow-y-auto scrollbar-quiet"
					>
						{[{ value: "theme", label: `Preset (${presetLabel})` }, ...extra]
							.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()))
							.map((o) => (
								<Option key={o.value} value={o.value} onPick={close} label={o.label} size={size} />
							))}
						{shown.map((entry) => (
							<Option key={entry.family} value={entry.family} onPick={close} label={entry.family} note={entry.note} face={`"${entry.family}"`} size={size} />
						))}
						{shown.length === 0 && query ? (
							<p className="px-2.5 py-2 text-caption text-muted-foreground">No fonts match “{query}”.</p>
						) : null}
					</RadioGroup>
				</div>
			</CollapsiblePanel>
		</Collapsible>
	)
}

function Option({
	value,
	label,
	note,
	face,
	onPick,
	size,
}: {
	value: string
	label: string
	note?: string
	face?: string
	onPick: () => void
	size: "md" | "xs"
}) {
	return (
		<Radio
			value={value}
			// A row in place of the default dot: Base UI's props (ARIA, roving
			// focus, state) on our own button. A click selects, then closes; so
			// does Enter, which radios otherwise ignore (arrows already selected).
			render={({ className: _dot, children: _indicator, onClick, onKeyDown, ...props }, state) => (
				<button
					{...props}
					type="button"
					onClick={(event) => {
						onClick?.(event)
						onPick()
					}}
					onKeyDown={(event) => {
						onKeyDown?.(event)
						if (event.key === "Enter") {
							event.preventDefault()
							onPick()
						}
					}}
					className={cn(
						"flex items-center justify-between gap-3 rounded-sm px-(--item-px) text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						size === "xs" ? "min-h-(--control-xs)" : "min-h-(--control-sm) py-1",
						state.checked ? "bg-popover shadow-sm" : "sable-surface-interactive",
					)}
				>
					<span className={cn("truncate", size === "xs" ? "text-ui-md" : "text-body-md")} style={{ fontFamily: face }}>
						{label}
					</span>
					{note ? <span className={cn("shrink-0 text-muted-foreground", size === "xs" ? "text-ui-sm" : "text-caption")}>{note}</span> : null}
					{state.checked && !note ? <Icon name="check" className="shrink-0 text-sm" /> : null}
				</button>
			)}
		/>
	)
}
