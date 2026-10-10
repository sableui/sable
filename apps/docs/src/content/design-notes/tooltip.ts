import type { DesignNotes } from "."

export default {
	intro: "A brief hint that appears on hover or focus, for naming an icon button or clarifying something compact.",
	do: [
		"Use it to name icon-only buttons.",
		"Keep it short, and don't put anything clickable in it.",
	],
	dont: [
		"Hide errors, key instructions or anything essential in a tooltip.",
		"Rely on it as the only name for an icon button.",
	],
} satisfies DesignNotes
