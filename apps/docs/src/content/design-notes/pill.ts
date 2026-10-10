import type { DesignNotes } from "."

export default {
	intro: "A small rounded chip people press to turn a filter or choice on and off.",
	do: [
		"Keep the text short and easy to scan.",
		"Show clearly which pills are on.",
		"Use the outline look for quiet chips under other content, like reactions or tags, and the small size in tight rows.",
	],
	dont: [
		"Use it for main actions or important system status.",
		"Use it for a label that does nothing when pressed. Use a badge.",
	],
} satisfies DesignNotes
