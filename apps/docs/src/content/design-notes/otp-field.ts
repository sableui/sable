import type { DesignNotes } from "."

export default {
	intro: "For short, fixed-length codes copied from somewhere else, like a text message or authenticator app. The slots show how long the code is.",
	do: [
		"Match the number of slots to the code's exact length.",
		"Label it and say where the code was sent.",
		"Split codes of six or more into groups.",
		"Keep a wrong code on screen next to the error.",
	],
	dont: [
		"Use it for passwords or anything typed from memory.",
		"Block pasting.",
	],
} satisfies DesignNotes
