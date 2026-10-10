import type { DesignNotes } from "."

export default {
	intro: "The message box at the bottom of a chat. Files, text and controls share one surface.",
	do: [
		"Offer a stop control while a reply is streaming.",
		"Show pending files as chips inside the composer, above the text.",
		"Put model pickers and tool toggles on the bottom row, beside attach.",
		"Use the compact density for a chat docked inside a tool.",
	],
	dont: [
		"Use it as a general multi-line field in a form. Use a textarea.",
		"Let it grow without limit. Long text should scroll.",
		"Resize its text to differ from the message bubbles.",
	],
} satisfies DesignNotes
