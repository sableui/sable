import type { DesignNotes } from "."

export default {
	intro: "An endless, slow-scrolling strip for ambient content like logos or tags.",
	do: [
		"Use it for low-priority, repeated content like logos or short labels.",
		"Make sure the page still makes sense when motion is turned off.",
	],
	dont: [
		"Put anything that must be read, clicked, or acted on inside it.",
	],
} satisfies DesignNotes
