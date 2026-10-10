import type { DesignNotes } from "."

export default {
	intro: "Numbered pages with previous and next arrows, for results split into pages people move through.",
	do: [
		"Go back to page 1 when filters or search change the results.",
		"Keep the arrows visible but dimmed at the first and last page.",
		"Name each pager when a screen has more than one.",
	],
	dont: [
		"Paginate a short list that fits on one page.",
		"Use page numbers when they mean nothing. Use a \"Load more\" button.",
	],
} satisfies DesignNotes
