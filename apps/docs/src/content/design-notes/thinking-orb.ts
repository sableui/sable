import type { DesignNotes } from "."

export default {
	intro: "Shows that an AI agent is working before there's anything to show. A more characterful spinner for the one wait that matters.",
	do: [
		"Keep to one orb on screen, on the active agent.",
		"Match the mode to the work: thinking, searching or connecting.",
		"Pair it with a short status line that names the phase.",
		"Use the small size inline and the large one standalone.",
	],
	dont: [
		"Put one on every row of a list.",
		"Use it when progress can be measured. Use a progress bar.",
	],
} satisfies DesignNotes
