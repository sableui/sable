import type { DesignNotes } from "."

export default {
	intro: "A small popover for quick reactions: a rating and an optional note.",
	do: [
		"Ask when people have enough context to answer.",
		"Keep the prompt short.",
		"Let a rating alone be enough to send.",
	],
	dont: [
		"Make the written note required.",
		"Use it for errors, alerts or support requests.",
	],
} satisfies DesignNotes
