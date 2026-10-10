import type { DesignNotes } from "."

export default {
	intro: "A modal for focused decisions, short forms and confirmations. It blocks the page until it's dealt with.",
	do: [
		"Always give it a title, and usually a line of context.",
		"Offer a clear way out next to the main action.",
		"In a delete confirm, say exactly what will happen.",
		"Go full screen for an image, video or gallery that needs more room than the layout gives it.",
	],
	dont: [
		"Fit a long, multi-step task in it. Use a sheet or a page.",
		"Open one just to report status. Use a toast or banner.",
		"Open a full-screen view of an image already shown at a useful size.",
	],
} satisfies DesignNotes
