import type { DesignNotes } from "."

export default {
	intro: "The thin strip at the bottom of a tool workspace. It quietly reports facts about the document: size, counts, save state.",
	do: [
		"Put document facts here so panels don't fight over them.",
		"Pin the trailing group, like save state, to the right edge.",
		"Keep numbers in fixed-width figures so the strip doesn't jitter.",
	],
	dont: [
		"Make it the only way to do something. It's glanced at, not used.",
		"Put zoom here. Keep it near the canvas it acts on.",
		"Use it for one-off feedback like \"Saved!\". That's a toast.",
	],
} satisfies DesignNotes
