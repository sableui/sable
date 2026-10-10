import type { DesignNotes } from "."

export default {
	intro: "Text that arrives a word at a time from a live source, like an assistant's answer or a live transcript.",
	do: [
		"Stop the streaming state the moment the text is complete.",
		"Hide the caret when something nearby already shows the wait.",
		"Keep letter-by-letter for short headlines.",
	],
	dont: [
		"Use it for text that is already complete.",
	],
} satisfies DesignNotes
