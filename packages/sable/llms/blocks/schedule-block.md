# ScheduleBlock

A three-day agenda: the day as the card title, its events down a column of start times, each a block in its calendar's colour with the people in it, and a card height that eases between days, driven by Tabs.

**Intent:** A compact day planner where selecting a day changes the amount of content in place. Edit the sample days after copying.

**Block:** Dashboard · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Tabs owns selection and keyboard navigation; useAutoSize measures the current panel's actual layout height.
- TextSwap reflects the selected day. No automatic rotation or timers.
- An event's colour is a palette family on data-palette: the block, its text and the avatars' ring read the slots, so no step is named and it follows the theme in both modes.
- The days are dated from the page load, today first.

## Accessibility

- The tablist has a name and each panel follows its tab.
- The current day and event details remain present when motion is subtle or off.

## Source

```tsx
"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarGroup, Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Tabs, TabsList, TabsPanel, TabsTrigger, TextSwap, useAutoSize, useToday } from "@sableui/react"

// `tone` is a palette family: the calendar an event belongs to. `people` are initials.
const agenda = [
	[
		{ name: "Studio standup", start: "9:00", length: "15 min", tone: "teal", people: ["AC", "KM", "AH"] },
		{ name: "Design review", start: "11:00", length: "1 hr", tone: "purple", people: ["AC", "JP"] },
		{ name: "Focus time", start: "14:00", length: "2 hr", tone: "neutral", people: [] },
	],
	[{ name: "Project planning", start: "10:00", length: "1 hr", tone: "blue", people: ["KM", "AH", "JP", "TB"] }],
	[
		{ name: "Client review", start: "9:30", length: "1 hr", tone: "pink", people: ["AC", "SR"] },
		{ name: "Research", start: "13:00", length: "2 hr", tone: "teal", people: ["AH"] },
	],
] as const

// Dated from today, today first — replace with your own days.
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" })
const shortWeekday = new Intl.DateTimeFormat("en-US", { weekday: "short" })
const monthDay = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" })
const datedFrom = (today: Date) =>
	agenda.map((events, offset) => {
		const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
		return {
			id: String(offset),
			label: `${shortWeekday.format(date)} ${date.getDate()}`,
			title: weekday.format(date),
			date: monthDay.format(date),
			events,
		}
	})

export interface ScheduleBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
}

export function ScheduleBlock({ className, framed = true }: ScheduleBlockProps) {
	// useToday, not new Date(): the server and the reader may be on different days.
	const today = useToday()
	const days = useMemo(() => datedFrom(today), [today])
	const [day, setDay] = useState("0")
	const selected = days.find((item) => item.id === day) ?? days[0]
	// Days hold different numbers of events: the card eases to the new height.
	const size = useAutoSize<HTMLDivElement, HTMLDivElement>({ axis: "height" })
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>
					<TextSwap text={selected.title} />
				</CardTitle>
				<CardDescription>
					{selected.date} · {selected.events.length === 1 ? "1 event" : `${selected.events.length} events`}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={day} onValueChange={(value) => setDay(String(value))}>
					{/* Equal segments across the card, as PricingCard's period toggle: the
					    row's edges are the content edges whichever day is selected. Left
					    to their own width, an unselected first pill's label sits one
					    pill-padding inside the title above it. */}
					<TabsList variant="pill" aria-label="Day" className="flex w-full">
						{days.map((item) => (
							<TabsTrigger key={item.id} value={item.id} className="flex-1 justify-center">
								{item.label}
							</TabsTrigger>
						))}
					</TabsList>
					<div ref={size.outerRef} className="motion-size">
						<div ref={size.innerRef}>
							{days.map((item) => (
								<TabsPanel key={item.id} value={item.id}>
									{/* A day reads down its times: the start in a column of its
									    own, the event beside it as a block in its calendar's
									    colour. The block paints from the palette slots its
									    data-palette fills, so no colour step is named here. */}
									<ol className="flex flex-col gap-2 pt-4">
										{item.events.map((event) => (
											<li key={event.name} className="flex items-center gap-3">
												<time className="w-10 shrink-0 text-end text-mono-caption text-muted-foreground tabular-nums">{event.start}</time>
												<div
													data-palette={event.tone}
													// The avatars' separating ring takes the block's fill, not the card's.
													className="flex min-w-0 flex-1 items-center gap-2 rounded-(--card-inner-radius) bg-palette-wash px-3 py-2 text-palette-text [--avatar-group-ring:var(--palette-wash)]"
												>
													<div className="flex min-w-0 flex-1 flex-col">
														<span className="truncate text-label-md">{event.name}</span>
														<span className="text-caption">{event.length}</span>
													</div>
													{event.people.length ? (
														<AvatarGroup
															size="xs"
															max={2}
															aria-label={event.people.length === 1 ? "1 person" : `${event.people.length} people`}
														>
															{event.people.map((person) => (
																<Avatar key={person} variant="art" fallback={person} alt="" />
															))}
														</AvatarGroup>
													) : null}
												</div>
											</li>
										))}
									</ol>
								</TabsPanel>
							))}
						</div>
					</div>
				</Tabs>
			</CardContent>
		</Card>
	)
}
```
