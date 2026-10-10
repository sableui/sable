import type { DesignNotes } from "."

export default {
	intro: "The heading at the top of a page: title, a short description and the page's own actions.",
	do: [
		"Use one per page.",
		"Keep the title literal. Explain in the description.",
		"Align it with the content it introduces.",
	],
	dont: [
		"Use it inside cards, dialogs or small panels.",
		"Put app-wide actions like search or account in it. Those go in the app header.",
	],
} satisfies DesignNotes
