import type { DesignNotes } from "."

export default {
	intro: "Switch between related views in the same place. Underlined tabs for page sections, pills for a small switcher.",
	do: [
		"Use tabs for peer views people switch between often.",
		"Keep labels short and the active tab unmistakable.",
		"Use the pill style inside a card or toolbar.",
	],
	dont: [
		"Use tabs for steps in order. Use a stepper.",
		"Use tabs as the main navigation between pages.",
	],
} satisfies DesignNotes
