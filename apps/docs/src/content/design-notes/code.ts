import type { DesignNotes } from "."

export default {
	intro: "Inline code for short commands, names and keys inside a sentence.",
	do: [
		"Keep it short so it doesn't take over the paragraph.",
		"Say in the sentence when exact spelling matters.",
	],
	dont: [
		"Use it for multi-line code. Use a code block.",
		"Use it for something people need to copy. Use a code block with a prompt.",
	],
} satisfies DesignNotes
