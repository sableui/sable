import type { DesignNotes } from "."

export default {
	intro: "A list of labels and values, for read-only details like metadata or a settings summary.",
	do: [
		"Keep labels short and values easy to scan.",
		"Color a value to show status, but keep the word meaningful too.",
	],
	dont: [
		"Use it for editable fields. Use a form.",
		"Use it for a single label and value.",
	],
} satisfies DesignNotes
