import { Icon } from "../icon"
import { Attachment } from "../components/attachment"
import { AgentAvatar } from "../components/agent-avatar"
import { Bubble } from "../components/bubble"
import { Button } from "../components/button"
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../components/card"
import { ChatComposer } from "../components/chat-composer"
import { CodeBlock } from "../components/code-block"
import { Marker } from "../components/marker"
import { MenuRadioGroup, MenuRadioItem } from "../components/menu"
import { Message } from "../components/message"
import { MessageScroller } from "../components/message-scroller"
import { SettingsMenu, SettingsRow } from "../components/settings-menu"
import { StreamingText } from "../components/streaming-text"
import { Toolbar, ToolbarButton } from "../components/toolbar"
import { SimpleTooltip } from "../components/tooltip"
import { Page } from "../layout"

// ---pattern-code---
/**
 * The request is in flight. In an app this is your send state — from `useChat`,
 * a fetch, whatever owns the turn — and it is deliberately ONE flag driving three
 * places: the composer's `busy`, the answer's `streaming` and its avatar's
 * `state`. They are the same wait reported across the panel, and letting them
 * drift is how you get a composer that still says "sending" under an answer that
 * already finished.
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
	// One identity for every assistant turn: AgentAvatar, not initials ("AI" in
	// a circle reads as a person called A. I.). Settled turns are not `live`, so
	// they rest and stop watching the pointer; only the turn in flight moves. A
	// transcript where every row followed the reader would be a wall of eyes.
	const assistant = <AgentAvatar size="sm" live={false} />

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

					{/* The answer arriving. Its avatar is the one live AgentAvatar in
					    the transcript: `thinking` before the first token, `speaking`
					    while tokens land, so the row needs no spinner of its own — two
					    indicators for one wait read as two things happening. What
					    stays is the step it took, as a finished note in the header.

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
						avatar={<AgentAvatar size="sm" state={pending ? "speaking" : "idle"} />}
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
						// A keyboard hint, so only where Enter sends: on touch Return
						// breaks the line and the button sends, and the row goes away.
						footer={({ sendOn }) => (sendOn === "enter" ? "Enter to send · Shift+Enter for a new line" : null)}
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
