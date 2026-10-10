# Bubble

**Status:** stable

The surface a message's content sits on: four treatments, an align-aware tail corner, a readable measure cap, and an optional row of reaction pills.

**Keywords:** chat bubble, message bubble, speech bubble, reactions, conversation, messaging, ai chat

## Usage

The tinted (or untinted) surface a turn's content sits on. Kept separate from Message because the row's layout and the content's surface change independently — an assistant's markdown answer wants no surface at all in exactly the same row a one-line reply wants a bubble.

### Best practices

- Do: Use `muted` for the other party and `primary` for the reader's own messages. Two treatments is the whole vocabulary a conversation needs to say who is speaking.
- Do: Reach for `variant="plain"` for long-form assistant output — rendered markdown, code blocks, tables. A tinted box around three paragraphs reads as a quote block rather than as a turn, and `plain` drops the measure cap with the surface.
- Do: Pass the same `align` you gave the enclosing Message, so the flattened corner lands on the speaker's side.
- Do: Set `tail={false}` on the continuation bubbles in a grouped run — the tail marks where a speaker starts, and repeating it on every line makes a block of one person's messages look like four separate turns.
- Do: Let the register size it. Inside `<Density value="compact">` a Bubble sets itself in the workspace prose tier automatically — a docked agent panel needs no per-call-site sizing, and hardcoding one defeats the mechanism.
- Don't: Do not remove the measure cap to fill a wide window. ~42rem is a reading measure; a bubble spanning a 1600px viewport is a paragraph at 140 characters per line.
- Don't: Do not put the timestamp or the author name inside the bubble. Those are Message's `header` / `footer`, which stay outside the surface and so still work under `variant="plain"`.
- Don't: Do not use a Bubble for a system note or a streaming status. Those are `Marker`, which is deliberately quieter than the message tier.
- Don't: Do not render reactions as static text. `BubbleReaction` is a toggle and reports `aria-pressed`, which is how a screen-reader user knows whether pressing it adds or removes their own reaction.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Bubble | yes | The surface itself. Holds the variant, the side, and the flattened tail corner. |
| BubbleReactions | no | The row of reaction pills, just under the bubble at the message column's small gap, so it reads as belonging to that message rather than the next row. |
| BubbleReaction | no | One reaction pill — emoji, count (hidden at 1), and pressed state. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| BubbleReactions | { align?: "start" \| "end" } & ComponentPropsWithRef<"div"> | Row container for reaction pills. Match `align` to the Bubble so the row hangs off the same edge. |
| BubbleReaction | { emoji: ReactNode; count?: number; active?: boolean } & ComponentPropsWithRef<"button"> | One reaction pill. A toggle, not a label: `active` drives `aria-pressed` as well as the styling, and `count` is hidden at 1 because the pill already says "one". |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "muted" \| "primary" \| "outline" \| "plain" | "muted" | Surface treatment. `muted` for the other party, `primary` for the reader's own messages, `outline` for a quieter own-side, `plain` for long-form output that should not sit in a box (also drops the measure cap and padding). |
| align | "start" \| "end" | "start" | Which side of the conversation the bubble is on — flattens the corner nearest the speaker. Match it to the enclosing Message. |
| tail | boolean | true | Flatten the speaker-side corner. A flattened corner rather than a drawn arrow, so it holds up in every theme's radius language (flat through fully pilled) with no per-theme geometry. Turn it off for the continuation bubbles in a grouped run. |
| ...div props | ComponentPropsWithRef<"div"> | — | Spread onto the surface element. |

## Variants

- **variant**: muted, primary, outline, plain
- **align**: start, end
- **tail**: true, false

## Tokens used

`muted`, `foreground`, `primary`, `primary-foreground`, `border`, `card`, `card-foreground`, `accent`, `accent-foreground`, `muted-foreground`, `ring`

## Accessibility

- The surface is a plain container with no imposed role — a bubble is presentation, and announcing one as a region would put a landmark around every line of a conversation.
- Reaction pills are real buttons reporting `aria-pressed`, so the reader's own reaction is state rather than colour alone; the emoji is hidden from AT and the count is left readable.
- `whitespace-pre-wrap` and `break-words` keep pasted logs, long URLs, and hard-wrapped text inside the surface instead of overflowing the conversation.
- Every variant meets AA against its own surface, including `primary`, which pairs the primary fill with its paired foreground token rather than a hardcoded white.

## Related

- Components: Message, MessageScroller, Marker, Attachment

## Examples

### Two sides

```tsx
import { Bubble, Message } from "@sableui/react"

<>
	<Message messageId="m1"><Bubble>Did the deploy finish?</Bubble></Message>
	<Message messageId="m2" align="end"><Bubble variant="primary" align="end">Green across the board.</Bubble></Message>
</>
```

### Long-form assistant output

```tsx
import { Avatar, Bubble, CodeBlock, Message } from "@sableui/react"

<Message messageId="a1" avatar={<Avatar size="sm" fallback="AI" />}>
	<Bubble variant="plain" className="space-y-3">
		<p className="text-body-md text-foreground">Three things changed in this release:</p>
		<CodeBlock code={diff} filename="CHANGELOG.md" />
	</Bubble>
</Message>
```

### With reactions

```tsx
import { Bubble, BubbleReaction, BubbleReactions, Message } from "@sableui/react"

<Message messageId="m3">
	<Bubble>Shipped 0.45.0.</Bubble>
	<BubbleReactions>
		<BubbleReaction emoji="🎉" count={3} active onClick={() => toggle("🎉")} />
		<BubbleReaction emoji="👀" count={1} onClick={() => toggle("👀")} />
	</BubbleReactions>
</Message>
```

### A grouped run drops the repeated tail

```tsx
import { Bubble, Message } from "@sableui/react"

<>
	<Message messageId="m1" align="end"><Bubble variant="primary" align="end">One more thing.</Bubble></Message>
	<Message messageId="m2" align="end" grouped><Bubble variant="primary" align="end" tail={false}>The staging cert expires Friday.</Bubble></Message>
</>
```
