# StreamingText

**Status:** stable

Prose arriving from a live source, a token at a time. Each token resolves out of blur, the trailing edge stays soft while more is coming, and a steady caret marks the write head.

**Keywords:** streaming, stream, tokens, typewriter, generation, assistant, llm, caret, incremental

## Usage

Use StreamingText for text whose final length is unknown while it renders — a model's answer, a live transcript, a log line being written. It is the counterpart to ThinkingOrb and Spinner: those cover the wait BEFORE the first token, this covers the arrival of the tokens themselves.

### Best practices

- Do: In a chat, read `sable docs building-a-chat`: one status drives `streaming` and the composer, a regenerated answer takes a new key (the text is append-only), and the finished turn is announced once.
- Do: Grow `text` and let the component do the rest. It assumes an append-only string and keys units by index, so React mounts only the new spans — re-rendering a longer string animates what was added and leaves what the reader has already read alone.
- Do: Drop `streaming` to false the moment the source closes. That is what removes the caret and the softened tail, and their disappearance is the only signal the reader gets that the answer is complete.
- Do: Turn `caret` off when something adjacent already reports the wait — a spinner in the message header, a status row beneath. Two indicators for one wait read as two things happening.
- Don't: Do not use it for text that is already complete. Staging known text on scroll is TextReveal (a `motion` export, not a component folder), which computes a stagger from the full string; StreamingText cannot, because nothing here knows the length. Using it for static prose animates the whole paragraph on every mount and says 'still generating' about something that finished.
- Don't: Do not wrap it in an aria-live region. Every token would be announced, which is unusable; the component sets `aria-busy` instead. Announce once when the turn settles, from whatever owns the turn.
- Don't: Do not pass `split="char"` for paragraph-length text. It is one element per character — thousands of nodes for an answer, each with its own animation — and word-splitting is indistinguishable at prose reading speed. Reserve it for a headline-length string.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Container | yes | The paragraph (or `as` element). Carries `aria-busy` while output is incomplete. |
| Unit | yes | One word or character. Animates once on mount and never again; the newest one carries the softened tail while streaming. |
| Caret | no | The write head, shown while streaming. Steady rather than blinking — see `motion-caret`. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | string | — | The text received so far. Assumed append-only: the component keys units by index precisely so a grown string mounts only its new spans. |
| streaming | boolean | false | Whether more is still coming. Drives the caret, the softened trailing edge, and `aria-busy`. |
| as | ElementType | "p" | Render container element. |
| split | "word" \| "char" | "word" | Split granularity. `char` is one element per character — short strings only. |
| caret | boolean | true | Show the caret while streaming. Turn it off when something adjacent already reports the wait. |

## Tokens used

`foreground`

## Motion

- **arrival** · Unit · `motion-stream-in` — Each token resolves out of blur rather than fading. A fade makes every word a separate event; blur reads as the word coming into focus, so a paragraph arrives as one sentence being written instead of a queue of arrivals.
- **response** · Container · _no motion_ — It is prose, not a control. Selecting and copying it is the only interaction, and both are native.
- **transition** · Container · _no motion_ — There is no state to move between — streaming to complete is marked by the caret and tail leaving, not by the text changing. Animating the whole paragraph on completion would re-stage text the reader already read.
- **activity** · Caret · `motion-caret` — The caret is the write head, and it is deliberately STEADY (`data-streaming="true"` suppresses the blink). A blink during arrival puts two rhythms on screen — text advancing at one rate, a caret flashing at another — and the flashing one carries no information the moving text has not already given.

## Accessibility

- The text is real text in the accessibility tree: units are ordinary spans, not aria-hidden fragments, so a screen reader concatenates them into the sentence.
- `aria-busy` is set on the container while `streaming` is true, marking the output incomplete without announcing each token.
- The caret is `aria-hidden` — it is a rendering of the write head, and a screen reader has no use for it.
- Under reduced motion or with MotionProvider off, no unit animates and no tail is softened; text simply appears as it arrives.

## Related

- Components: ThinkingOrb, Message, Bubble

## Examples

### Streaming an answer

```tsx
import { StreamingText } from "@sableui/react"

<StreamingText text={answer} streaming={pending} />
```

### Inside a message, with the wait reported elsewhere

```tsx
import { Message, StreamingText } from "@sableui/react"

<Message align="start"><StreamingText text={answer} streaming={pending} caret={false} /></Message>
```

### A headline resolving character by character

```tsx
import { StreamingText } from "@sableui/react"

<StreamingText as="h2" split="char" className="text-heading-2" text={headline} streaming={pending} />
```
