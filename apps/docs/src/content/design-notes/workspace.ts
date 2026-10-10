import type { DesignNotes } from "."

export default {
	intro: "The frame for a tool, like an editor or console: fixed to the window, with panels that scroll on their own.",
	do: [
		"Keep the work surface in the middle with panels as side chrome.",
		"Let each panel scroll on its own. The frame itself never scrolls.",
		"Keep the compact density unless there's a real reason not to.",
	],
	dont: [
		"Use it for a page people read top to bottom. Use the app shell.",
		"Put cards inside panels. Use panel sections.",
	],
} satisfies DesignNotes
