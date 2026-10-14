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
- What the assistant did before answering — a doc it read, a tool it ran — is a `Marker variant="note"` in that message's `header`, so it reads as part of the turn rather than as an event between turns.
- The assistant's long-form answer uses `variant="plain"` and continues the same grouped run. A tinted box around a code block reads as a quote rather than as a turn. A plain Bubble sizes to its content with no measure cap, so it takes `max-w-full` here: bounded by the column, a wide code line scrolls inside the CodeBlock instead of pushing the transcript sideways on a phone.
- A settled answer carries its actions (copy, regenerate) in the Message `footer` as a `Toolbar` of icon `ToolbarButton`s with tooltips — one tab stop, arrow keys between them. The answer still streaming has none: there is nothing to copy or regenerate until it settles, and Stop lives in the composer.
- One turn, one Message: the reader's question and the file it refers to stack inside a single end-aligned Message rather than being sent as two.
- Assistant turns share one Avatar with a glyph fallback and `alt="Assistant"` — initials like "AI" read as a person, and a fallback-only avatar is otherwise unnamed.
- The answer in flight is a `StreamingText` in a `plain` Bubble, and ONE `pending` flag drives both it and the composer's `busy`. They are the same wait reported at the two ends of the panel; letting them drift gives you a composer still saying 'sending' under an answer that already finished.
- A spinner `Marker` (or `ThinkingOrb`) belongs BEFORE the first token and is replaced once tokens land, not kept alongside. Two indicators for one wait read as two things happening — which is also why `StreamingText` takes `caret={false}` when something adjacent already reports it.
- MessageScroller needs no configuring for this: it re-follows on "a message grew" (ResizeObserver) as well as "a message arrived", so the newest token stays pinned while a reader who has scrolled up is left alone.
- For a new thread, swap the transcript's children for an `<EmptyState>` inside the same MessageScroller — the panel, header and composer are unchanged, which is the point of keeping them separate.

## Accessibility

- The panel header's title is the page's <h1> (an h1 inside CardTitle, which carries the type); the transcript is a scroll region with native overflow, so keyboard scrolling works unchanged.
- The answer in flight carries `aria-busy` rather than sitting in a live region. That is deliberate: a live region around streamed text announces every token, which is unusable. Announce once when the turn settles, from whatever owns the turn — the incomplete state is still exposed, just not narrated.
- The composer is a real <form> whose Enter handling skips IME composition, and every icon-only control in the panel carries an accessible label — the answer actions also carry a tooltip, and the stop control is named for what it stops (`stopLabel="Stop answering"`).

## Source

```tsx
import { Attachment, Avatar, Bubble, Button, Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle, ChatComposer, CodeBlock, Icon, Marker, MenuRadioGroup, MenuRadioItem, Message, MessageScroller, Page, SettingsMenu, SettingsRow, SimpleTooltip, StreamingText, Toolbar, ToolbarButton } from "@sableui/react"

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
	"Yes, appends are already safe: your layout effect measures before paint. The jump is on the prepend path, which reads scrollHeight after the new rows"

/**
 * The opening exchange. `step` is what the assistant did before answering — a
 * doc it read, a tool it ran — and it rides in that message's header, so it
 * reads as part of the turn rather than as an event between turns.
 */
const turns: { id: string; mine: boolean; step?: string; body: string }[] = [
	{
		id: "t_01",
		mine: true,
		body: "Our chat scroll jumps every time older messages load. What are we doing wrong?",
	},
	{
		id: "t_02",
		mine: false,
		step: "Read message-scroller.md",
		body: "Almost always the anchor. If you preserve the scroll position by measuring the container, prepending history moves everything under the reader.",
	},
	{
		id: "t_03",
		mine: false,
		body: "Anchor on the oldest rendered message instead and add back however far it moved. Appends leave it alone, so the same rule covers both.",
	},
]

export function ChatPanel() {
	// One identity for every assistant turn. A glyph rather than initials: "AI"
	// in a circle reads as a person called A. I. The glyph is sized to the
	// circle (the fallback's own size is tuned for two letters, and a lone icon
	// at that size reads as a speck); `alt` names it for a screen reader, which
	// otherwise gets nothing from a fallback-only avatar.
	const assistant = (
		<Avatar variant="art"
			size="sm"
			alt="Assistant"
			fallback={<Icon name="sparkles" className="text-base" />}
		/>
	)

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
				<CardHeader className="pb-(--card-p) shadow-[inset_0_-1px_0_var(--border)]">
					{/* CardTitle carries the type; the h1 inside it is the page heading. */}
					<CardTitle>
						<h1 id="chat-title">Scroll behaviour</h1>
					</CardTitle>
					<CardDescription>Assistant · answers from your team's docs</CardDescription>
					<CardAction>
						{/* Labelled, not a bare plus: the composer already has a plus
						    (attach), and two identical glyphs a panel apart that do
						    different things is a guessing game. */}
						<Button variant="ghost" size="sm">
							<Icon name="edit" />
							New chat
						</Button>
					</CardAction>
				</CardHeader>

				{/* flex-1 min-h-0 is the whole layout: it bounds the scroll region
				    against the panel instead of letting the transcript grow the page. */}
				<MessageScroller className="min-h-0 flex-1 p-(--card-p)">
					<Marker variant="separator">Today</Marker>

					{turns.map((turn, i) => {
						// Derived, not hand-set: a turn continues a run when the one
						// before it has the same author. A continuation drops its
						// avatar (Message keeps the column) AND its tail (Bubble keeps
						// the ear's space) — together, that makes the run one block.
						const continues = i > 0 && turns[i - 1].mine === turn.mine
						return (
							<Message
								key={turn.id}
								messageId={turn.id}
								align={turn.mine ? "end" : "start"}
								grouped={continues}
								avatar={turn.mine ? undefined : assistant}
								header={
									turn.step ? (
										<Marker variant="note" icon="book" className="justify-start">
											{turn.step}
										</Marker>
									) : undefined
								}
							>
								<Bubble
									variant={turn.mine ? "primary" : "muted"}
									align={turn.mine ? "end" : "start"}
									tail={!continues}
								>
									{turn.body}
								</Bubble>
							</Message>
						)
					})}

					{/* The same run, continued: long-form output with no bubble,
					    because a tinted box around a code block reads as a quote
					    rather than as a turn. Its footer carries what the reader does
					    WITH a settled answer, as a Toolbar: one tab stop, arrow keys
					    between the actions. */}
					<Message
						messageId="t_04"
						grouped
						avatar={assistant}
						footer={
							<Toolbar aria-label="Answer actions">
								<SimpleTooltip content="Copy answer">
									<ToolbarButton size="icon-sm" aria-label="Copy answer">
										<Icon name="copy" />
									</ToolbarButton>
								</SimpleTooltip>
								<SimpleTooltip content="Regenerate">
									<ToolbarButton size="icon-sm" aria-label="Regenerate answer">
										<Icon name="refresh" />
									</ToolbarButton>
								</SimpleTooltip>
							</Toolbar>
						}
					>
						{/* max-w-full: a plain Bubble sizes to its content with no
						    measure cap, and a code line is wider than a phone. Bounded
						    by the column, the CodeBlock scrolls inside itself instead of
						    pushing the whole transcript sideways. */}
						<Bubble variant="plain" className="max-w-full">
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
					</Message>

					{/* The reader's follow-up is one turn: the question and the file
					    it refers to stack in a single Message, so they share a side, an
					    edge and a timestamp rather than reading as two sends. */}
					<Message messageId="t_05" align="end">
						<Bubble variant="primary" align="end">
							Here's ours. Does the same fix cover new messages arriving?
						</Bubble>
						<Attachment
							name="scroller.tsx"
							meta="4.2 KB · TSX"
							onOpen={() => undefined}
						/>
					</Message>

					{/* The answer arriving. A `Marker` with a spinner — or ThinkingOrb —
					    is what sits here BEFORE the first token; once tokens land it is
					    replaced rather than kept, because two indicators for one wait
					    read as two things happening. What stays is the step it took,
					    as a finished note in the header.

					    No bubble, same as the long-form answer above: a tinted box
					    around a growing paragraph makes the reflow look like the box
					    breathing. And no answer actions yet — there is nothing to copy
					    or regenerate until it settles; Stop lives in the composer.

					    MessageScroller needs no help with this — it already re-follows on
					    "a message grew" (ResizeObserver), not just on "a message arrived",
					    so the newest token stays pinned while the reader can still scroll
					    up without being yanked back. */}
					<Message
						messageId="t_06"
						avatar={assistant}
						header={
							<Marker variant="note" icon="file" className="justify-start">
								Read scroller.tsx
							</Marker>
						}
					>
						<Bubble variant="plain">
							<StreamingText text={streamed} streaming={pending} />
						</Bubble>
					</Message>
				</MessageScroller>

				<CardFooter className="pt-(--card-p) shadow-[inset_0_1px_0_var(--border)]">
					<ChatComposer
						className="flex-1"
						placeholder="Ask a follow-up…"
						// Same flag as the answer's `streaming`, which is what turns Send
						// into Stop. A composer that stays sendable mid-answer invites a
						// second request on top of the one still running.
						busy={pending}
						onStop={() => undefined}
						stopLabel="Stop answering"
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
