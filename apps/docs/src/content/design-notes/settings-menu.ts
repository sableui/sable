import type { DesignNotes } from "."

export default {
	intro: "A compact control that shows the current settings and opens to change them, like a model picker in a chat box.",
	do: [
		"Show the current values on the button, not the word \"Settings\".",
		"Show each setting's current value in its row.",
		"Use the filled style inside a composer so it doesn't float.",
	],
	dont: [
		"Use it for a single setting. Use a select.",
		"Mix actions like delete in with settings.",
		"Nest menus more than one level deep.",
	],
} satisfies DesignNotes
