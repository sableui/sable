# EventCardBlock

An upcoming-event card: a DateTile beside the title and time, a "starts in" Badge, attendees as an AvatarGroup, and Decline / Join.

**Intent:** Reach for this for the next meeting, booking or live session on a dashboard or home screen. For a list of many upcoming events, use Entity rows with a DateTile as `leading`.

**Block:** Dashboard · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- The DateTile names the day; the full weekday and time range sit in text beside it.
- The Badge is one title line tall and wraps under the title rather than squeezing it onto two lines.
- AvatarGroup `fit` trades avatars for the +N count before it pushes the actions to their own line.

## Accessibility

- DateTile is a <time> with a machine-readable date; the time range is plain text read in order after the title.
- The AvatarGroup's aria-label states the total attendee count.

## Source

```tsx
import { Avatar, AvatarGroup, Badge, Button, Card, CardContent, CardDescription, CardFooter, CardTitle, cn, DateTile } from "@sableui/react"

const event = {
	title: "Design review",
	date: new Date(2026, 9, 14),
	when: "Tuesday, 2:00 – 2:45 PM",
	starts: "In 10 min",
	attendees: ["MO", "SR", "JL"],
	total: 7,
}

export interface EventCardBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	/** Called with the person's answer. */
	onRespond?: (answer: "join" | "decline") => void
}

export function EventCardBlock({ className, framed = true, onRespond }: EventCardBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardContent className="flex gap-4">
				<DateTile date={event.date} />
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					{/* The row carries the title's type, so the badge's box is exactly
					    one title line (`h-[1lh]`): it centres on the title and never
					    makes the row taller than the title alone. When a bolder or
					    roomier look leaves no space beside the title, the badge wraps
					    to its own line instead of squeezing the title onto two. */}
					<div className="flex flex-wrap items-start justify-between gap-x-2 text-title-lg">
						<CardTitle>{event.title}</CardTitle>
						<span className="flex h-[1lh] shrink-0 items-center">
							<Badge tone="info" size="sm">
								{event.starts}
							</Badge>
						</span>
					</div>
					<CardDescription>{event.when}</CardDescription>
				</div>
			</CardContent>
			{/* `fit`: when a roomy look tightens the row, the stack gives up
			    avatars to the count instead of pushing the actions to a new line. */}
			<CardFooter className="flex-wrap justify-between gap-3">
				<AvatarGroup aria-label={`${event.total} attendees`} total={event.total} size="sm" surface={framed ? "card" : undefined} fit>
					{event.attendees.map((initials) => (
						<Avatar key={initials} fallback={initials} alt={initials} />
					))}
				</AvatarGroup>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => onRespond?.("decline")}>
						Decline
					</Button>
					<Button size="sm" onClick={() => onRespond?.("join")}>
						Join
					</Button>
				</div>
			</CardFooter>
		</Card>
	)
}
```
