import type { DesignNotes } from "."

export default {
	intro: "A single line of status with an icon, placed right next to what it describes.",
	do: [
		"Keep the message short.",
		"Place it beside the input, row, or action it's about.",
		"Use a spinner in place of the icon for something in progress.",
	],
	dont: [
		"Use it for page-wide announcements or alerts.",
		"Hide the icon. Color alone doesn't carry the meaning.",
	],
} satisfies DesignNotes
