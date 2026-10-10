import type { DesignNotes } from "."

export default {
	intro: "A hierarchy you browse by keyboard or pointer: a layers or outline panel, or a folder structure. Every row lines up on one shared grid, so nesting stays readable.",
	do: [
		"Put row controls like visibility on the right, shown on hover.",
		"Name what an add row adds: \"Add effect\", not \"Add\".",
		"Keep empty sections to one short line and one action.",
		"Use folder and file icons in a file listing, and keep the selected file consistent with the page.",
	],
	dont: [
		"Put the visibility toggle before the name.",
		"Use the page-size empty state inside a panel.",
		"Use it for flat lists or plain navigation.",
	],
} satisfies DesignNotes
