import type { DesignNotes } from "."

export default {
	intro: "A compact row that identifies a person, project, file or other thing, with an optional action at the end.",
	do: [
		"Use a clear title and one short line of detail.",
		"Add an avatar, badge or status when identity needs it.",
		"Stack rows directly for a list on a page. Inside a card, use a card list, which divides them and lines them up with the card.",
	],
	dont: [
		"Use it for long descriptions, editable fields or full card content.",
		"Make the whole row a link when it also has an action.",
	],
} satisfies DesignNotes
