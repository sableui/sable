import { Attachment } from "../components/attachment"
import { Button } from "../components/button"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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
