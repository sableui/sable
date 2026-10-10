import type { DesignNotes } from "."

export default {
	intro: "A file or image shared in a conversation, from uploading in the composer to delivered in the thread.",
	do: [
		"Use the picture tile for images and the named row for documents.",
		"Show progress while uploading when you know it.",
		"Say why an upload failed in words, not just red.",
	],
	dont: [
		"Use it as a general file list. Use a tree.",
		"Wrap the card in your own link; remove would also open the file.",
	],
} satisfies DesignNotes
