import type { DesignNotes } from "."

export default {
	intro: "A brief note that pops in after someone does something: saved, copied, failed, undone.",
	do: [
		"Keep it short and say what happened.",
		"Add an action only when it's useful right now, like Undo.",
		"Update one toast as a task moves along, from loading to done.",
	],
	dont: [
		"Use it for blockers or outages. Use a banner or dialog.",
		"Let the only way to undo something vanish on a timer.",
	],
} satisfies DesignNotes
