import type { DesignNotes } from "."

export default {
	intro: "A checkbox with the weight of a card: title, optional description and icon. For a few options people pick several of and need to compare.",
	do: [
		"Use it for a short set where details help people choose.",
		"Show the checked state across the whole card.",
	],
	dont: [
		"Use it for long lists. Use checkbox rows or a combobox that allows several picks.",
		"Put a link or button inside the card.",
	],
} satisfies DesignNotes
