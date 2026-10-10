import type { DesignNotes } from "."

export default {
	intro: "Stacked sections that open and close in place. Good for FAQs and related details that keep the page scannable.",
	do: [
		"Write short headers that say what's inside.",
		"Keep each section's content focused and brief.",
	],
	dont: [
		"Hide required fields, main actions or errors inside a closed section.",
		"Put an accordion inside another accordion. Flatten it or use a tree.",
	],
} satisfies DesignNotes
