# MessageScroller

**Status:** stable

Scroll container for a conversation. Auto-follows new messages until the reader scrolls away, holds position when older history is prepended, and exposes scroll commands and visibility tracking through its ref.

**Keywords:** chat, conversation, messages, thread, transcript, stick to bottom, auto scroll, streaming, infinite scroll, inbox, ai chat, support chat

## Usage

The scroll region a conversation lives in. It owns the scrolling and nothing else — not your messages, not your AI state, not your transport or persistence — so you bring the content renderer and it handles the behaviors that make streaming chat feel right: pinning to the newest message, releasing when the reader scrolls up, keeping the view still when older history loads above, jumping to a specific message, restoring a saved read position, and reporting what is actually on screen.

### Best practices

- Do: Building a whole chat? `sable docs building-a-chat` covers what the scroller does during a stream, what the app owns, and the failure states around it.
- Do: Bound it the way you would bound any scroll box — `flex-1 min-h-0` inside a flex column, or `max-h-96`. `className` lands on the element that actually scrolls, so the obvious bound is the correct one (same contract as Scroller).
- Do: Give every Message a `messageId`. It is the handle for `scrollToMessage`, `initialScroll`, and `onVisibleMessagesChange` — a message without one is invisible to all three.
- Do: Prepend older history directly into `children` when the reader reaches the top. The scroller anchors on the first rendered message and re-adds the height that appeared above it, so the view does not jump.
- Do: Set the rhythm between messages with the `gap` prop, not with a flex class on `className` — the messages are laid out in a column inside the scroll region, not directly on it.
- Do: Restore a reopened thread with `initialScroll={{ messageId: lastRead }}` instead of dropping the reader at the bottom of a conversation they have not finished.
- Do: Wrap a docked agent panel in `<Density value="compact">`. The scroller tightens its rhythm and every message inside it drops to the workspace type tier — one attribute for the whole conversation, no per-component sizing.
- Don't: Do not call `scrollToBottom` on every incoming token. Auto-follow already does it, and doing it yourself fights the reader who scrolled up to read something.
- Don't: Do not expect `ref` to be the DOM node — it is a command handle (`scrollToBottom`, `scrollToMessage`, `isFollowing`). Reach for `ref.current.element` when you genuinely need the element.
- Don't: Do not wrap it in a positioned div to place a jump-to-latest button. It ships one, stuck to the bottom edge from inside the scroll region, which is why `className` gets to stay on the scrolling element.
- Don't: Do not use it for an ordinary long list. That is `Scroller` — this one's follow-the-bottom behavior is wrong for content the reader is browsing rather than receiving.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Scroll region | yes | The element that scrolls. Carries `className`: sizing, padding, and background. |
| Message column | yes | The flex column holding the children, spaced by `gap`. Publishes `--message-gap` so `<Message grouped>` can close it. |
| Jump to latest | no | A control stuck to the bottom edge, shown only while the reader is scrolled away from the newest message. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| ref | Ref<MessageScrollerHandle> | — | Imperative commands, not the DOM node: `scrollToBottom(opts)`, `scrollToTop(opts)`, `scrollToMessage(id, opts)` (returns false when the message is not rendered), `isFollowing()`, and `element` for the scrolling node itself. `opts` is `ScrollCommandOptions`: `{ animate?: boolean }` (default true, and off whenever motion is), not the DOM's `behavior`. |
| autoFollow | boolean | true | Keep the newest message in view as content arrives, until the reader scrolls away from the bottom. Set false for a transcript that must never move under the reader. |
| followThreshold | number | 64 | Distance from the bottom, in px, that still counts as following. A band rather than a pixel, so a token arriving mid-frame does not flicker the state. |
| onFollowChange | (following: boolean) => void | — | Notified when the viewport pins to, or releases from, the newest message. |
| initialScroll | "bottom" \| "top" \| { messageId: string } | "bottom" | Where a freshly mounted thread lands. Pass a messageId to restore a saved read position. Applied once, on mount — changing it later will not yank a reader mid-conversation. |
| jumpToLatest | boolean | true | Show the jump-to-latest control while the reader is scrolled away from the newest message. |
| jumpToLatestLabel | string | "Jump to latest" | Accessible label and tooltip for that control. |
| gap | "sm" \| "md" \| "lg" | "md" | Vertical rhythm between messages. Also published as `--message-gap`, which `<Message grouped>` reads to collapse the gap within a run. |
| onVisibleMessagesChange | (ids: string[]) => void | — | Ids of the messages currently intersecting the viewport, in DOM order. The hook for read receipts, mark-as-seen, and unread counters. |
| ...div props | Omit<ComponentPropsWithRef<"div">, "ref"> | — | Spread onto the scrolling element. `className` bounds and pads the scroll region; `onScroll` composes with the component's own. |

## Variants

- **gap**: sm, md, lg

## Tokens used

`border`, `secondary`, `secondary-foreground`, `ring`

## Accessibility

- Native overflow, so keyboard scrolling (arrows, Page Up/Down, Home/End) and the OS scrollbar work unchanged; the scrollbar is styled thin, not replaced.
- Overscroll is contained, so a wheel gesture that runs out of conversation does not start scrolling the page behind it.
- The jump-to-latest control is a real button with an accessible label, reachable by keyboard, and only present when there is somewhere to jump to.
- Smooth scrolling is used only when motion is enabled — `prefers-reduced-motion` and <MotionProvider> off both collapse every scroll command to an instant jump.

## Related

- Components: Message, Bubble, Marker, Attachment, Scroller

## Examples

### Streaming conversation

```tsx
import { Bubble, Marker, Message, MessageScroller } from "@sableui/react"

<MessageScroller className="flex-1 min-h-0 px-4 py-6">{messages.map((m) => (<Message key={m.id} messageId={m.id} align={m.mine ? "end" : "start"}><Bubble variant={m.mine ? "primary" : "muted"} align={m.mine ? "end" : "start"}>{m.body}</Bubble></Message>))}{pending ? <Marker icon="spinner" spin shimmer>Thinking…</Marker> : null}</MessageScroller>
```

### Scroll to a message on demand

```tsx
import { Bubble, Button, Message, MessageScroller } from "@sableui/react"

function Thread({ messages, replyTo }) {
	const thread = useRef(null)
	return (
		<>
			<Button onClick={() => thread.current?.scrollToMessage(replyTo)}>Show original</Button>
			<MessageScroller ref={thread} className="max-h-96">
				{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}
			</MessageScroller>
		</>
	)
}
```

### Restore a saved read position and track receipts

```tsx
import { Bubble, Message, MessageScroller } from "@sableui/react"

<MessageScroller className="h-96" initialScroll={{ messageId: lastRead }} onVisibleMessagesChange={(ids) => markSeen(ids)}>{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}</MessageScroller>
```

### Prepend older history without moving the view

```tsx
import { Bubble, Button, Message, MessageScroller } from "@sableui/react"

<MessageScroller className="h-96" gap="sm">{hasMore ? <Button variant="secondary" loadingLabel="Loading…" onClick={loadOlder}>Load earlier messages</Button> : null}{messages.map((m) => (<Message key={m.id} messageId={m.id}><Bubble>{m.body}</Bubble></Message>))}</MessageScroller>
```
