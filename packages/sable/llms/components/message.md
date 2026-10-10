# Message

**Status:** stable

One row in a conversation: avatar gutter, side, and stacked header / content / footer. Layout only — the surface is Bubble, passed as children.

**Keywords:** chat, message, conversation row, turn, thread, messaging, grouped messages, ai chat

## Usage

The row a single turn occupies. It owns the geometry — which side, the avatar gutter, where the name and timestamp go, where reactions and receipts go — and nothing about how the content looks. That separation is the point: an assistant's markdown answer, a one-line reply, an attachment, and a tool-call card are all the same row with different children.

### Best practices

- Do: Set `messageId`. It is what MessageScroller reads for `scrollToMessage`, `initialScroll`, and visibility tracking — a message without one cannot be jumped to or marked as read.
- Do: Pass the same `align` to Message and to the Bubble inside it, so the flattened tail corner lands on the speaker's side.
- Do: Use `grouped` for consecutive messages from one author. It tightens the spacing and hides the avatar while keeping its column reserved, so the run reads as one block instead of stepping left. Pass `tail={false}` to the Bubble in each continuation too, so only the first message in the run carries a tail.
- Do: Match `avatarSize` to the `size` of the Avatar you pass (sm/md/lg line up 1:1). The gutter is declared, not measured, because it has to hold its width when `grouped` hides the avatar.
- Don't: Do not justify the content to move a message to the right. `align="end"` already mirrors the whole row, gutter included; adding your own justification fights it.
- Don't: Do not put the timestamp inside the Bubble. It belongs in `header` or `footer`, which stay outside the surface so `variant="plain"` content still has one.
- Don't: Do not reach for Message to lay out a system note or a date break. That is `Marker`, which is deliberately quieter than the message tier.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Avatar gutter | no | Fixed-width column for the author's Avatar. Kept (but emptied) when `grouped`, which is what keeps a run aligned. |
| Header | no | Author name and timestamp, above the content. |
| Content | yes | The children — usually a Bubble, but equally an Attachment, a tool card, or plain rendered markdown. |
| Footer | no | Reactions, delivery receipts, retry actions. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| messageId | string | — | Stable id, published as `data-message-id`. The handle MessageScroller uses for scroll commands and visibility tracking. |
| align | "start" \| "end" | "start" | Which side of the conversation. "start" is the other party or the assistant; "end" is the person reading. Mirrors the whole row, gutter included. |
| avatar | ReactNode | — | Avatar node for the gutter. Omit for a message with no author identity. |
| avatarSize | "sm" \| "md" \| "lg" | "sm" | Gutter width, matching Avatar's own size scale 1:1 (32 / 40 / 48px). Declared rather than measured so it survives `grouped`. |
| header | ReactNode | — | Author name, timestamp — anything above the content. |
| footer | ReactNode | — | Reactions, receipts, retry actions — anything below the content. |
| grouped | boolean | false | This message continues a run from the same author: tightens the spacing (via `--message-gap`) and drops the avatar while reserving its column. |
| ...div props | Omit<ComponentPropsWithRef<"div">, "id"> | — | Spread onto the row. Use `messageId` rather than `id` — the scroller matches on `data-message-id`. |

## Variants

- **align**: start, end
- **avatarSize**: sm, md, lg

## Tokens used

`foreground`, `muted-foreground`

## Accessibility

- A plain container with no imposed role — the conversation's semantics belong to the list or log element you wrap it in, not to each row.
- `align` reverses the visual row without reordering the DOM, so reading order in assistive tech stays chronological regardless of which side a message is on.
- The header and footer render at the secondary type step in muted ink, keeping both below the message tier in the visual hierarchy without dropping either below the AA contrast floor.

## Related

- Components: Bubble, MessageScroller, Marker, Attachment, Avatar

## Examples

### Incoming and outgoing

```tsx
import { Avatar, Bubble, Message, RelativeTime } from "@sableui/react"

<>
	<Message messageId="m1" avatar={<Avatar size="sm" fallback="CA" />} header={<><strong className="text-foreground">Carla</strong><RelativeTime date={sentAt} /></>}>
		<Bubble>Did the deploy finish?</Bubble>
	</Message>
	<Message messageId="m2" align="end">
		<Bubble variant="primary" align="end">Green across the board.</Bubble>
	</Message>
</>
```

### A grouped run

```tsx
import { Avatar, Bubble, Message } from "@sableui/react"

<>
	<Message messageId="m1" avatar={<Avatar size="sm" fallback="CA" />} header={<strong className="text-foreground">Carla</strong>}>
		<Bubble>One more thing.</Bubble>
	</Message>
	<Message messageId="m2" grouped>
		<Bubble tail={false}>The staging cert expires Friday.</Bubble>
	</Message>
</>
```

### With reactions in the footer

```tsx
import { Avatar, Bubble, BubbleReaction, BubbleReactions, Message } from "@sableui/react"

<Message messageId="m3" avatar={<Avatar size="sm" fallback="JR" />} footer={<BubbleReactions><BubbleReaction emoji="🎉" count={3} active /><BubbleReaction emoji="👀" /></BubbleReactions>}>
	<Bubble>Shipped 0.45.0.</Bubble>
</Message>
```

### An attachment as the content

```tsx
import { Attachment, Message } from "@sableui/react"

<Message messageId="m4" align="end">
	<Attachment name="proposal.pdf" meta="2.4 MB · PDF" />
</Message>
```
