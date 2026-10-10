import type { DesignNotes } from "."

export default {
	intro: "A sortable table built from rows of data. Rows can be clickable, and an empty state fills in when there's nothing to show.",
	do: [
		"Make only the columns sortable where order is obvious and useful.",
		"Pair long lists with pagination.",
		"Show a helpful empty state with a next step.",
	],
	dont: [
		"Make rows clickable and also fill them with competing buttons.",
		"Use it for mixed cards or timelines. A list scans better.",
	],
} satisfies DesignNotes
