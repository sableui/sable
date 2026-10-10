import type { DesignNotes } from "."

export default {
	intro: "Rows and columns for structured data where every item has the same fields.",
	do: [
		"Give the table a caption and clear column headers.",
		"Keep cells short and easy to scan.",
		"Let wide tables scroll sideways instead of squeezing columns.",
		"Inside a card, let the table run edge to edge with flush card content.",
	],
	dont: [
		"Use it for items with different shapes. Use cards or a list.",
		"Put every action in every row. Use one action or a menu.",
	],
} satisfies DesignNotes
