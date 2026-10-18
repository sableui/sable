"use client"

import { useState } from "react"
import { Bubble, BubbleReaction, BubbleReactionAdd, BubbleReactions } from "../components/bubble"
import { Card, CardContent, CardFooter } from "../components/card"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "../components/context-menu"
import { Message } from "../components/message"
import { DEFAULT_REACTIONS, MenuReactions } from "../components/reaction-picker"
import { cn } from "../lib/cn"

// ---block-code---
const messages: { id: string; text: string; mine: boolean; reactions: Record<string, number> }[] = [
	{ id: "m1", text: "The new onboarding flow is live on staging 🚀", mine: false, reactions: { "🎉": 2, "👀": 1 } },
	{ id: "m2", text: "Clicked through it twice. The progress bar is so smooth.", mine: true, reactions: {} },
	{ id: "m3", text: "Ship it Friday?", mine: false, reactions: { "👍": 1 } },
]
const hint = "Right-click or long-press a message to react."
// Every emoji that can appear needs a name: it is the pill's accessible label.
const labels: Record<string, string> = {
	...Object.fromEntries(DEFAULT_REACTIONS.map((r) => [r.emoji, r.label])),
	"👀": "Eyes",
}

export interface MessageReactionsBlockProps {
	className?: string
	/** false drops the card's surface and border. Keep it framed on a muted page: incoming bubbles are the muted surface too. */
	framed?: boolean
	/** Called when the reader adds or removes a reaction, with the message, the emoji and whether it is now on. */
	onReact?: (messageId: string, emoji: string, on: boolean) => void
}

export function MessageReactionsBlock({ className, framed = true, onReact }: MessageReactionsBlockProps) {
	// The reader's own reactions, per message. Everyone else's are the counts above.
	const [mine, setMine] = useState<Record<string, string[]>>({ m1: ["🎉"] })
	const toggle = (messageId: string, emoji: string) => {
		const on = !(mine[messageId] ?? []).includes(emoji)
		// Decided again from `prev`, so two toggles in one batch cannot add an emoji twice.
		setMine((prev) => {
			const current = prev[messageId] ?? []
			const next = current.includes(emoji) ? current.filter((e) => e !== emoji) : [...current, emoji]
			return { ...prev, [messageId]: next }
		})
		onReact?.(messageId, emoji, on)
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardContent className="flex flex-col gap-3">
				{messages.map((m) => {
					const align = m.mine ? "end" : "start"
					const chosen = mine[m.id] ?? []
					// Others' counts, plus the reader's own: a reaction only the reader gave
					// is a pill of its own, ordered after the ones already there.
					const counts: Record<string, number> = { ...m.reactions }
					for (const emoji of chosen) counts[emoji] = (counts[emoji] ?? 0)
					const pills = Object.entries(counts).map(([emoji, others]) => ({
						emoji,
						active: chosen.includes(emoji),
						count: others + (chosen.includes(emoji) ? 1 : 0),
					}))
					return (
						<Message key={m.id} messageId={m.id} align={m.mine ? "end" : undefined}>
							<ContextMenu>
								<ContextMenuTrigger
									// Focusable, so Shift+F10 or the Menu key opens the same menu.
									render={<Bubble tabIndex={0} variant={m.mine ? "primary" : undefined} align={align} />}
								>
									{m.text}
								</ContextMenuTrigger>
								<ContextMenuContent>
									<MenuReactions selected={chosen} onSelect={(emoji) => toggle(m.id, emoji)} />
									<ContextMenuSeparator />
									<ContextMenuItem>Reply</ContextMenuItem>
									<ContextMenuItem>Copy text</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>
							{/* Rendered even while empty (it hides itself), so the first reaction still celebrates. */}
							<BubbleReactions align={align}>
								{pills.map((p) => (
									<BubbleReaction
										key={p.emoji}
										emoji={p.emoji}
										label={labels[p.emoji]}
										count={p.count}
										active={p.active}
										onClick={() => toggle(m.id, p.emoji)}
									/>
								))}
								{pills.length > 0 ? (
									<BubbleReactionAdd selected={chosen} onSelect={(emoji) => toggle(m.id, emoji)} />
								) : null}
							</BubbleReactions>
						</Message>
					)
				})}
			</CardContent>
			<CardFooter className="text-caption text-muted-foreground">{hint}</CardFooter>
		</Card>
	)
}
