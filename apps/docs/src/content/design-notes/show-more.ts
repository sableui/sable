import type { DesignNotes } from "."

export default {
	intro: "Shows a short preview of long content, with a toggle to reveal the rest.",
	do: [
		"Use it when the preview is useful on its own and the rest is optional.",
		"Let people collapse it again.",
	],
	dont: [
		"Hide required steps, warnings or main actions behind it.",
		"Put it on a card or tinted surface. The fade is made for the page background.",
	],
} satisfies DesignNotes
