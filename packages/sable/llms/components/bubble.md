# Bubble

**Status:** stable

The surface a message's content sits on: four treatments, an align-aware tail, a readable measure cap, and an optional row of reaction pills.

**Keywords:** chat bubble, message bubble, speech bubble, reactions, conversation, messaging, ai chat

## Usage

The tinted (or untinted) surface a turn's content sits on. Kept separate from Message because the row's layout and the content's surface change independently — an assistant's markdown answer wants no surface at all in exactly the same row a one-line reply wants a bubble.

### Best practices

- Do: Use `muted` for the other party and `primary` for the reader's own messages. Two treatments is the whole vocabulary a conversation needs to say who is speaking.
- Do: Reach for `variant="plain"` for long-form assistant output — rendered markdown, code blocks, tables. A tinted box around three paragraphs reads as a quote block rather than as a turn, and `plain` drops the measure cap with the surface.
- Do: Pass the same `align` you gave the enclosing Message, so the tail lands on the speaker's side.
- Do: Set `tail={false}` on the continuation bubbles in a grouped run — the tail marks where a speaker starts, and repeating it on every line makes a block of one person's messages look like four separate turns.
- Do: Let the register size it. Inside `<Density value="compact">` a Bubble sets itself in the workspace prose tier automatically — a docked agent panel needs no per-call-site sizing, and hardcoding one defeats the mechanism.
- Don't: Do not remove the measure cap to fill a wide window. ~42rem is a reading measure; a bubble spanning a 1600px viewport is a paragraph at 140 characters per line.
- Don't: Do not put the timestamp or the author name inside the bubble. Those are Message's `header` / `footer`, which stay outside the surface and so still work under `variant="plain"`.
- Don't: Do not use a Bubble for a system note or a streaming status. Those are `Marker`, which is deliberately quieter than the message tier.
- Don't: Do not render reactions as static text. `BubbleReaction` is a toggle and reports `aria-pressed`, which is how a screen-reader user knows whether pressing it adds or removes their own reaction.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Bubble | yes | The surface itself. Holds the variant, the side, and the tail. |
| BubbleReactions | no | The row of reaction pills, just under the bubble at the message column's small gap, so it reads as belonging to that message rather than the next row. |
| BubbleReaction | no | One reaction pill — emoji, count (hidden at 1), and pressed state. Celebrates when it becomes the reader's own. |
| BubbleReactionAdd | no | The add-reaction pill at the end of the row: opens a ReactionPicker above it. |

## Subcomponents

| Name | Type | Description |
| --- | --- | --- |
| BubbleReactions | { align?: "start" \| "end" } & ComponentPropsWithRef<"div"> | Row container for reaction pills. Match `align` to the Bubble so the row hangs off the same edge. |
| BubbleReaction | { emoji: ReactNode; label?: string; count?: number; active?: boolean; motion?: MotionLevel } & ComponentPropsWithRef<"button"> | One reaction pill. A toggle, not a label: `active` drives `aria-pressed` as well as the styling, `label` names it ("Party, 3"), and `count` is hidden at 1 because the pill already says "one". When it turns on — pressed, or newly added already on — the emoji blooms, copies of it burst out and the count rolls; pills the page loads with stay still. |
| BubbleReactionAdd | { reactions?: Reaction[]; selected?: string[]; onSelect?: (emoji: string) => void; label?: string; motion?: MotionLevel } & ComponentPropsWithRef<"button"> | The add-reaction pill: a smiley that opens a ReactionPicker above it. Choosing an emoji closes the picker and calls `onSelect`; add the emoji to the row and its new pill celebrates on arrival. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "muted" \| "primary" \| "outline" \| "plain" | "muted" | Surface treatment. `muted` for the other party, `primary` for the reader's own messages, `outline` for a quieter own-side, `plain` for long-form output that should not sit in a box (also drops the measure cap and padding). |
| align | "start" \| "end" | "start" | Which side of the conversation the bubble is on — puts the tail on the speaker's side. Match it to the enclosing Message. |
| tail | boolean | true | Draw the tail: a small ear off the speaker-side top corner, which goes square to meet it. The same 5px in every theme's radius language, flat through fully pilled. The bubble keeps the ear's space either way, so turning it off for the continuation bubbles in a grouped run keeps the run aligned. |
| ...div props | ComponentPropsWithRef<"div"> | — | Spread onto the surface element. |

## Variants

- **variant**: muted, primary, outline, plain
- **align**: start, end
- **tail**: true, false

## Tokens used

`muted`, `foreground`, `primary`, `primary-foreground`, `border`, `card`, `card-foreground`, `accent`, `accent-foreground`, `muted-foreground`, `ring`

## Motion

- **arrival** · Bubble · _no motion_ — A bubble arrives with its Message row, which owns how a new message enters the transcript. A reaction pill that the reader just added arrives with its own celebration (below).
- **response** · BubbleReaction · `motion-bloom` — Reacting is the reader's choice, so it is answered like a like: the emoji grows from nothing past its size and settles, while copies of it spray outward and fade (Burst with the emoji as its particle, the way chat apps answer a reaction). Plays when a pill turns on and when a pill mounts already on into a row that has rendered — never for the pills a page loads with. Pills inherit Pill's motion-interactive and motion-press.
- **transition** · BubbleReaction · _custom (outside the recipe layer)_ — The count rolls with NumberTicker as people react. Turning a reaction off is quiet: the tint eases out and the count rolls back, with no burst. Under `subtle` or reduced motion the bloom and the spray are dropped and the tint and count alone answer.
- **activity** · Bubble · _no motion_ — A bubble is static content; a message still being written is StreamingText or a Marker, not a state of the surface.

## Accessibility

- The surface is a plain container with no imposed role — a bubble is presentation, and announcing one as a region would put a landmark around every line of a conversation.
- Reaction pills are real buttons reporting `aria-pressed`, so the reader's own reaction is state rather than colour alone. Give each a `label`: it is named "Party, 3", with the emoji and its burst hidden from AT. The add-reaction pill is named "Add reaction" and opens a toolbar picker.
- `whitespace-pre-wrap` and `break-words` keep pasted logs, long URLs, and hard-wrapped text inside the surface instead of overflowing the conversation.
- Every variant meets AA against its own surface, including `primary`, which pairs the primary fill with its paired foreground token rather than a hardcoded white.

## Related

- Components: Message, MessageScroller, Marker, Attachment, ReactionPicker

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
import { AgentAvatar, Bubble, CodeBlock, Message } from "@sableui/react"

<Message messageId="a1" avatar={<AgentAvatar size="sm" />}>
	<Bubble variant="plain" className="space-y-3">
		<p className="text-body-md text-foreground">Three things changed in this release:</p>
		<CodeBlock code={diff} filename="CHANGELOG.md" />
	</Bubble>
</Message>
```

### With reactions

```tsx
import { Bubble, BubbleReaction, BubbleReactionAdd, BubbleReactions, Message } from "@sableui/react"

<Message messageId="m3">
	<Bubble>Shipped 0.45.0.</Bubble>
	<BubbleReactions>
		<BubbleReaction emoji="🎉" label="Party" count={3} active onClick={() => toggle("🎉")} />
		<BubbleReaction emoji="👀" label="Eyes" count={1} onClick={() => toggle("👀")} />
		<BubbleReactionAdd selected={mine} onSelect={toggle} />
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
