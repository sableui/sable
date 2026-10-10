import type { DesignNotes } from "."

export default {
	intro: "A small panel anchored to a button. More room than a tooltip, lighter than a dialog.",
	do: [
		"Use it for small pickers, summaries or quick controls.",
		"Keep how it opens and closes predictable.",
	],
	dont: [
		"Use it for blocking confirmations or critical information.",
		"Put a form in it that can fail. Use a dialog.",
	],
} satisfies DesignNotes
