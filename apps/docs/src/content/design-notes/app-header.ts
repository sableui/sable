import type { DesignNotes } from "."

export default {
	intro: "The mobile top bar: a leading control, a centered title, and a few actions. It stays put while the screen scrolls.",
	do: [
		"Use one per app, as chrome rather than page content.",
		"Keep actions few so the title stays readable.",
		"Give an icon-only back button a clear label.",
	],
	dont: [
		"Fill it with filters, forms or page-specific controls.",
		"Stack a second header inside a screen.",
	],
} satisfies DesignNotes
