import type { DesignNotes } from "."

export default {
	intro: "A small spinning ring, or three dots, for short waits where progress can't be measured.",
	do: [
		"Use it in compact areas where the layout is already settled. In a button, turn on the button's loading state instead of adding a spinner yourself.",
		"Pair it with loading text when the nearby label isn't enough.",
		"Use the dots in a chat row or inline wait, where a ring looks like a stuck control.",
	],
	dont: [
		"Use it alone for long waits or full-page loading.",
		"Show a spinner with no name or status message for screen readers.",
	],
} satisfies DesignNotes
