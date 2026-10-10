import type { DesignNotes } from "."

export default {
	intro: "A callout that sits next to the content it qualifies: a tip, a caveat, a warning in a form or dialog.",
	do: [
		"Keep it calm and short so it doesn't outshout the main content.",
		"Give it one remedy when the reader can fix the problem.",
		"Pick a note over a banner inside a dialog, form or section.",
	],
	dont: [
		"Use it for state the whole app is in. Use a banner.",
		"Give it two actions. A choice belongs in a dialog.",
		"Stack several in a row. If everything is called out, nothing is.",
	],
} satisfies DesignNotes
