import type { DesignNotes } from "."

export default {
	intro: "The wrapper for form fields: each control gets its label, helper text and error message in one consistent layout.",
	do: [
		"Give every field a visible label.",
		"Show errors under the field they belong to.",
		"Let the form check required and formatted fields when someone presses submit, so the message lands under the field and the cursor goes back to it.",
		"Put the control before the label only for a single checkbox, switch or radio.",
	],
	dont: [
		"Use placeholder text as the only label.",
		"Group several controls under one label.",
	],
} satisfies DesignNotes
