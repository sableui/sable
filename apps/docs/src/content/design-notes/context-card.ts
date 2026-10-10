import type { DesignNotes } from "."

export default {
	intro: "A rich preview that appears when you hover or focus a link, like a profile or an edition summary.",
	do: [
		"Keep it read-only. The link it opens from is the action.",
		"Keep the content short: a name, a line or two, a few stats.",
	],
	dont: [
		"Put buttons or forms inside. Use a popover.",
		"Open it on click. That is a popover.",
	],
} satisfies DesignNotes
