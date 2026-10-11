# ChatThreadBlock

A short message thread on a card: Message rows with incoming muted Bubbles on the start side and your own primary Bubbles on the end.

**Intent:** Reach for this to show a conversation excerpt — a support preview, a comment thread on a dashboard, a recent-DM card. A working chat with a composer, streaming and history is the ChatPanel page shell.

**Block:** Social & messaging · card · designed for 16rem–20rem wide (fills its container up to the max)

## Notes

- Sit it on a card, not straight on a muted page: incoming bubbles are the muted surface, and would vanish into it.
- Your own messages align to the end with the primary Bubble; everyone else's align to the start.

## Accessibility

- Each Message carries a messageId, so a thread can be addressed and announced item by item.
- Direction is shown by alignment and colour; when senders matter, add the sender's name to each Message.

## Source

```tsx
import { Bubble, Card, CardContent, cn, Message } from "@sableui/react"

const messages = [
	{ id: "m1", text: "Is the new cover ready?", mine: false },
	{ id: "m2", text: "Uploading it now 🎉", mine: true },
	{ id: "m3", text: "Perfect, thank you!", mine: false },
]

export interface ChatThreadBlockProps {
	className?: string
	/** false drops the card's surface and border. Keep it framed on a muted page: incoming bubbles are the muted surface too. */
	framed?: boolean
}

export function ChatThreadBlock({ className, framed = true }: ChatThreadBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-xs", className)}>
			<CardContent className="flex flex-col gap-2">
				{messages.map((m) => (
					<Message key={m.id} messageId={m.id} align={m.mine ? "end" : undefined}>
						<Bubble variant={m.mine ? "primary" : undefined} align={m.mine ? "end" : undefined}>
							{m.text}
						</Bubble>
					</Message>
				))}
			</CardContent>
		</Card>
	)
}
```
