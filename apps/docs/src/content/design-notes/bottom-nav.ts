import type { DesignNotes } from "."

export default {
	intro: "A tab bar along the bottom of a phone screen for the app's three to five main sections.",
	do: [
		"Keep it to the destinations people switch between often.",
		"Show labels when the icons alone aren't obvious.",
		"Mark the current section as active.",
	],
	dont: [
		"Use it for actions like save or share. That's a toolbar.",
		"Add more than five items. Put the rest behind a \"More\" tab.",
		"Use it on desktop or for drilling into nested pages.",
	],
} satisfies DesignNotes
