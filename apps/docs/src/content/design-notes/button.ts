import type { DesignNotes } from "."

export default {
	intro: "For actions: save, submit, confirm, open. The variant sets how loud it is.",
	do: [
		"Use one primary button per area so the main action is obvious.",
		"Label with a verb: \"Save changes\", not \"OK\".",
		"Show the loading state while work is in progress.",
		"On a coloured band or brand panel, use the on-color variants. They take the band's own ink.",
	],
	dont: [
		"Use destructive for anything easy to undo.",
		"Use a button just to go to another page. Use a link.",
		"Put a secondary button on a tinted surface. Use outline or ghost.",
		"Use the on-color variants on the page or a card. They are for coloured fills only.",
		"Restyle a button with your own colours, corners or shadows. Use a variant: on-color on a band, floating for a control over content.",
	],
} satisfies DesignNotes
