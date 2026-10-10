import type { DesignNotes } from "."

export default {
	intro: "Asks people to confirm an action that can't be undone, like deleting a post. Adds friction on purpose.",
	do: [
		"Name what will be affected and what happens to it.",
		"Make the destructive button clearly different from Cancel.",
		"Ask people to type the name for high-stakes deletes.",
	],
	dont: [
		"Use it for small actions that are easy to undo.",
		"Put Delete where Cancel usually sits, or focus it first.",
	],
} satisfies DesignNotes
