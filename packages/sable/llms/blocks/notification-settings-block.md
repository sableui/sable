# NotificationSettingsBlock

A preferences card: Entity rows in a CardList, each with a title, a one-line detail and a Switch that applies instantly.

**Intent:** Reach for this for any short list of on/off preferences — notifications, privacy, feature flags in a settings section. For a full settings route with a section rail, start from the SettingsPage page shell.

**Block:** Settings & team · card · designed for 18rem–20rem wide (fills its container up to the max)

## Notes

- Switches apply the moment they change; never pair them with a Save button. `onChange` receives the row id and the new state.
- Rows are Card + CardList + Entity, so they inset with the card's padding at any density.

## Accessibility

- Each Switch takes its row title as aria-label, since the Entity title is not a <label>.
- Keep details to one line — Entity truncates its subtitle.

## Source

```tsx
import { Card, CardList, cn, Entity, Switch } from "@sableui/react"

const preferences = [
	{ id: "email", title: "Email notifications", detail: "Replies and mentions", on: true },
	{ id: "push", title: "Push notifications", detail: "On this device", on: false },
	{ id: "digest", title: "Weekly digest", detail: "Every Monday", on: true },
]

export interface NotificationSettingsBlockProps {
	className?: string
	/** false drops the card's surface and border — for a Sheet, Dialog or muted section that already frames it. */
	framed?: boolean
	/** Called the moment a switch changes. Toggles apply instantly; there is no Save. */
	onChange?: (id: string, on: boolean) => void
}

export function NotificationSettingsBlock({ className, framed = true, onChange }: NotificationSettingsBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs overflow-hidden", className)}>
			<CardList>
				{preferences.map((p) => (
					<Entity
						key={p.id}
						title={p.title}
						subtitle={p.detail}
						action={<Switch defaultChecked={p.on} aria-label={p.title} onCheckedChange={(on: boolean) => onChange?.(p.id, on)} />}
					/>
				))}
			</CardList>
		</Card>
	)
}
```
