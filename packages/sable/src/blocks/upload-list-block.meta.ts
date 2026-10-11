import type { BlockMeta } from "../lib/meta"

export const uploadListBlockMeta: BlockMeta = {
	name: "UploadListBlock",
	family: "Media & files",
	kind: "card",
	width: { min: "16rem", max: "20rem" },
	summary: "An upload queue: full-width Attachment rows — one uploading with progress and a cancel button, one finished with a success check.",
	intent:
		"Reach for this under a FileDropzone, or anywhere files are in flight — a composer, an import step, a document form. For files attached to a message, Attachment chips in the composer fit better.",
	notes: [
		"Rows, not chips: each Attachment drops its chip cap (`max-w-none`) to fill the block's width.",
		"The success check sits in a control-sized box so it lines up with the cancel button on the row above.",
		"No card: Attachment rows are their own surfaces. Wrap the block in a Card if it needs a header.",
	],
	a11y: [
		"Attachment announces upload progress; the cancel Button carries aria-label.",
		"The finished row's check carries aria-label=\"Uploaded\", so the state is spoken, not only coloured.",
	],
}
