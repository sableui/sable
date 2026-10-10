import type { DesignNotes } from "."

export default {
	intro: "A browser window frame for showing a website or product screen as a picture.",
	do: [
		"Use it for previews and marketing shots where the page context matters.",
		"Keep the framed content simple enough to read at its size.",
	],
	dont: [
		"Wrap real, working UI in it.",
		"Put a real URL in the address pill. It looks clickable but isn't.",
	],
} satisfies DesignNotes
