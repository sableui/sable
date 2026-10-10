import type { DesignNotes } from "."

export default {
	intro: "A compact number field for tool panels. Drag its icon or letter to change the value.",
	do: [
		"Give it an icon or a letter when it stands alone.",
		"Show the unit, like % or px, after the number.",
		"Match its precision to what the value really needs.",
	],
	dont: [
		"Use it in a regular page form. Use the number field.",
		"Pair it with a slider and an icon. That's two drag handles.",
	],
} satisfies DesignNotes
