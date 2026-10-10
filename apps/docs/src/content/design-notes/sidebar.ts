import type { DesignNotes } from "."

export default {
	intro: "The persistent side rail for an app's main destinations on desktop. It can shrink to icons.",
	do: [
		"Use it for destinations that stay put while the content changes.",
		"Keep labels predictable and make the current page obvious.",
	],
	dont: [
		"Use it for page-level filters, settings or temporary actions.",
		"Put page content in it. It sits outside the content area.",
	],
} satisfies DesignNotes
