import type { DesignNotes } from "."

export default {
	intro: "A shimmering placeholder that holds the shape of content while it loads.",
	do: [
		"Match the size and rhythm of the content that's coming.",
		"Use it where a stable layout matters while loading.",
	],
	dont: [
		"Use a shape that differs from the real content. The jump is worse than a spinner.",
		"Leave it showing after an error or an empty result.",
	],
} satisfies DesignNotes
