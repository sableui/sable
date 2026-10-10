import type { DesignNotes } from "."

export default {
	intro: "The scrolling area a chat lives in. It follows new messages, lets people scroll back, and keeps their place.",
	do: [
		"Reopen a thread where the reader left off, not at the bottom.",
		"Load older messages above without moving the view.",
		"Use the compact density for a docked assistant panel.",
	],
	dont: [
		"Use it for an ordinary long list people browse. Use a scroller.",
		"Snap back to the bottom while someone is reading earlier messages.",
	],
} satisfies DesignNotes
