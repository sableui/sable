# SearchBlock

Search with its three answers: a SearchInput and Pill filters over a list that shows Skeleton rows while it works, Entity results with the match highlighted, or an EmptyState with a way out.

**Intent:** Reach for this as a search panel that stays on the page — a sidebar, a popover, the top of a list. Search that opens over the app from a shortcut and runs commands is CommandPaletteBlock; filtering rows already on screen needs only SearchInput.

**Block:** Navigation · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The list area has one height for results, loading and empty, so the card never jumps while someone types.
- With nothing typed it shows recent items instead of an empty box.
- Loading is Skeleton rows in the shape of a result, plus a Spinner in the status line that later carries the count.
- The typed text is painted in each title with useMatchHighlight: no <mark> elements, and the accessible name is unchanged.
- The empty state names what was searched and offers one action that clears both the text and the filter. It is named apart from the field's own clear button.
- The timer stands in for a request. Each change restarts it, which is the debounce.

## Accessibility

- The field has an accessible name, and the Pills are toggle buttons with aria-pressed.
- The status line is a live region: it announces searching, then the number of results.
- Each result is one button covering its row. The skeleton rows are hidden from assistive technology.

## Source

```tsx
"use client"

import { useState, useEffect } from "react"
import { Avatar, Button, Card, CardHeader, CardList, CardListLabel, cn, EmptyState, Entity, IconTile, Pill, SearchInput, Skeleton, Spinner, useMatchHighlight } from "@sableui/react"

const kinds = [
	{ id: "all", label: "All" },
	{ id: "doc", label: "Docs" },
	{ id: "person", label: "People" },
	{ id: "file", label: "Files" },
]

// Most recent first: with nothing typed, the top of this list is what shows.
const index = [
	{ id: "roadmap", kind: "doc", title: "Q4 roadmap", detail: "Edited 2 hours ago" },
	{ id: "ana", kind: "person", title: "Ana Chen", detail: "Design lead" },
	{ id: "launch", kind: "doc", title: "Launch checklist", detail: "Edited yesterday" },
	{ id: "brand", kind: "file", title: "Brand guidelines.pdf", detail: "4.2 MB" },
	{ id: "pricing", kind: "doc", title: "Pricing research", detail: "Edited last week" },
	{ id: "kofi", kind: "person", title: "Kofi Mensah", detail: "Engineering" },
	{ id: "roadmap-deck", kind: "file", title: "Roadmap review.key", detail: "18 MB" },
	{ id: "amira", kind: "person", title: "Amira Haddad", detail: "Research" },
]

// How many rows the list has room for. Loading and empty states fill the same space.
const rows = 4

const initials = (name: string) =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")

export interface SearchBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Popover or Sheet that already frames it. */
	framed?: boolean
	/** Called with the result's id when one is opened. */
	onOpen?: (id: string) => void
}

export function SearchBlock({ className, framed = true, onOpen }: SearchBlockProps) {
	const [query, setQuery] = useState("")
	const [kind, setKind] = useState("all")
	// What the list is showing. It trails what was asked for while a search runs.
	const [shown, setShown] = useState({ query, kind })
	const searching = shown.query !== query || shown.kind !== kind

	// Stands in for the request. Each keystroke restarts it, which is the debounce.
	useEffect(() => {
		if (shown.query === query && shown.kind === kind) return
		const timer = setTimeout(() => setShown({ query, kind }), 450)
		return () => clearTimeout(timer)
	}, [query, kind, shown])

	const term = shown.query.trim().toLowerCase()
	const results = index
		.filter((item) => (shown.kind === "all" || item.kind === shown.kind) && item.title.toLowerCase().includes(term))
		.slice(0, rows)
	const list = useMatchHighlight<HTMLDivElement>(shown.query, { selector: "[data-title]" })

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader className="gap-3">
				<SearchInput value={query} onValueChange={setQuery} placeholder="Search the workspace" aria-label="Search the workspace" />
				<div className="flex gap-1">
					{kinds.map((item) => (
						<Pill key={item.id} selected={item.id === kind} onClick={() => setKind(item.id)}>
							{item.label}
						</Pill>
					))}
				</div>
			</CardHeader>
			{/* The list's own label, close above the rows it names: what the list is
			    showing, working, or how much it found. The spinner is decoration:
			    the word beside it is what is announced, once. */}
			<CardListLabel role="status" className="mt-[calc(var(--card-p)/2)]">
				{searching ? (
					<>
						<Spinner size="sm" aria-hidden />
						<span>Searching</span>
					</>
				) : term ? (
					`${results.length} ${results.length === 1 ? "result" : "results"}`
				) : (
					"Recent"
				)}
			</CardListLabel>
			{/* One floor for every state, so the card does not jump as results come
			    and go. The floor is the rows themselves: a hidden list of `rows`
			    rows shares one grid cell with whatever is showing, so a full list
			    ends exactly on the card's edge at any density or type scale. A
			    fixed min-height left a strip under the last row, or let it spill. */}
			<div className="grid *:col-start-1 *:row-start-1">
				<CardList divided={false} aria-hidden className={cn(!searching && "invisible")}>
					{Array.from({ length: rows }, (_, row) => (
						<Entity
							key={row}
							leading={<Skeleton className="size-8" />}
							// Each bar and its margins add up to one line of the text it
							// stands in for, so a loading row is exactly a result row.
							title={<Skeleton className="my-[0.15lh] h-[0.7lh] w-32" />}
							subtitle={<Skeleton className="my-[0.15lh] h-[0.7lh] w-20" />}
						/>
					))}
				</CardList>
				{searching ? null : results.length ? (
					<CardList divided={false} ref={list}>
						{results.map((item) => (
							<Entity
								key={item.id}
								interactive
								onSelect={() => onOpen?.(item.id)}
								leading={
									item.kind === "person" ? (
										<Avatar size="sm" fallback={initials(item.title)} alt="" />
									) : (
										<IconTile icon={item.kind === "doc" ? "file" : "paperclip"} size="sm" appearance="muted" />
									)
								}
								title={<span data-title>{item.title}</span>}
								subtitle={item.detail}
							/>
						))}
					</CardList>
				) : (
					<EmptyState
						// No glyph: with one the state stood taller than four rows, and
						// the card grew each time a search found nothing.
						className="self-center"
						title={`Nothing for “${shown.query.trim()}”`}
						description="Check the spelling, or start again."
						action={
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									setQuery("")
									setKind("all")
								}}
							>
								Reset search
							</Button>
						}
					/>
				)}
			</div>
		</Card>
	)
}
```
