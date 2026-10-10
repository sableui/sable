import type { DesignNotes } from "."

export default {
	intro: "Pick one option, or several, from a long list by typing to filter it. Several picks show as chips. For short lists, a select is easier.",
	do: [
		"Write a helpful message for when nothing matches.",
		"Give it a label when it sits in a form.",
		"Keep chip labels short when it allows several picks.",
	],
	dont: [
		"Use it for a handful of options. Use a select or radio buttons.",
		"Use it to launch actions or jump around the app. Use the command menu.",
		"Allow several picks from two or three options. Show checkboxes instead.",
	],
} satisfies DesignNotes
