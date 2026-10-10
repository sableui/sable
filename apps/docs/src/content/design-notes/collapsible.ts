import type { DesignNotes } from "."

export default {
	intro: "Hides one piece of optional content until someone asks for it. Good for extra detail or advanced settings.",
	do: [
		"Label the trigger with what is hidden, like \"Shipping details\".",
		"Use it for secondary detail people can skip.",
	],
	dont: [
		"Use it for several sections or navigation. Use an accordion or tabs.",
	],
} satisfies DesignNotes
