# NotificationListBlock

An activity list: Entity rows with the actor's Avatar, who did what, and a compact time with an unread StatusDot.

**Intent:** Reach for this for a notifications popover, a recent-activity card or an inbox preview. A full inbox with selection and bulk actions is a ListDetailPage.

**Block:** Social & messaging · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Rows are Card + CardList + Entity, inset from the card's padding at any density.
- Unread is a quiet info dot before the time, so the times keep one right edge — the list stays calm when most items are unread.
- framed={false} drops the surface for a Popover, which already is one.

## Accessibility

- The unread dot is decorative; each unread row also carries a screen-reader-only "(unread)" after the name.
- Each Avatar's alt is the actor's name.

## Source

```tsx
import { Avatar, Card, CardList, cn, Entity, StatusDot } from "@sableui/react"

const notifications = [
	{ initials: "MO", name: "Mara Okafor", what: "invited you to Q3 planning", when: "2m", unread: true },
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
						leading={<Avatar variant="art" size="sm" fallback={n.initials} alt={n.name} />}
						title={
							<>
								{n.name}
								{n.unread ? <span className="sr-only"> (unread)</span> : null}
							</>
						}
						subtitle={n.what}
						action={
							<span className="flex items-center gap-1.5 text-caption text-muted-foreground">
								{n.unread ? <StatusDot tone="info" /> : null}
								{n.when}
							</span>
						}
					/>
				))}
			</CardList>
		</Card>
	)
}
```
