import type { DesignNotes } from "."

export default {
	intro: "A multi-line text field for notes, descriptions and messages.",
	do: [
		"Size it to the amount of text you expect.",
		"Add a label, plus helper text or a limit when expectations are specific.",
		"Keep the text at 16px or larger on mobile so the page doesn't zoom.",
	],
	dont: [
		"Use it for short, single-line values. Use an input.",
		"Leave a long-form field at two rows.",
	],
} satisfies DesignNotes
