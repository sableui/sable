import type { DesignNotes } from "."

export default {
	intro: "Picks a date, or a date and a time, from a compact button that opens a calendar. Use it where typing a date is error-prone.",
	do: [
		"Show which days can't be picked when date rules apply.",
		"Let the button show the full, written-out date once chosen.",
		"With a time, say which time zone it is in, and use minute steps that match how precise it needs to be.",
	],
	dont: [
				"Show a bare numeric date like 03/04 that reads differently by locale.",
		"Use it for a date people know by heart, like a birthday. Let them type it.",
	],
} satisfies DesignNotes
