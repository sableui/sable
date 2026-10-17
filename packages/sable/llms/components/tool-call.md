# ToolCall

**Status:** stable

One tool an agent called, as a quiet row inside its turn: a status glyph, what it did, the tool's name and where it is — with the arguments and result behind a disclosure.

**Keywords:** tool call, function call, tool use, agent step, mcp, ai, tool result, agent activity

## Usage

Use it for each tool call in an assistant's turn, so the person can see what the agent did and check any step. The row is the summary — glyph, a plain-words title, the tool's name, the status — and stays one line, so a turn with ten calls is still scannable. Input and output sit behind the disclosure, because they are read rarely and, when they are, in full.

### Best practices

- Do: Give it a `title` in plain words, in the tense of the status: "Searching the docs" while running, "Searched the docs" once done. The `name` stays beside it in mono for the person who wants to know exactly which tool ran.
- Do: Drive `status` from the call's real state and keep the same element mounted as it changes. The spinner swaps for the outcome in place, and the change is announced to screen readers once.
- Do: Pass `error` with `status="error"`. It shows under the row without opening anything, because a failure is the one result everyone needs to read.
- Do: Pass a rendered result as `children` when the output is something to look at — a list of hits, a diff — rather than data to inspect. It replaces the output's code view, and `input` still shows above it.
- Don't: Do not put the approve and deny buttons in a ToolCall. A call held for permission is `status="awaiting"` here, and the decision itself is ApprovalBlock, which says what will happen and asks once.
- Don't: Do not use it for the agent's thinking or a progress note. A wait with no tool behind it is ThinkingOrb or a Spinner with a status line, and a row that claims a tool ran when none did makes every other row less trustworthy. → use **ThinkingOrb**, **Spinner**
- Don't: Do not open every call by default. A turn whose calls all show their JSON buries the answer; leave `defaultOpen` for the one call the person is likely to check, if any.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Status glyph | yes | Spinner while running, then the outcome: check, warning, clock (awaiting approval) or ×. The only part that moves. |
| Title | no | What the call does, in plain words. Without one, the tool's name leads. |
| Name | yes | The tool's own name in mono, after the title. Hidden below the sm breakpoint when a title is present. |
| Status | yes | One word for where the call is: Running, Needs approval, Done, Failed, Denied. |
| Error line | no | The failure message, under the row and always visible. |
| Details | no | Input and output as code, or a rendered result. A disclosure; the row is its trigger. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | string | — | The tool's own name, as the model called it (`search_docs`). Shown in mono. |
| title | ReactNode | — | What the call does, in words a person reads. Leads the row; omit it and `name` leads. |
| status | "running" \| "awaiting" \| "complete" \| "error" \| "denied" | "running" | Where the call is. `awaiting` is held for the person's approval; `denied` is one they declined. |
| statusLabel | string | — | Overrides the status word, for another language or a more specific phrase. |
| input | unknown | — | The arguments. A string shows as is; anything else as formatted JSON. |
| output | unknown | — | The result, shown the same way as `input`. |
| error | ReactNode | — | What went wrong, for `status="error"`. Always visible under the row. |
| children | ReactNode | — | A rendered result in place of `output`'s code view. |
| defaultOpen | boolean | false | Open the details on mount. |
| open | boolean | — | Controlled open state of the details. |
| onOpenChange | (open: boolean) => void | — | Called when the details open or close. |

## Variants

- **status**: running, awaiting, complete, error, denied

## Tokens used

`card`, `border`, `destructive`, `muted`, `muted-foreground`, `foreground`, `tone-warning`, `ring`

## Motion

- **arrival** · Root · _no motion_ — It arrives as part of the assistant's turn, and the turn's own arrival covers it. A second entrance per call would make a busy turn twitch.
- **response** · Header · `motion-interactive` — The header is the disclosure trigger but reads as a status row. The hover step is what tells the person it opens.
- **transition** · Status glyph · `motion-icon-swap` — The spinner becoming a check or a warning is the moment the call settles, and it is the one change in the row worth catching from the corner of the eye. The swap reads as one mark replaced, not a flicker.
- **transition** · Details · `motion-disclosure` — The height change connects the code that appears to the row that was pressed, in a thread where several rows look alike.
- **activity** · Status glyph · `motion-spin` — While the call runs, the spinner is what separates working from stuck. It pauses once the call settles, so a long thread of finished calls costs nothing.

## Accessibility

- With details, the header is a button with aria-expanded (Base UI Collapsible); its name is the title, the tool name and the status word, so it reads as one sentence.
- A status change after mount is announced once through a polite role=status region ("Searched the docs: Done"). The status a call mounts with is not announced, so a thread restored from history stays quiet.
- The glyph is aria-hidden: the status word beside it carries the meaning, so colour and shape are never the only signal.

## Related

- Components: Message, ThinkingOrb, StreamingText, CodeBlock, Collapsible, InlineStatus

## Examples

### A finished call

```tsx
import { ToolCall } from "@sableui/react"

<ToolCall
	name="search_docs"
	title="Searched the docs"
	status="complete"
	input={{ query: "date range picker" }}
	output={{ hits: ["DatePicker", "Calendar", "DateTile"] }}
/>
```

### Running, then failed

```tsx
import { ToolCall } from "@sableui/react"

<div className="flex flex-col gap-2">
	<ToolCall name="read_file" title="Reading package.json" status="running" input={{ path: "package.json" }} />
	<ToolCall
		name="run_tests"
		title="Ran the tests"
		status="error"
		error="3 of 412 tests failed in date-picker.test.tsx."
		input={{ filter: "date-picker" }}
	/>
</div>
```

### Waiting for approval

```tsx
import { ToolCall } from "@sableui/react"

<ToolCall name="send_email" title="Send the invoice to Ada" status="awaiting" input={{ to: "ada@example.com", subject: "INV-1042" }} />
```
