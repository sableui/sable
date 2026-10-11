import { Bubble } from "../components/bubble"
import { Card, CardContent } from "../components/card"
import { Message } from "../components/message"
import { cn } from "../lib/cn"

// ---block-code---
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
