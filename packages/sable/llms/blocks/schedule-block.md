# ScheduleBlock

A three-day schedule: the day as the card title, its events below, and a card height that eases between days, driven by Tabs.

**Intent:** A compact day planner where selecting a day changes the amount of content in place. Edit the sample days after copying.

**Block:** Dashboard · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Tabs owns selection and keyboard navigation; useAutoSize measures the current panel's actual layout height.
- TextSwap reflects the selected day. No automatic rotation or timers.
- The day is the CardTitle, so it sits where every card's title does; the events are Entity rows on the content edge.

## Accessibility

- The tablist has a name and each panel follows its tab.
- The current day and event details remain present when motion is subtle or off.

## Source

```tsx
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, cn, Entity, Tabs, TabsList, TabsPanel, TabsTrigger, TextSwap, useAutoSize } from "@sableui/react"

const month = "November 2026"

const days = [
	{
		id: "mon",
		label: "Mon 9",
		title: "Monday",
		events: [
			{ name: "Studio standup", time: "9:00–9:15" },
			{ name: "Design review", time: "11:00–12:00" },
			{ name: "Focus time", time: "14:00–16:00" },
		],
	},
	{ id: "tue", label: "Tue 10", title: "Tuesday", events: [{ name: "Project planning", time: "10:00–11:00" }] },
	{
		id: "wed",
		label: "Wed 11",
		title: "Wednesday",
		events: [
			{ name: "Client review", time: "9:30–10:30" },
			{ name: "Research", time: "13:00–15:00" },
		],
	},
]

export interface ScheduleBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet or muted section that already frames it. */
	framed?: boolean
}

export function ScheduleBlock({ className, framed = true }: ScheduleBlockProps) {
	const [day, setDay] = useState(days[0].id)
	const selected = days.find((item) => item.id === day) ?? days[0]
	// Days hold different numbers of events: the card eases to the new height.
	const size = useAutoSize<HTMLDivElement, HTMLDivElement>({ axis: "height" })
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardHeader>
				<CardTitle>
					<TextSwap text={selected.title} />
				</CardTitle>
				<CardDescription>{month}</CardDescription>
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
									{item.events.map((event) => (
										<Entity key={event.name} className="px-0" title={event.name} subtitle={event.time} />
									))}
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
