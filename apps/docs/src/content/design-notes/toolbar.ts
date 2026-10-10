import type { DesignNotes } from "."

export default {
	intro: "A row of related tools that keyboard users cross with the arrow keys instead of tabbing through each one. Use it for editor bars, canvas tools and table actions.",
	do: [
		"Name the toolbar and every icon-only button.",
		"Split long rows into groups with a separator.",
		"Keep one button size across the row.",
	],
	dont: [
		"Wrap one or two buttons, or a dialog's Cancel and Confirm. A plain button row is right.",
		"Use it to move between pages. That is tabs or navigation.",
	],
} satisfies DesignNotes
