import type { DesignNotes } from "."

export default {
	intro: "Names a form field. Clicking it focuses the field.",
	do: [
		"Give every field a visible label that stays put.",
		"Keep it short. Put help text underneath, or in a hint.",
		"Use the smallest size as an eyebrow, not just smaller text.",
	],
	dont: [
		"Rely on placeholder text as the only label.",
		"Use it as plain styled text with no field attached.",
	],
} satisfies DesignNotes
