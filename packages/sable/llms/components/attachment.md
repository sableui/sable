# Attachment

**Status:** stable

A file or image attached to a message: media or icon lead, name and metadata, upload and error states, an actions slot, and a full-card trigger that keeps those actions separately clickable.

**Keywords:** attachment, file, upload, image preview, chat file, document, drag and drop, file card

## Usage

The card a file takes in a conversation — in the composer while it uploads, and in the transcript once it has. It renders all four states an attachment actually moves through (queued, uploading, failed, delivered) rather than only the delivered one, because the other three are the states that are hard to get right and would otherwise fall back on every caller.

### Best practices

- Do: Use `variant="media"` for images and `variant="card"` for documents. A filename tells you nothing about a photo, and a thumbnail tells you nothing about a contract.
- Do: Pass `onOpen` rather than wrapping the card in your own button. It renders a stretched trigger underneath the actions, so the card is one tab stop, each action is its own, and clicking "remove" never opens the file.
- Do: Give `status="uploading"` a numeric `progress` when you have one and omit it when you do not — the bar goes indeterminate rather than lying about 0%.
- Do: Put the reason in `meta` when `status="error"`. The card re-colors but keeps its shape, so a failed upload stays recognisable as the file it was — the text is what says why.
- Don't: Do not nest interactive controls inside a card you have wrapped in a link or button yourself. That is invalid HTML and unreachable in the order it looks like; `onOpen` exists to avoid it.
- Don't: Do not use it as a generic file-list row. `Tree` is the file listing; this one is shaped for a conversation, where an attachment is a message payload.
- Don't: Do not rely on the error colour alone to signal failure. Colour is not a status for anyone who cannot see it — say what happened in `meta`.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Media | yes | Thumbnail crop or file glyph. Fills the tile in `media`, a lead square in `card`. |
| Label | yes | Name and metadata. A row beside the media in `card`; a scrim strip over the picture in `media`, shown only when there is something to say. |
| Actions | no | Remove / retry / download controls, stacked above the stretched trigger so they stay separately clickable. |
| Progress | no | A hairline bar along the bottom edge while `status="uploading"`; determinate with `progress`, indeterminate without. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | string | — | File name. Truncated rather than wrapped — the stem truncates and a short extension stays visible — and used as the default label for the stretched trigger and the media tile's alt text. |
| meta | ReactNode | — | Size, type, upload progress, or the failure reason — the quiet second line. |
| thumbnail | string | — | Image preview URL. Present means the card shows a crop of the file instead of a glyph. |
| icon | string | "file" | Semantic icon name for a non-image file (resolved through IconProvider). Defaults to "image-stack" when a thumbnail is set. |
| variant | "card" \| "media" | "card" | `card` is a name-led horizontal row for documents; `media` is a square tile that is mostly picture. |
| status | "idle" \| "uploading" \| "error" | "idle" | Transfer state. `uploading` adds a progress bar; `error` re-colors the card without changing its shape. |
| progress | number | — | Percentage 0–100 while uploading. Omit for an indeterminate bar. |
| actions | ReactNode | — | Remove / retry / download controls. Stay clickable when `onOpen` makes the card a trigger. On a `media` tile they float on the top-end corner over the picture, so pass `variant="floating"` buttons there. |
| onOpen | () => void | — | Makes the whole card activate, via a stretched button rendered beneath the actions rather than by wrapping the card. |
| openLabel | string | `Open ${name}` | Accessible label for that stretched trigger. |
| ...div props | Omit<ComponentPropsWithRef<"div">, "onClick"> | — | Spread onto the card. Use `onOpen` rather than `onClick` — a click handler on a div is not a control. |

## Variants

- **variant**: card, media
- **status**: idle, uploading, error

## Tokens used

`card`, `border`, `border-strong`, `muted`, `muted-foreground`, `foreground`, `destructive`, `overlay`, `overlay-foreground`, `ring`

## Motion

- **arrival** · Root · _no motion_ — An attachment lands as part of a composer or a message, and that surface owns the entrance. A card that animated in on its own would read as a second, separate event — as if another file had been added.
- **response** · Root · `motion-interactive` — With `onOpen`, the edge steps up under the pointer; it is the only cue that the card itself opens the file, not just its actions. Eased, it reads as the card answering the cursor rather than a border flickering as the pointer crosses a busy composer.
- **transition** · Root · `motion-interactive` — Uploading to failed re-colours the edge and fill without changing the shape. The ease keeps it legible as the same file turning red; snapped, a failed card looks like a different card replaced the one that was sent.
- **activity** · Progress · `motion-pulse` — While uploading with no known `progress`, the bar is indeterminate and pulses (Progress's own recipe); with a number, the fill eases toward each new value. A still bar at a fixed width is indistinguishable from an upload that has stalled.

## Accessibility

- The full-card trigger is a real stretched `<button>` with an accessible label, not a click handler on a div — so it is one tab stop, keyboard-activatable, and focus-ringed.
- Actions sit above that trigger in the stacking order, which keeps them individually focusable and stops a click on `remove` from also opening the file. Text is only made click-through when a trigger is present, so a filename stays selectable otherwise.
- A thumbnail is described as the attachment in `media` (where the picture is the only label) and left decorative in `card` (where the filename is right beside it), so AT never reads the same name twice.
- The upload bar carries an accessible name via Progress; the error state is carried by text in `meta` as well as colour.
- Label text on a media tile sits on `overlay` / `overlay-foreground` — a fixed pairing that stays legible over arbitrary imagery, where a theme surface token would not.

## Related

- Components: Message, Bubble, MessageScroller, Progress

## Examples

### Document with a remove action

```tsx
import { Attachment, Button, Icon } from "@sableui/react"

<Attachment name="proposal.pdf" meta="2.4 MB · PDF" onOpen={() => open(file)} actions={<Button variant="ghost" size="icon-xs" aria-label="Remove"><Icon name="xmark" /></Button>} />
```

### Image tile, uploading

```tsx
import { Attachment } from "@sableui/react"

<Attachment variant="media" name="cover.png" thumbnail={previewUrl} status="uploading" progress={62} meta="Uploading… 62%" />
```

### Failed upload with a retry

```tsx
import { Attachment, Button } from "@sableui/react"

<Attachment name="recording.mov" meta="Upload failed — file is over the 50 MB limit" status="error" icon="warning" actions={<Button variant="ghost" size="xs" onClick={retry}>Retry</Button>} />
```

### Attachments as a message payload

```tsx
import { Attachment, Message, RelativeTime } from "@sableui/react"

<Message messageId="m7" align="end" footer={<RelativeTime date={sentAt} />}>
	<div className="flex flex-wrap gap-2">
		{files.map((f) => (<Attachment key={f.id} variant="media" name={f.name} thumbnail={f.url} onOpen={() => open(f)} />))}
	</div>
</Message>
```
