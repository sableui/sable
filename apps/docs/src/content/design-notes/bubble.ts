import type { DesignNotes } from "."

export default {
	intro: "The surface a chat message sits on. Its color says who is speaking.",
	do: [
		"Use muted for the other person and primary for your own messages.",
		"Drop the box for long answers with code, lists or tables.",
		"Show the tail only on the first message in a run.",
	],
	dont: [
		"Stretch bubbles across a wide window. Keep the reading width.",
		"Put the name or time inside the bubble.",
		"Use a bubble for system notes or status. Use a marker.",
	],
} satisfies DesignNotes
