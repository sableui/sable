# Task: building a chat

Sable ships the parts a conversation is made of, and the [`ChatPanel`
pattern](../patterns/chat-panel.md) assembles them into a working screen. It
ships no transport, no message store and no model client. This guide is the
seam between the two: which part owns what, how a request's lifecycle maps
onto the parts' props, what each failure looks like, and what is left for the
app.

Check every name here against the installed package with
`sable component <Name> --detail full` before relying on it.

## Who owns what

| Sable part | Owns | Does not own |
|---|---|---|
| [`MessageScroller`](../components/message-scroller.md) | The scroll region: following the newest message, letting go when the reader scrolls up, the jump-to-latest button, holding still when history is prepended, `scrollToMessage`, `onVisibleMessagesChange` | Your messages, your loading of history |
| [`Message`](../components/message.md) | One turn's row: side (`align`), avatar gutter, `header` and `footer`, `grouped` runs, `messageId` | How the content looks |
| [`Bubble`](../components/bubble.md) | The surface: `muted` (them), `primary` (me), `plain` (long-form answers), the tail, reactions | Timestamps and names (those go in Message's `header`/`footer`) |
| [`StreamingText`](../components/streaming-text.md) | Text arriving a token at a time: `text` (append-only), `streaming`, the caret, `aria-busy` | Markdown, and announcing the finished answer |
| [`ThinkingOrb`](../components/thinking-orb.md), [`Marker`](../components/marker.md) | The wait before the first token (orb or `Marker icon="spinner" spin`), and every non-message row: status, tool notes, date breaks, bordered notices | — |
| [`Attachment`](../components/attachment.md) | A file's four states: queued, `uploading` with `progress`, `error` with the reason in `meta`, delivered | The upload itself |
| [`ChatComposer`](../components/chat-composer.md) | The input: Enter to send (never mid-IME; Return breaks the line on touch), `busy` + `onStop`, `allowEmpty` for attachment-only sends, `disabled`, `invalid`, `footer` as a function of the send key in effect | Whether the send succeeded |
| [`Toast`](../components/toast.md) | Notices about the app, not the conversation | — |

**The app owns** the transport (HTTP, SSE, WebSocket), the streaming state, message ids, persistence and history, retries and backoff, auth, rate limits, moderation, uploads, and what counts as a failed turn. Sable renders whatever state you hand it; it never infers one.

## The lifecycle, mapped to props

A turn moves through five states. Keep **one** status value in the app and derive every prop from it; two flags (`sending` here, `streaming` there) drift, and the composer ends up saying "sending" under an answer that already finished.

| State | Transcript | Composer |
|---|---|---|
| **idle** | Settled messages. The last answer's `footer` carries its actions (copy, regenerate) as a `Toolbar` of icon `ToolbarButton`s | Normal; `busy={false}` |
| **submitted** (sent, no token yet) | The reader's message, optimistically, with the id you generated. Below it, the wait: `<Marker icon="spinner" spin shimmer>Thinking…</Marker>` or a `ThinkingOrb` | `busy` and `onStop` |
| **streaming** | The wait is **replaced** by the answer: `StreamingText` with `streaming` in a `plain` Bubble. No answer actions yet | `busy` and `onStop` |
| **done** | `streaming={false}`, which removes the caret: the only signal the reader gets that the answer is complete. Actions appear in the `footer` | `busy={false}` |
| **stopped / error** | See [Failures](#failures) | `busy={false}`; the draft is still the reader's |

Rules that follow from it:

- **One indicator per wait.** The spinner Marker (or orb) shows before the first token and is removed when tokens land. While the answer streams, its own caret is the indicator; pass `caret={false}` only when something adjacent already reports the wait.
- **`busy` is not `disabled`.** `busy` is temporary and comes with a way out (`onStop` turns send into stop). `disabled` is for a composer that cannot send at all: offline, over a quota, a read-only thread.
- **Controlled composers are cleared by you, after the send is accepted.** An uncontrolled composer clears itself; a controlled one leaves the text so a failed send loses nothing.
- **Regenerate replaces the answer, not appends to it.** `StreamingText` assumes `text` only grows. When regenerating, give the new answer a new `key` (a new message id does it) so the old spans unmount instead of being diffed against.
- **Editing a sent message** is the app's feature: put the text back in a controlled composer, or swap the Bubble's content for a `Textarea` in place, then truncate the turns after it before re-sending. Sable has no edit mode on Message.

## Scrolling

`MessageScroller` needs no configuration for streaming. It follows the newest message as messages arrive **and** as the last one grows, and stops following the moment the reader scrolls up past `followThreshold` (64px). The jump-to-latest button appears while they are away; returning to the bottom resumes following.

- Bound it: `flex-1 min-h-0` inside a flex column. A transcript that grows the page pushes the composer off the screen.
- Never call `scrollToBottom` per token. It fights a reader who scrolled up to read. Call it once when **they** send, so their own message is in view.
- Give every `Message` a `messageId`; it is the handle for `scrollToMessage`, `initialScroll={{ messageId }}` (restore a read position) and `onVisibleMessagesChange` (read receipts).
- Load older history by prepending to `children`. The scroller anchors on the first rendered message, so the view does not jump.

## Attachments

- **Pending** files are `Attachment` chips in the composer's `attachments`, each with a remove action. Upload when picked, not when sent, so `status="uploading"` and `progress` can show in the box the file belongs to.
- **Failed** uploads keep their card: `status="error"`, the reason in `meta` ("Over the 50 MB limit"), a Retry action. Colour alone is not a status.
- **Attachment-only sends:** `allowEmpty={files.length > 0}`. `onSend` then receives `""`. Tie it to the pending files; a constant `allowEmpty` leaves send enabled with nothing to send. Disable sending while an upload is still in flight if your backend needs the file first.
- **Sent** files move into the turn: one `Message` holding the files and the text together, `variant="media"` for images, `variant="card"` for documents, `onOpen` to preview.

## Failures

Put each failure where the reader is looking when it happens. A failure that belongs to a turn stays in the transcript, next to that turn; a toast is for things that are not about the conversation.

| Failure | UI |
|---|---|
| **Send rejected** (network down, 4xx before streaming) | The optimistic message stays, with a Message `footer` of `<InlineStatus tone="destructive">Not sent</InlineStatus>` and a Retry button. The composer keeps the draft if it was controlled |
| **Error mid-stream** | Keep what streamed, set `streaming={false}`, and add `<Marker variant="bordered" icon="warning">The answer was cut off.</Marker>` with Retry in the answer's `footer`. Never delete partial text the reader may be reading |
| **Stopped by the reader** | Keep the partial answer, `streaming={false}`, and a quiet `<Marker variant="note">Stopped</Marker>`. Not an error, so no warning colour |
| **Rate limited / quota** | `ChatComposer disabled`, with the reason and the wait in its `footer` ("Limit reached · try again in 2 min"). Re-enable it when the window passes |
| **Empty response** | Treat as an error: a bordered Marker ("No answer came back") and Retry. An empty plain Bubble reads as a rendering bug |
| **Tool call failed** | A `Marker variant="note" icon="warning"` in that turn's `header` ("Search failed: timeout"). The answer may continue without it; say so rather than hiding the failure |
| **Disconnected** (socket dropped) | A `Banner` above the transcript, or a toast if the panel is small, and `disabled` on the composer until reconnected |
| **Moderation / blocked** | A bordered Marker in place of the answer, naming what happened. Don't render the blocked content and then hide it |

## Accessibility

- **Don't put streamed text in a live region.** Every token would be announced. `StreamingText` sets `aria-busy` while streaming instead.
- **Announce the turn once, when it settles.** Keep an empty `<p role="status" className="sr-only">` mounted from the start, and set its text when a turn ends ("Answer ready", "Answer stopped", "Couldn't answer"). A region inserted together with its text is announced unreliably (`sable docs AGENTS` → Announcing and focusing).
- **A status Marker is already live** (`role="status"`), so replacing its text as the work moves on ("Searching the docs" → "Writing the answer") is announced. Remove it when the work ends; a permanent "Thinking…" is a region that never resolves.
- **ThinkingOrb's `label` must stay constant** while it is mounted. Put the changing phase in adjacent text.
- **Focus:** after sending, keep focus in the composer (`fieldRef`) so the reader can keep typing. After Stop, ChatComposer moves focus to the field itself (the stop button turns back into send in place, and a disabled send would drop focus to the page); on touch it leaves focus alone rather than raise the keyboard.
- **Reduced motion:** StreamingText, ThinkingOrb, the Marker shimmer and the scroller's smooth scrolling all fall back under `prefers-reduced-motion` or `MotionProvider` off. Don't add your own animation that ignores it.

## Rendering the model's output

Sable has no Markdown renderer; use one (react-markdown, or your own parser) and map its elements to Sable parts:

- the answer sits in `<Bubble variant="plain">`, which drops the surface and the measure cap; give it `max-w-full` so a wide code line scrolls inside its block rather than pushing the transcript sideways on a phone;
- fenced code → `CodeBlock` (copy button included; wire highlighting once with `CodeHighlightProvider`);
- inline code → `Code`; tables → `Table` parts; links → your router's link or a plain `<a>` with `rel="noopener noreferrer"` for outside URLs;
- paragraphs and lists take the prose tier (`useTypeTier().prose`) rather than a hand-picked size.

**Never render model output as HTML** (`dangerouslySetInnerHTML`, or a Markdown renderer with raw HTML on). Model output is untrusted input. Strip or escape HTML, and allow only `http(s)` and `mailto` link targets.

While an answer streams, render it with `StreamingText` (plain text); switch to the Markdown renderer when it settles, or render Markdown progressively if your renderer tolerates half-finished syntax (an unclosed fence). Either way the switch must not move the text the reader is on.

## Wiring a chat hook

The shape below fits most streaming chat hooks. The hook's names (`messages`, `status`, `send`, `stop`, `regenerate`, `error`) belong to **your library**, not Sable. The AI SDK's `useChat`, for example, exposes a `status` of `"submitted" | "streaming" | "ready" | "error"`; check the version you have installed.

```tsx
import {
	Bubble, ChatComposer, Marker, Message, MessageScroller, StreamingText,
} from "@sableui/react"

function Chat() {
	const { messages, status, send, stop } = useYourChat() // your library
	const busy = status === "submitted" || status === "streaming"
	const last = messages.at(-1)
	return (
		<div className="flex h-full min-h-0 flex-col">
			<MessageScroller className="flex-1 min-h-0 px-4 py-6">
				{messages.map((m) => {
					const mine = m.role === "user"
					const live = status === "streaming" && m.id === last?.id && !mine
					return (
						<Message key={m.id} messageId={m.id} align={mine ? "end" : "start"}>
							<Bubble variant={mine ? "primary" : "plain"} align={mine ? "end" : "start"} className={mine ? undefined : "max-w-full"}>
								{mine ? m.text : <StreamingText text={m.text} streaming={live} />}
							</Bubble>
						</Message>
					)
				})}
				{status === "submitted" ? <Marker icon="spinner" spin shimmer>Thinking…</Marker> : null}
			</MessageScroller>
			<ChatComposer
				onSend={(text) => send(text)}
				busy={busy}
				onStop={stop}
				footer={({ sendOn }) => (sendOn === "enter" ? "Enter to send · Shift+Enter for a new line" : null)}
			/>
		</div>
	)
}
```

For the full screen (header, grouping, avatars, answer actions, the empty state), start from `sable pattern ChatPanel --skeleton` and replace its sample data with your hook. For a chat docked beside other work, compose the same three parts inside a `Sheet` or a panel and wrap them in `<Density value="compact">`.

## What Sable does not do

- No transport, retries or reconnection.
- No message store, ids, history paging or persistence; `MessageScroller` only renders what you pass.
- No Markdown parsing or sanitising.
- No mentions or slash commands in `ChatComposer` (it holds a plain string).
- No typing indicators or presence from other people; compose them from `Marker` and `Avatar` status if your product has them.

## Before you ship

1. `sable check src` passes.
2. Walk the journey (`sable docs reviewing-a-journey`) through every row of the lifecycle and failure tables: send, wait, stream, stop mid-answer, regenerate, a failed send, an error mid-stream, attachment-only send, an upload failure, and a reload that restores the thread.
3. Scroll up mid-stream: the view must stay put, and jump-to-latest must appear and work.
4. Keyboard only, then a screen reader: the finished answer is announced once; Stop is reachable from the composer; nothing announces per token.
5. On a phone: Return breaks the line, the send button sends, the composer stays above the on-screen keyboard (`dvh`, not `vh`), and wide code scrolls inside its block.
6. Reduced motion on: text still arrives, nothing keeps moving after the turn settles (`sable docs reviewing-motion`).
