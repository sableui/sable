"use client"

import { useState } from "react"
import { Avatar } from "../components/avatar"
import { Bubble, BubbleReaction, BubbleReactions } from "../components/bubble"
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
// Each reaction lists who gave it. The reader's own are kept apart, in state.
const me = "You"
const messages: { id: string; text: string; mine: boolean; reactions: Record<string, string[]> }[] = [
	{ id: "m1", text: "The new onboarding flow is live on staging 🚀", mine: false, reactions: { "🎉": ["Ana", "Kofi"], "👀": ["Jun"] } },
	{ id: "m2", text: "Clicked through it twice. The progress bar is so smooth.", mine: true, reactions: { "🙏": ["Mara"] } },
	{ id: "m3", text: "Ship it Friday?", mine: false, reactions: { "👍": ["Ana", "Kofi", "Mara", "Jun"] } },
]
const hint = "Right-click or long-press a message to react."
// Every emoji that can appear needs a name: it is the pill's accessible label.
const labels: Record<string, string> = {
	...Object.fromEntries(DEFAULT_REACTIONS.map((r) => [r.emoji, r.label])),
	"👀": "Eyes",
}

export interface MessageReactionsBlockProps {
	className?: string
	/** false drops the card's surface and border. Unframed, its bubbles stand on the page: the reader's own are a wash over it. */
	framed?: boolean
	/** Called when the reader adds or removes a reaction: the message's id, then the emoji and whether it is now on. */
	onReactionChange?: (messageId: string, reaction: { emoji: string; reacted: boolean }) => void
}

export function MessageReactionsBlock({ className, framed = true, onReactionChange }: MessageReactionsBlockProps) {
	// The reader's own reactions, per message. Everyone else's are the counts above.
	const [mine, setMine] = useState<Record<string, string[]>>({ m1: ["🎉"] })
	const toggle = (messageId: string, emoji: string) => {
		const reacted = !(mine[messageId] ?? []).includes(emoji)
		// Decided again from `prev`, so two toggles in one batch cannot add an emoji twice.
		setMine((prev) => {
			const current = prev[messageId] ?? []
			const next = current.includes(emoji) ? current.filter((e) => e !== emoji) : [...current, emoji]
			return { ...prev, [messageId]: next }
		})
		onReactionChange?.(messageId, { emoji, reacted })
	}

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardContent className="flex flex-col gap-3">
				{messages.map((m) => {
					const align = m.mine ? "end" : "start"
					const chosen = mine[m.id] ?? []
					// Everyone else, then the reader: a reaction only the reader gave is
					// a pill of its own, ordered after the ones already there.
					const emojis = [...Object.keys(m.reactions), ...chosen.filter((emoji) => !(emoji in m.reactions))]
					const pills = emojis.map((emoji) => ({
						emoji,
						active: chosen.includes(emoji),
						people: [...(m.reactions[emoji] ?? []), ...(chosen.includes(emoji) ? [me] : [])],
					}))
					return (
						<Message key={m.id} messageId={m.id} align={m.mine ? "end" : undefined}>
							<ContextMenu>
								<ContextMenuTrigger
									// Focusable, so Shift+F10 or the Menu key opens the same menu.
									// A light thread: the other party on the card's own surface with
									// an edge, the reader's on a wash of the brand colour. The one solid chip
									// left is the reader's own reaction.
									render={<Bubble tabIndex={0} variant={m.mine ? "tint" : "outline"} align={align} />}
								>
									{m.text}
									{/* Inside the bubble, as part of the message. Rendered even while
									    empty (it hides itself), so the first reaction still celebrates.
									    Up to three people show as faces; past that, the count. */}
									<BubbleReactions>
										{pills.map((p) => (
											<BubbleReaction
												key={p.emoji}
												emoji={p.emoji}
												label={labels[p.emoji]}
												active={p.active}
												avatars={p.people.map((person) => (
													// One letter: at this size two would run under the next face.
													<Avatar key={person} variant="art" fallback={person[0]} alt="" />
												))}
												onClick={() => toggle(m.id, p.emoji)}
											/>
										))}
									</BubbleReactions>
								</ContextMenuTrigger>
								<ContextMenuContent>
									<MenuReactions selected={chosen} onSelect={(emoji) => toggle(m.id, emoji)} />
									<ContextMenuSeparator />
									<ContextMenuItem>Reply</ContextMenuItem>
									<ContextMenuItem>Copy text</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>
						</Message>
					)
				})}
			</CardContent>
			<CardFooter className="text-caption text-muted-foreground">{hint}</CardFooter>
		</Card>
	)
}
