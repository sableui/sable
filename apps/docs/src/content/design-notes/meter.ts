import type { DesignNotes } from "."

export default {
	intro: "A bar or ring showing how full something is against a known limit, like storage, seats, quota or a score.",
	do: [
		"Label it and show the number in real units, like \"7.2 of 10 GB\".",
		"Shift the color near and at the limit, the same way across the page.",
		"Say the state in words too when it matters, like \"Almost full\".",
		"Show the number alongside a ring, and use the same thresholds when several sit together.",
	],
	dont: [
		"Use it for a task in progress, like an upload. Use a progress bar.",
		"Use it for a count with no real maximum, like followers.",
	],
} satisfies DesignNotes
