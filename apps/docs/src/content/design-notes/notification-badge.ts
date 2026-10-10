import type { DesignNotes } from "."

export default {
	intro: "A small dot or number that says something new is waiting.",
	do: [
		"Pin it to the item that owns the notifications.",
		"Cap large numbers, like 99+, when the exact count doesn't matter.",
		"Use red only for alarming counts. Calmer tones suit the rest.",
	],
	dont: [
		"Show a bare dot when the number is what people act on.",
		"Use it as a status label or category marker.",
	],
} satisfies DesignNotes
