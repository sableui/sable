import type { DesignNotes } from "."

export default {
	intro: "A “more actions” button for extra actions on a row, card or toolbar item, when the main action is already visible.",
	do: [
		"Keep it to secondary actions.",
		"Give the button a clear name for screen readers, like \"Post actions\".",
	],
	dont: [
		"Hide the most important or most used action in it.",
		"Show it only on hover on touch screens. Keep it visible there.",
	],
} satisfies DesignNotes
