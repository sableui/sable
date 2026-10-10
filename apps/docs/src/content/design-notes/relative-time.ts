import type { DesignNotes } from "."

export default {
	intro: "Shows when something happened in plain words, like \"3 minutes ago\". Hover for the exact time.",
	do: [
		"Use it in feeds, comments and activity streams.",
		"Make the exact time easy to reach when precision matters.",
	],
	dont: [
		"Use it as the only date on billing, legal or audit records.",
	],
} satisfies DesignNotes
