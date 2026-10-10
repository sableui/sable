import type { DesignNotes } from "."

export default {
	intro: "A panel that slides in from the edge of the screen for a side task, like filtering or editing, without leaving the page.",
	do: [
		"Use it for inspecting, editing, filtering or creating tied to the current page.",
		"Give it a clear title, a way to close, and actions in the footer.",
	],
	dont: [
		"Use it for a simple confirmation. Use a dialog.",
		"Use it on desktop where a dialog fits better.",
		"Nest deep, multi-step flows inside it.",
	],
} satisfies DesignNotes
