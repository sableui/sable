import type { DesignNotes } from "."

export default {
	intro: "A short list of actions that opens from a button. For commands that don't need to be on screen all the time.",
	do: [
		"Use it for secondary or grouped actions.",
		"Write item labels as short, scannable actions.",
		"Mark delete and other actions that can't be undone as destructive items, so they stay red when highlighted.",
	],
	dont: [
		"Put forms, navigation or rich content inside.",
		"Use it to pick a value. Use a select.",
		"Colour an item red yourself. Use the destructive item.",
	],
} satisfies DesignNotes
