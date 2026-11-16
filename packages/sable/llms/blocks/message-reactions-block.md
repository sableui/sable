# MessageReactionsBlock

A short thread you can react to: right-click or long-press a bubble for a menu with a row of quick reactions above Reply and Copy, or use the add-reaction pill under a message. A new reaction blooms in and sprays copies of its emoji.

**Intent:** Reach for this when a conversation excerpt should be reactable — a team thread, a comment card, a support transcript. A read-only excerpt is ChatThreadBlock; a working chat with a composer and history is the ChatPanel page shell.

**Block:** Social & messaging · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- Two ways in, on purpose: the right-click / long-press menu is fast once you know it is there, and the add-reaction pill is how a first-time reader finds reactions at all.
- The quick row in the menu is MenuReactions (checkbox menu items) and the one in the pill's popover is ReactionPicker (a toolbar), so each is reachable by the keyboard model of the surface it sits in.
- Only the reader's own reaction celebrates. Counts from other people roll quietly, and the reactions a page loads with never play.
- The add-reaction pill appears only on messages that already have reactions; a message with none is reacted to from its menu, which keeps quiet rows quiet.

## Accessibility

- Each bubble is focusable, and its menu opens on right click, long press, Shift+F10 or the Menu key; its reactions are checkbox items reporting whether the reader has used each one.
- Each reaction pill is a toggle named by its meaning and count ("Party, 3") with `aria-pressed`; the emoji and the burst are hidden from assistive tech.
- Under reduced motion the reaction appears and the count changes at once; nothing else is lost.

## Source

```tsx
"use client"

import { Avatar, Bubble, BubbleReaction, BubbleReactions, Card, CardContent, CardFooter, cn, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger, DEFAULT_REACTIONS, MenuReactions, Message } from "@sableui/react"

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
```
