import type { DesignNotes } from "."

export default {
	intro: "Round buttons for picking exactly one option from a short set that's all visible at once.",
	do: [
		"Show every option so people can compare them.",
		"Keep labels clear and distinct from each other.",
		"Give the group a question or heading.",
	],
	dont: [
		"Use it for several choices at once. Use checkboxes.",
		"Use a radio group with only one option.",
	],
} satisfies DesignNotes
