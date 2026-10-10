import type { DesignNotes } from "."

export default {
	intro: "Shows a keyboard key or shortcut in help text, menus and docs.",
	do: [
		"Use it only for real keys, like Esc or Enter.",
		"Separate the keys of a shortcut so each one reads clearly.",
		"Match the modifier key to the person's platform.",
	],
	dont: [
		"Use it as a decorative badge or a button.",
	],
} satisfies DesignNotes
