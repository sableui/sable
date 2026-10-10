import type { DesignNotes } from "."

export default {
	intro: "One highlight that glides to the active item in a menu, list or segmented control, instead of each item lighting up on its own.",
	do: [
		"Use it where one item is active at a time.",
		"Use it for lists people move through with the arrow keys.",
		"Return the highlight to the current choice when the pointer leaves.",
	],
	dont: [
		"Use it where several items can be selected at once.",
		"Move it on a timer or on scroll. It follows the active item only.",
	],
} satisfies DesignNotes
