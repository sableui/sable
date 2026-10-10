import type { DesignNotes } from "."

export default {
	intro: "A vertical list of links for moving between sections, such as settings or docs.",
	do: [
		"Group items into labelled sections when there's more than one area.",
		"Use the larger rows and sidebar style when it sits in app chrome.",
	],
	dont: [
		"Use it for bottom mobile navigation. Use the bottom nav.",
		"Mix content and sidebar active styles in one list.",
	],
} satisfies DesignNotes
