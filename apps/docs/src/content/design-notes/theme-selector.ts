import type { DesignNotes } from "."

export default {
	intro: "A picker for the design theme, shown as swatch cards on a settings page or compact rows in a panel.",
	do: [
		"Use the list layout in popovers, menus, and docked panels.",
		"Preview themes in the light or dark mode actually in use.",
	],
	dont: [
		"Use it for light, dark, or system mode. That's the theme switcher.",
		"Put the cards in tool chrome. They clip in narrow spaces.",
	],
} satisfies DesignNotes
