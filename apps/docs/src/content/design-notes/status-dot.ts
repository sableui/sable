import type { DesignNotes } from "."

export default {
	intro: "A small colored dot that hints at state, like online, live, or offline.",
	do: [
		"Always put it next to a word that says the same thing.",
		"Use the pulse only for things that are live or changing right now.",
		"Keep one dot size within a list.",
	],
	dont: [
		"Let the color carry the meaning on its own.",
	],
} satisfies DesignNotes
