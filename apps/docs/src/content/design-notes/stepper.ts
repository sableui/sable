import type { DesignNotes } from "."

export default {
	intro: "Shows where someone is in a short flow with named steps, like checkout or onboarding.",
	do: [
		"Name each step with a word or two.",
		"Go vertical when steps need a description or there are more than five.",
		"Use the dot style for a timeline of events, each with a title and time.",
		"Let people go back to finished steps only if editing them works.",
	],
	dont: [
		"Use it for tasks of unknown length or a percentage. Use a progress bar.",
		"Use it for sections people can visit in any order. Use tabs.",
		"Make upcoming steps clickable to skip ahead.",
	],
} satisfies DesignNotes
