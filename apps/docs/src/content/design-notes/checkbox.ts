import type { DesignNotes } from "."

export default {
	intro: "For yes-or-no choices that stand alone, or for picking several options from a set.",
	do: [
		"Give every checkbox a visible label.",
		"Say what checking it turns on.",
		"Use the mixed state when only some items below it are checked.",
	],
	dont: [
		"Use checkboxes when only one option can be picked. Use radios.",
		"Write the label as a negative, like \"Don't send receipts\".",
	],
} satisfies DesignNotes
