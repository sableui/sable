import { Avatar, AvatarGroup } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "../components/card"
import { DateTile } from "../components/date-tile"
import { cn } from "../lib/cn"

// ---block-code---
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
