import type { DesignNotes } from "."

export default {
	intro: "Shows where a page sits in a hierarchy and gives a quick way back up. Best when people can land deep in nested content.",
	do: [
		"Use it when pages can be reached several levels down.",
		"Keep the current page as plain text, not a link.",
	],
	dont: [
		"Use it in place of main navigation.",
		"Use it to show progress through steps.",
	],
} satisfies DesignNotes
