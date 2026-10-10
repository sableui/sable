import type { DesignNotes } from "."

export default {
	intro: "A button that stays pressed, for quick modes like bold, pin or preview. Group them for view switches.",
	do: [
		"Make the pressed state easy to see.",
		"Give icon-only toggles a name for screen readers.",
	],
	dont: [
		"Use it for lasting settings. Use a switch.",
	],
} satisfies DesignNotes
