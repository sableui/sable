# ChatPanel

A full-height conversation surface: titled header, scrolling transcript, and a composer pinned to the bottom — the assembled shape of an AI assistant, a support thread, or a DM.

**Intent:** Reach for this for any conversation that owns its screen — an assistant, a support inbox thread, a DM. Not for a chat docked beside other work (compose the same three parts inside a Sheet or a PanelGroup instead), and not for a comment thread under an article, which is a FeedPage concern.

## Notes

- The panel is a fixed-height column, not a growing page. `h-[calc(100dvh_-_--spacing(12))]` on the Card (the viewport minus the Page's py-6, in spacing units so density moves both together — a fixed `3rem` drifts the moment density moves the padding) and `flex-1 min-h-0` on the MessageScroller are what make the transcript scroll instead of the document — the single most common thing to get wrong here, and it fails by pushing the composer off the bottom of the screen.
- The panel is a Card, not a hand-built bordered section: CardHeader (title, description, CardAction), the MessageScroller and a CardFooter all inset by the card's own `--card-p`, so the three regions share one edge at any card density.
- `dvh` rather than `vh`: on mobile the URL bar collapses, and a `vh`-sized panel puts the composer under it exactly when someone is trying to type.
- Region cap is `feed` (640px) — a conversation is a reading column, and the Bubble measure cap is tuned to the same assumption.
- The composer sits outside the scroll region, in a bordered CardFooter, so it stays put while the transcript moves.
- Grouping is derived from the data (`turns[i - 1].mine === turn.mine`) rather than hand-set, and the tail is dropped on continuations — that pairing is what makes a run read as one block.
- The assistant's long-form answer uses `variant="plain"`. A tinted box around a code block reads as a quote rather than as a turn.
- The answer in flight is a `StreamingText` in a `plain` Bubble, and ONE `pending` flag drives both it and the composer's `busy`. They are the same wait reported at the two ends of the panel; letting them drift gives you a composer still saying 'sending' under an answer that already finished.
- A spinner `Marker` (or `ThinkingOrb`) belongs BEFORE the first token and is replaced once tokens land, not kept alongside. Two indicators for one wait read as two things happening — which is also why `StreamingText` takes `caret={false}` when something adjacent already reports it.
- MessageScroller needs no configuring for this: it re-follows on "a message grew" (ResizeObserver) as well as "a message arrived", so the newest token stays pinned while a reader who has scrolled up is left alone.
- For a new thread, swap the transcript's children for an `<EmptyState>` inside the same MessageScroller — the panel, header and composer are unchanged, which is the point of keeping them separate.

## Accessibility

- The panel header's title is the page's <h1> (an h1 inside CardTitle, which carries the type); the transcript is a scroll region with native overflow, so keyboard scrolling works unchanged.
- The answer in flight carries `aria-busy` rather than sitting in a live region. That is deliberate: a live region around streamed text announces every token, which is unusable. Announce once when the turn settles, from whatever owns the turn — the incomplete state is still exposed, just not narrated.
- The composer is a real <form> whose Enter handling skips IME composition, and every icon-only control in the panel carries an accessible label.

## Source

```tsx
import { Attachment, Avatar, Bubble, BubbleReaction, BubbleReactions, Button, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, ChatComposer, CodeBlock, Icon, Marker, MenuRadioGroup, MenuRadioItem, Message, MessageScroller, Page, SettingsMenu, SettingsRow, StreamingText } from "@sableui/react"

/**
 * The request is in flight. In an app this is your send state — from `useChat`,
 * a fetch, whatever owns the turn — and it is deliberately ONE flag driving two
 * places: the composer's `busy` and the answer's `streaming`. They are the same
 * wait reported at both ends of the panel, and letting them drift is how you get
 * a composer that still says "sending" under an answer that already finished.
 */
const pending = true

/** The answer so far. Append tokens to this; `StreamingText` assumes it only grows. */
const streamed =
	"Anchor on the oldest rendered message and add back however far it moved. Appends"

const turns = [
	{
		id: "t_01",
		mine: true,
		body: "Our chat scroll jumps every time older messages load. What are we doing wrong?",
	},
	{
		id: "t_02",
		mine: false,
		body: "Almost always the anchor. If you preserve the scroll position by measuring the container, prepending history moves everything under the reader.",
	},
	{
		id: "t_03",
		mine: false,
		body: "Anchor on the oldest rendered message instead and add back however far it moved. Appends leave it alone, so the same rule covers both.",
	},
]

export function ChatPanel() {
	return (
		<Page as="main" max="feed" gap={0} className="py-6">
			{/* h-dvh minus the page's own padding (py-6 = 12 spacing units, in
			    spacing units so density moves both together): the panel owns the
			    viewport, and the transcript — not the page — is the thing that
			    scrolls. The panel is a Card; its parts inset by the card's own
			    --card-p, so header, transcript and composer share one edge. */}
			<Card
				render={<section aria-labelledby="chat-title" />}
				className="flex h-[calc(100dvh_-_--spacing(12))] flex-col overflow-hidden"
			>
				<CardHeader className="border-b border-border pb-(--card-p)">
					{/* CardTitle carries the type; the h1 inside it is the page heading. */}
					<CardTitle>
						<h1 id="chat-title">Scroll behaviour</h1>
					</CardTitle>
					<CardDescription>Assistant · answers from your team's docs</CardDescription>
					<CardAction>
						<Button variant="outline" size="icon-sm" aria-label="Start a new chat">
							<Icon name="plus" />
						</Button>
					</CardAction>
				</CardHeader>

				{/* flex-1 min-h-0 is the whole layout: it bounds the scroll region
				    against the panel instead of letting the transcript grow the page. */}
				<MessageScroller className="min-h-0 flex-1 p-(--card-p)">
					<Marker variant="separator">Today</Marker>

					{turns.map((turn, i) => (
						<Message
							key={turn.id}
							messageId={turn.id}
							align={turn.mine ? "end" : "start"}
							grouped={i > 0 && turns[i - 1].mine === turn.mine}
							avatar={turn.mine ? undefined : <Avatar size="sm" fallback="AI" />}
						>
							<Bubble
								variant={turn.mine ? "primary" : "muted"}
								align={turn.mine ? "end" : "start"}
								tail={i === 0 || turns[i - 1].mine !== turn.mine}
							>
								{turn.body}
							</Bubble>
						</Message>
					))}

					<Marker variant="note" icon="sparkles">
						Read message-scroller.md
					</Marker>

					{/* An assistant's long-form answer: no bubble, because a tinted box
					    around a code block reads as a quote rather than as a turn. */}
					<Message messageId="t_04" avatar={<Avatar size="sm" fallback="AI" />}>
						<Bubble variant="plain">
							<p className="text-body-md text-foreground">
								Here is the shape of it:
							</p>
							<CodeBlock
								code={
									"const shift = anchor.offsetTop - lastTop\nif (shift !== 0) viewport.scrollTop += shift"
								}
								filename="preserve.ts"
							/>
						</Bubble>
						<BubbleReactions>
							<BubbleReaction emoji="🎯" count={2} active />
						</BubbleReactions>
					</Message>

					<Message messageId="t_05" align="end">
						<Attachment name="scroller.tsx" meta="4.2 KB · TSX" />
					</Message>

					{/* The answer arriving. A `Marker` with a spinner — or ThinkingOrb —
					    is what sits here BEFORE the first token; once tokens land it is
					    replaced rather than kept, because two indicators for one wait
					    read as two things happening.

					    No bubble, same as the long-form answer above: a tinted box around
					    a growing paragraph makes the reflow look like the box breathing.

					    MessageScroller needs no help with this — it already re-follows on
					    "a message grew" (ResizeObserver), not just on "a message arrived",
					    so the newest token stays pinned while the reader can still scroll
					    up without being yanked back. */}
					<Message messageId="t_06" avatar={<Avatar size="sm" fallback="AI" />}>
						<Bubble variant="plain">
							<StreamingText text={streamed} streaming={pending} />
						</Bubble>
					</Message>
				</MessageScroller>

				<CardFooter className="border-t border-border pt-(--card-p)">
					<ChatComposer
						className="flex-1"
						placeholder="Ask a follow-up…"
						// Same flag as the answer's `streaming`, which is what turns Send
						// into Stop. A composer that stays sendable mid-answer invites a
						// second request on top of the one still running.
						busy={pending}
						onStop={() => undefined}
						onAttach={() => undefined}
						footer="Enter to send · Shift+Enter for a new line"
						// Model and effort sit in `actions`, at the send end of the row:
						// they qualify the message about to be sent, so they belong beside
						// the button that sends it rather than next to the attach control.
						actions={
							<SettingsMenu
								variant="subtle"
								size="xs"
								label="Change model and effort"
								summary={
									<>
										<span className="text-foreground">5.6 Sol</span>{" "}
										<span className="text-muted-foreground">High</span>
									</>
								}
							>
								<SettingsRow label="Model" value="5.6 Sol">
									<MenuRadioGroup defaultValue="sol">
										<MenuRadioItem value="sol">5.6 Sol</MenuRadioItem>
										<MenuRadioItem value="lite">5.6 Lite</MenuRadioItem>
									</MenuRadioGroup>
								</SettingsRow>
								<SettingsRow label="Effort" value="High">
									<MenuRadioGroup defaultValue="high">
										<MenuRadioItem value="low">Low</MenuRadioItem>
										<MenuRadioItem value="standard">Standard</MenuRadioItem>
										<MenuRadioItem value="high">High</MenuRadioItem>
									</MenuRadioGroup>
								</SettingsRow>
								<SettingsRow label="Speed" value="Standard">
									<MenuRadioGroup defaultValue="standard">
										<MenuRadioItem value="standard">Standard</MenuRadioItem>
										<MenuRadioItem value="priority">Priority</MenuRadioItem>
									</MenuRadioGroup>
								</SettingsRow>
							</SettingsMenu>
						}
					/>
				</CardFooter>
			</Card>
		</Page>
	)
}
```
