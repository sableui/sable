# Marker

**Status:** stable

A non-message row in a conversation: streaming status, system note, bordered notice, or a labelled rule for date breaks. Quieter than the message tier by design.

**Keywords:** chat status, typing indicator, thinking, streaming, tool call, system message, date separator, date break, conversation divider

## Usage

Everything in a conversation that is not a message. Date breaks, "Carla joined", "Thinking…", "Ran search — 3 results", "Message failed to send". One component because they share one job: annotate the stream without competing with it.

### Best practices

- Do: Use `status` with `icon="spinner" spin` for work in flight, and add `shimmer` while text is actually streaming. The shimmer is scale-aware, so it freezes with the rest of the system under reduced motion.
- Do: Use `variant="separator"` for date breaks. The label sits between two rules, which reads as a division of the transcript rather than as another thing someone said.
- Do: Replace a status marker's text as the work progresses — "Thinking…" → "Searching the docs" → "Writing the answer". It is a live region, so each change is announced.
- Do: Reach for `bordered` only when a note needs containing — an error, an escalation, a retention notice. Boxing routine system events makes a transcript look like a list of alerts.
- Don't: Do not style a Marker up to message weight. Its whole value is being below that tier; a marker as loud as a message competes with the conversation it is annotating.
- Don't: Do not leave a status marker mounted after the work finishes. A permanent "Thinking…" is a live region that never resolves, which is worse than no status at all.
- Don't: Do not use it for a message from a person or an assistant. That is `Message` + `Bubble` — a marker has no author and no side.
- Don't: Do not set `live` on a `separator` or on a run of `note` markers. Announcing every date break and join event turns the live region into noise and buries the status that mattered.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | "status" \| "note" \| "bordered" \| "separator" | "status" | `status` for live activity, `note` for a system event, `bordered` for a note that needs containing, `separator` for a labelled rule. |
| icon | string | — | Semantic icon name shown before the label, resolved through IconProvider. |
| spin | boolean | false | Spin the icon — pair with `icon="spinner"` for work in flight. |
| shimmer | boolean | false | Sweep the label while something is streaming, via the scale-aware `motion-text-shimmer` recipe (freezes under reduced motion). |
| live | boolean | true for `status`, false otherwise | Announce the label to assistive tech as it changes. On for `status`, because a screen-reader user otherwise gets silence for the whole generation and no way to tell a slow answer from a dead one. |
| ...div props | ComponentPropsWithRef<"div"> | — | Spread onto the row. |

## Variants

- **variant**: status, note, bordered, separator

## Tokens used

`muted-foreground`, `muted`, `border`, `foreground`

## Accessibility

- `status` markers render as `role="status"` with `aria-live="polite"`, so a change of activity is announced without interrupting whatever is being read.
- The other variants are silent by default and can opt in with `live` — announcing every date break and join event would bury the status that mattered.
- The separator's rules are `aria-hidden`, leaving only the label in the accessibility tree; the shimmer is decoration over readable text, not a replacement for it.
- `motion-text-shimmer` keeps the label opaque through every frame — the gradient runs muted-foreground → foreground rather than fading to transparent, so the text never becomes unreadable mid-animation, and `--motion-scale` freezes it entirely under reduced motion.

## Related

- Components: Message, Bubble, MessageScroller, InlineStatus, Separator

## Examples

### Streaming status

```tsx
import { Marker } from "@sableui/react"

<Marker icon="spinner" spin shimmer>Thinking…</Marker>
```

### Date break

```tsx
import { Marker } from "@sableui/react"

<Marker variant="separator">Yesterday</Marker>
```

### System note

```tsx
import { Marker } from "@sableui/react"

<Marker variant="note" icon="user">Carla joined the conversation</Marker>
```

### A notice that needs containing

```tsx
import { Marker } from "@sableui/react"

<Marker variant="bordered" icon="warning">This conversation will be archived in 7 days.</Marker>
```

### In a transcript

```tsx
import { Bubble, Marker, Message, MessageScroller } from "@sableui/react"

<MessageScroller className="h-96">
	<Marker variant="separator">Today</Marker>
	<Message messageId="m1"><Bubble>Can you summarise the release?</Bubble></Message>
	<Marker variant="note" icon="sparkles">Ran changelog — 12 entries</Marker>
	<Marker icon="spinner" spin shimmer>Writing the answer</Marker>
</MessageScroller>
```
