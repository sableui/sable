import type { DesignNotes } from "."

export default {
	intro: "A single-line text field for short answers: names, emails, passwords, search.",
	do: [
		"Give every field a visible label.",
		"Show an error state with a message when validation fails.",
		"Keep field text at 16px or larger on phones.",
	],
	dont: [
		"Use placeholder text as the label. It vanishes once someone types.",
		"Use it for long text. Use a textarea.",
	],
} satisfies DesignNotes
