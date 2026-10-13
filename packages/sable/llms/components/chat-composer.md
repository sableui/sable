# ChatComposer

**Status:** stable

The input half of a conversation: one surface holding attachments, an auto-growing field, and its controls. Enter sends, Shift+Enter breaks the line (sendOn="mod-enter" swaps them for long-form replies), and send becomes stop while a reply streams.

**Keywords:** chat input, composer, message input, prompt input, send message, ai chat, support chat, textarea

## Usage

Pairs with MessageScroller to make a working chat. A single surface rather than an input with buttons parked beside it: attachments above, text in the middle, affordances along the bottom. Works controlled or uncontrolled — uncontrolled is the default because it is what the common case wants, and what lets a hook-free page shell ship a composer that actually types.

### Best practices

- Do: Pass `busy` while a reply streams, and `onStop` alongside it. Interrupting a long generation is the most common thing a reader wants during one, and the control belongs where their cursor already is.
- Do: Leave it uncontrolled unless you need the text elsewhere — a slash-command menu, a draft you persist. Uncontrolled clears itself on send; controlled does not.
- Do: Render pending uploads as `<Attachment>` chips in `attachments`, so the file and the message it belongs to stay in one box.
- Do: Put model pickers and tool toggles in `leading`, beside the attach button — they are composer state, not message content, and belong on the chrome row rather than in the field.
- Do: Building a docked agent panel inside a tool? Wrap the whole conversation — scroller, messages and composer — in `<Density value="compact">`. The entire set follows the workspace register from there: prose drops a tier, the rhythm tightens, and the controls come off the compact ladder. Do not hand-size it at the call site.
- Don't: Do not clear a controlled composer for the user on send. Only the caller knows whether the send succeeded, and clearing on their behalf loses the message when it did not.
- Don't: Do not add your own Enter-to-send handler on top. The built-in one already guards against firing mid-IME-composition, which is the line hand-rolled chat inputs miss.
- Don't: Do not use it as a general multi-line input inside a larger form. That is `Textarea`. A standalone reply box that sends multi-paragraph messages (email, support replies) is this one with sendOn="mod-enter".
- Don't: Do not override the field's type utility to make it match your transcript. The field and `Bubble` both read the same tier already, which is what stops a message changing size the moment it is sent — overriding one breaks that pairing.
- Don't: Do not remove the height cap to let the field grow without limit. A pasted essay would push the conversation off the screen; past the cap it scrolls.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Attachments | no | Pending files as chips, above the field, inside the same surface. |
| Field | yes | An auto-growing Textarea, stripped of its own border and ring — the surface carries both — capped before it eats the transcript. |
| Controls | yes | Attach and any `leading` controls on the left; `actions` and the send/stop button on the right. |
| Footer | no | Helper text or a character counter below the controls. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | string | — | Controlled value. Omit for an uncontrolled composer that owns its own text. |
| defaultValue | string | "" | Initial value when uncontrolled. |
| onValueChange | (value: string) => void | — | Notified on every keystroke. Required when `value` is supplied. |
| onSend | (value: string) => void | — | Called with the trimmed message. An uncontrolled composer clears itself afterwards; a controlled one is the caller's to clear. |
| placeholder | string | "Send a message…" | Placeholder for the field. |
| sendOn | "enter" \| "mod-enter" | "enter" | Which key sends. enter for chat (Shift+Enter breaks the line). mod-enter for long-form replies such as an email or a support answer: Enter breaks the line and Cmd/Ctrl+Enter sends, so a paragraph break never mails a draft. Say so in footer ("Cmd+Enter to send"). |
| busy | boolean | false | A reply is streaming. Disables send, and swaps it for a stop control when `onStop` is supplied. |
| onStop | () => void | — | Interrupt the in-flight reply. Supplying it turns send into stop while busy. |
| disabled | boolean | false | Block sending entirely — over a limit, disconnected, read-only thread. Distinct from `busy`, which is temporary and offers a way out (stop). |
| invalid | boolean | false | Mark the current text invalid. Colours the surface border and sets `aria-invalid` on the field. |
| attachments | ReactNode | — | Attachment chips, shown above the field. |
| leading | ReactNode | — | Controls on the left of the footer row — model picker, tool toggles. |
| actions | ReactNode | — | Extra controls left of the send button. |
| onAttach | () => void | — | Attach handler. Supplying it renders the built-in attach button. |
| label | string | "Message" | Accessible label for the field. |
| sendLabel | string | "Send message" | Accessible label for the send button. |
| stopLabel | string | "Stop generating" | Accessible label for the stop button. |
| footer | ReactNode | — | Helper text or counter below the controls. |
| fieldRef | Ref<HTMLTextAreaElement> | — | Ref to the underlying textarea — for focusing after a send, or on mount. |
| ...form props | Omit<ComponentPropsWithRef<"form">, "onSubmit" \| "defaultValue"> | — | Spread onto the form element. Use `onSend` rather than `onSubmit`. |

## Variants

- **invalid**: true, false

## Tokens used

`card`, `input`, `ring`, `destructive`, `foreground`, `muted-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `accent`, `accent-foreground`

## Accessibility

- A real `<form>`, so the send button is a submit button and the whole thing behaves as one control to assistive tech and to password managers alike.
- Enter never submits while an IME composition is open (`isComposing`), so a CJK reader confirming a candidate word does not mail a fragment of their first sentence.
- The focus ring is drawn on the surface via `focus-within`, not on the textarea, so the visible focus indicator matches the box a sighted user perceives as the input.
- Send is disabled — not merely styled down — until there is non-whitespace to send, so the affordance and the behaviour agree for keyboard users.
- Icon-only attach, send and stop buttons all carry accessible labels, each overridable for localisation.

## Related

- Components: MessageScroller, Message, Bubble, Attachment, Textarea
- Patterns: ChatPanel

## Examples

### Uncontrolled — the common case

```tsx
import { ChatComposer } from "@sableui/react"

<ChatComposer onSend={(text) => send(text)} onAttach={pickFile} />
```

### Streaming, with a stop control

```tsx
import { ChatComposer } from "@sableui/react"

<ChatComposer onSend={send} busy={isStreaming} onStop={stop} placeholder="Ask a follow-up…" />
```

### Controlled, with pending attachments

```tsx
import { Attachment, Button, ChatComposer, Icon } from "@sableui/react"

<ChatComposer
	value={draft}
	onValueChange={setDraft}
	onSend={(text) => { post(text, files); setDraft("") }}
	onAttach={pickFile}
	attachments={files.map((f) => (<Attachment key={f.id} variant="media" name={f.name} thumbnail={f.url} actions={<Button variant="floating" size="icon-xs" aria-label="Remove" onClick={() => drop(f.id)}><Icon name="xmark" /></Button>} />))}
	footer={`${draft.length} / 4000`}
	invalid={draft.length > 4000}
/>
```

### A working chat, end to end

```tsx
import { Bubble, ChatComposer, Marker, Message, MessageScroller } from "@sableui/react"

<div className="flex h-128 flex-col gap-3">
	<MessageScroller className="flex-1 min-h-0">
		{messages.map((m) => (<Message key={m.id} messageId={m.id} align={m.mine ? "end" : "start"}><Bubble variant={m.mine ? "primary" : "muted"} align={m.mine ? "end" : "start"}>{m.body}</Bubble></Message>))}
		{streaming ? <Marker icon="spinner" spin shimmer>Thinking…</Marker> : null}
	</MessageScroller>
	<ChatComposer onSend={send} busy={streaming} onStop={stop} />
</div>
```
