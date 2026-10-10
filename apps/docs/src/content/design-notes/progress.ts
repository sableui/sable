import type { DesignNotes } from "."

export default {
	intro: "A bar that shows how far along a task is, or that it's still working when you can't tell.",
	do: [
		"Show real progress when you can measure it.",
		"Add a label and value when people need context or the exact number.",
	],
	dont: [
		"Fake a percentage for a wait of unknown length. Use the pulsing bar or a spinner.",
		"Use it as a divider or a colored status bar.",
	],
} satisfies DesignNotes
