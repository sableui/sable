# FileDropzone

**Status:** stable

Drag-and-drop target and file picker in one keyboard-operable button. Checks accept, maxSize and maxFiles on every selection, announces each rejection with how to fix it, and hands accepted files to you to list as Attachments.

**Keywords:** file upload, dropzone, drag and drop, file picker, upload, attach file, file input, import

## Usage

Use FileDropzone where adding files is the main job of a section — an upload step, an import screen, a document request. It gives the drag gesture a visible target and the same action a button for everyone who does not drag. It holds no list: render accepted files as Attachments beneath it, where progress, retry and remove belong.

### Best practices

- Do: State the constraints in `description` ("PNG or PDF, up to 10 MB") and give `acceptLabel` the same words, so a rejection repeats the rule the user already read.
- Do: Pair it with a list of Attachment rows that you own. Once files are added, switch to `size="sm"` so the target stays available without pushing the list below the fold.
- Do: Cap the total by passing `maxFiles={limit - files.length}`; the dropzone only sees one selection at a time. When none remain, set `disabled` and say why in `description` ("Remove one to add another").
- Don't: Do not use it for an incidental attach action inside a composer or a toolbar. A paperclip Button that opens the picker is the right weight there; ChatComposer already has one.
- Don't: Do not rely on `accept` alone to protect the server. The dropzone's checks are for the user's benefit; validate type and size again where the file is received.
- Don't: Do not silently drop rejected files. The zone announces each one, but if you also discard files later (a server-side limit), say so on the Attachment with `status="error"` and a fix.

### Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Zone | yes | A full-width button with a dashed border. Click, Enter or Space opens the picker; it is also the drop target. |
| Icon | no | A decorative mark that lifts while a file is dragged over the zone. |
| Label and description | yes | The call to action and the constraints. Together they form the button's accessible name. |
| Status | yes | A role=status region, present from the first render, that lists each rejected file and how to fix it. |

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| accept | string | — | Native accept syntax — `.pdf`, `application/pdf`, `image/*`, comma-separated. Enforced on drop and on pick. |
| maxSize | number | — | Largest accepted file, in bytes. |
| multiple | boolean | false | Accept more than one file per selection. |
| maxFiles | number | — | Most files accepted from one selection when `multiple`. Pass the remaining capacity to cap a total. |
| onFilesAccepted | (files: File[]) => void | — | Files that passed every check, in selection order. |
| onFilesRejected | (rejections: FileRejection[]) => void | — | Files that failed, each with `code` (file-invalid-type, file-too-large, too-many-files) and the announced `message`. |
| label | ReactNode | "Drop a file here or browse" | The visible call to action. Pluralised automatically when `multiple`. |
| description | ReactNode | — | The constraints in words, shown under the label. |
| acceptLabel | string | — | How the accepted types complete "Use … instead" in an error ("PNG or PDF", "an image or PDF"). Without it a type error can only say "Choose a different file". |
| formatError | (rejection) => string | — | Replace the rejection copy, e.g. to localize it. |
| icon | string | "arrow-up" | Semantic icon name. |
| size | "md" \| "sm" | "md" | `md` is the empty-section target; `sm` is a single-row strip above an existing list. |
| disabled / required / id / aria-invalid | — | — | Standard form-control props. `id` lands on the button, so `<Field>` labels it; `aria-invalid` draws the destructive border. |

## Variants

- **size**: md, sm

## Tokens used

`card`, `foreground`, `muted`, `muted-foreground`, `border-strong`, `primary`, `primary-foreground`, `accent`, `accent-foreground`, `ring`, `destructive`

## Motion

- **arrival** · Zone · _no motion_ — The zone is the section's content, present from the start. An entrance would only delay the drop target someone is already dragging toward.
- **response** · Zone · `motion-interactive` — Hover strengthens the border to primary, which confirms the whole dashed area — not just the word "browse" — is the click target.
- **transition** · Icon · `motion-interactive` — When a file crosses into the zone the icon fills and lifts and the surface tints. That is the only signal that releasing here will work; without it users drop on the page and the browser opens the file instead.
- **activity** · Zone · _no motion_ — The zone hands files off immediately and never uploads. Transfer progress belongs on each Attachment, where it can be per-file and retryable.

## Accessibility

- The zone is a native button: Enter or Space opens the system picker, so dragging is never the only way in.
- Rejections render into a role=status region that exists from the first render, and the button's aria-describedby points at it while it has content, so the reason is still read when focus returns.
- Every error names the file and says how to fix it ("Choose a smaller file"), rather than only what failed.
- The underlying file input is visually hidden and removed from the tab order; the button is the single focus stop.

## Related

- Components: Attachment, Input, Button, Progress

## Examples

### Images and PDFs

```tsx
import { FileDropzone } from "@sableui/react"

<FileDropzone accept="image/*,.pdf" acceptLabel="an image or PDF" maxSize={10 * 1024 * 1024} multiple description="Images or PDFs, up to 10 MB each" onFilesAccepted={(files) => console.log(files)} />
```

### With an Attachment list

```tsx
import { Attachment, FileDropzone } from "@sableui/react"

<div className="flex flex-col gap-3">
	<FileDropzone size="sm" multiple description="Up to 5 files" onFilesAccepted={(files) => console.log(files)} />
	<Attachment name="contract.pdf" meta="2.4 MB · PDF" />
	<Attachment name="site-photo.jpg" meta="Uploading…" status="uploading" progress={42} />
</div>
```

### In a field

```tsx
import { Field, FileDropzone } from "@sableui/react"

<Field label="Proof of address" description="A bill or statement from the last 3 months."><FileDropzone accept=".pdf" acceptLabel="a PDF" maxSize={5 * 1024 * 1024} description="PDF, up to 5 MB" /></Field>
```
