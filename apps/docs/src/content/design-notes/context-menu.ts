import type { DesignNotes } from "."

export default {
	intro: "A right-click menu for actions on the thing under the pointer: rename, duplicate, move, delete.",
	do: [
		"Keep it to secondary actions for that object.",
		"Set destructive or rare actions apart from everyday ones, and mark destructive ones as destructive items.",
	],
	dont: [
		"Make it the only way to reach an important action.",
		"Rely on it on touch screens. Offer a visible route too.",
	],
} satisfies DesignNotes
