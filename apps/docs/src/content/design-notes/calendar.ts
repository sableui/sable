import type { DesignNotes } from "."

export default {
	intro: "A month grid for picking a date or a range, when where a date falls in the week matters.",
	do: [
		"Use it when people compare weekdays, ranges or nearby dates.",
		"Show today, the selection and unavailable days clearly.",
	],
	dont: [
		"Make it the only way to enter a date. Pair it with a text field.",
		"Use it where a compact date picker would be faster.",
	],
} satisfies DesignNotes
