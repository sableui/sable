import { Avatar } from "../components/avatar"
import { Card, CardList } from "../components/card"
import { Entity } from "../components/entity"
import { StatusDot } from "../components/status-dot"
import { cn } from "../lib/cn"

// ---block-code---
const notifications = [
	{ initials: "MO", name: "Mara Okafor", what: "collected your edition", when: "2m", unread: true },
	{ initials: "SR", name: "Sam Rivera", what: "left a comment on Dusk", when: "1h", unread: false },
]

export interface NotificationListBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Popover or Sheet that already frames it. */
	framed?: boolean
}

export function NotificationListBlock({ className, framed = true }: NotificationListBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<CardList>
				{notifications.map((n) => (
					<Entity
						key={n.name}
						leading={<Avatar size="sm" fallback={n.initials} alt={n.name} />}
						title={
							<>
								{n.name}
								{n.unread ? <span className="sr-only"> (unread)</span> : null}
							</>
						}
						subtitle={n.what}
						action={
							<span className="flex items-center gap-1.5 text-caption text-muted-foreground">
								{n.when}
								{n.unread ? <StatusDot tone="info" /> : null}
							</span>
						}
					/>
				))}
			</CardList>
		</Card>
	)
}
