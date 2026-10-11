# UploadListBlock

An upload queue: full-width Attachment rows — one uploading with progress and a cancel button, one finished with a success check.

**Intent:** Reach for this under a FileDropzone, or anywhere files are in flight — a composer, an import step, a document form. For files attached to a message, Attachment chips in the composer fit better.

**Block:** Media & files · card · designed for 16rem–20rem wide (fills its container up to the max)

## Notes

- Rows, not chips: each Attachment drops its chip cap (`max-w-none`) to fill the block's width.
- The success check sits in a control-sized box so it lines up with the cancel button on the row above.
- No card: Attachment rows are their own surfaces. Wrap the block in a Card if it needs a header.

## Accessibility

- Attachment announces upload progress; the cancel Button carries aria-label.
- The finished row's check carries aria-label="Uploaded", so the state is spoken, not only coloured.

## Source

```tsx
import { Attachment, Button, cn, Icon } from "@sableui/react"

const uploading = { name: "brand-guidelines.pdf", meta: "4.2 MB of 6.8 MB", progress: 62 }
const uploaded = { name: "cover-final.png", meta: "Uploaded · 2.1 MB" }

export interface UploadListBlockProps {
	className?: string
	/** Called when the in-progress upload is cancelled. */
	onCancel?: () => void
}

export function UploadListBlock({ className, onCancel }: UploadListBlockProps) {
	return (
		// An upload list, not chips: rows fill the block's width.
		<div className={cn("flex w-full max-w-xs flex-col gap-2", className)}>
			<Attachment
				className="max-w-none"
				name={uploading.name}
				meta={uploading.meta}
				status="uploading"
				progress={uploading.progress}
				actions={
					<Button variant="ghost" size="icon-sm" aria-label="Cancel upload" onClick={onCancel}>
						<Icon name="xmark" />
					</Button>
				}
			/>
			<Attachment
				className="max-w-none"
				name={uploaded.name}
				icon="image-stack"
				meta={uploaded.meta}
				// The same box as the icon-sm button above, so the check centres on
				// the cancel button's line instead of hugging the edge.
				actions={
					<span className="grid size-(--control-sm) place-items-center">
						<Icon name="circle-check" className="text-success" aria-label="Uploaded" />
					</span>
				}
			/>
		</div>
	)
}
```
