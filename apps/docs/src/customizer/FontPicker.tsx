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
import { useEffect, useMemo, useState } from "react"
import { FONT_CATALOG, type FontRole, ROLE_LABEL, loadFont, loadPreviews } from "./fonts"

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
}: {
	role: FontRole
	value: string
	onChange: (family: string) => void
	/** What "Preset" resolves to right now, shown as its label. */
	presetLabel: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const [query, setQuery] = useState("")
	const entries = FONT_CATALOG[role]
	const extra = role === "secondary" ? [{ value: "sans", label: "Same as primary" }] : []

	useEffect(() => {
		if (open) loadPreviews(entries)
	}, [open, entries])

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
			open={open}
			onOpenChange={(next) => (next ? onOpenChange(true) : close())}
			className="rounded-md sable-well"
		>
			<CollapsibleTrigger
				// Hover is a step off the well it sits on (sable-surface-interactive),
				// never a fixed surface — a popover-colored hover read as a hole.
				className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-start motion-interactive sable-surface-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span className="grid min-w-0 flex-1 gap-0.5">
					<span className="text-caption text-muted-foreground">{ROLE_LABEL[role].title} · {ROLE_LABEL[role].detail}</span>
					<span className="truncate text-body-md" style={{ fontFamily: currentFace }}>
						{current}
					</span>
				</span>
				<Icon name={open ? "chevron-up" : "chevron-down"} className="shrink-0 text-sm text-muted-foreground" />
			</CollapsibleTrigger>
			<CollapsiblePanel>
				<div className="grid gap-1 border-t border-border p-2">
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
						className="grid max-h-64 gap-0.5 overflow-y-auto scrollbar-quiet"
					>
						{[{ value: "theme", label: `Preset (${presetLabel})` }, ...extra]
							.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()))
							.map((o) => (
								<Option key={o.value} value={o.value} onPick={close} label={o.label} />
							))}
						{shown.map((entry) => (
							<Option key={entry.family} value={entry.family} onPick={close} label={entry.family} note={entry.note} face={`"${entry.family}"`} />
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
}: {
	value: string
	label: string
	note?: string
	face?: string
	onPick: () => void
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
						"flex items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-start motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						state.checked ? "bg-popover shadow-sm" : "sable-surface-interactive",
					)}
				>
					<span className="truncate text-body-md" style={{ fontFamily: face }}>
						{label}
					</span>
					{note ? <span className="shrink-0 text-caption text-muted-foreground">{note}</span> : null}
					{state.checked && !note ? <Icon name="check" className="shrink-0 text-sm" /> : null}
				</button>
			)}
		/>
	)
}
