import type { DesignNotes } from "."

export default {
	intro: "For picking a number within a range when a rough adjustment is quicker than typing. Two thumbs pick a range.",
	do: [
		"Show a label and the current value.",
		"Match the steps to how fine the setting really is.",
	],
	dont: [
		"Use it when people need to enter an exact number.",
		"Make the thumb's hit area grow on hover. Only the dot changes.",
	],
} satisfies DesignNotes
