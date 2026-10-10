import type { DesignNotes } from "."

export default {
	intro: "Pick one value from a short, known list. Use a combobox when people need to search, or radios when every option should stay visible.",
	do: [
		"Write clear, distinct option labels.",
		"Group long lists under short labels.",
		"Give it a label, help text and errors when it sits in a form.",
	],
	dont: [
		"Use it for huge lists people would rather search.",
		"Use it for on/off settings. Use a switch or checkbox.",
	],
} satisfies DesignNotes
