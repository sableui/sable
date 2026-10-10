import type { DesignNotes } from "."

export default {
	intro: "A bounded surface for one discrete thing: a product, a notification, a metric, a setting group.",
	do: [
		"Use a card when the item could be moved, removed or compared on its own.",
		"Keep sibling cards at the same density so grids scan cleanly.",
		"List people or items in a card list: rows run to the card's edges, divided, lined up with the title.",
		"Let a table run edge to edge with flush content. Its outer columns line up with the card's padding.",
		"Make the whole card the link when it goes one place and holds nothing else clickable.",
	],
	dont: [
		"Wrap every page section in a card. Spacing and headings often do it better.",
		"Nest cards inside cards.",
		"Pad table cells or list rows by hand to line them up with the card. The card list and flush content do it at every density.",
		"Make a card a link when it has its own buttons or links inside. Link the title instead.",
	],
} satisfies DesignNotes
