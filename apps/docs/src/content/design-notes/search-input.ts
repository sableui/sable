import type { DesignNotes } from "."

export default {
	intro: "A search field with a magnifier and a clear button, for filtering a known set of content.",
	do: [
		"Name what's being searched in the placeholder.",
		"Give it a label. The magnifier alone isn't one.",
	],
	dont: [
		"Use it as a command palette. Use the command menu.",
		"Let results flicker and reshuffle on every keystroke.",
	],
} satisfies DesignNotes
