import type { DesignNotes } from "."

export default {
	intro: "A field for real numbers, like quantities or percentages, with buttons to step up and down.",
	do: [
		"Set sensible limits and step sizes when the value has bounds.",
		"Format the number as currency or a percent when that's what it is.",
	],
	dont: [
		"Use it for phone numbers, ZIP codes or card numbers.",
		"Keep the step buttons in a tight property panel. Hide them there.",
	],
} satisfies DesignNotes
