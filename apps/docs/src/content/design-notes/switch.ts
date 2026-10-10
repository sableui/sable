import type { DesignNotes } from "."

export default {
	intro: "An on/off control for settings that take effect right away.",
	do: [
		"Label it with what turns on.",
		"Make the change visible as soon as it's flipped.",
	],
	dont: [
		"Use it for choices that only apply on submit, or for agreeing to terms. Use a checkbox.",
		"Write the label as a negative, like \"Don't send receipts\".",
	],
} satisfies DesignNotes
