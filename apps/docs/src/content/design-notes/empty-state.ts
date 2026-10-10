import type { DesignNotes } from "."

export default {
	intro: "What shows when a list or area has nothing in it yet, or a page or region failed to load: a short message and a way forward.",
	do: [
		"Name what's empty in plain words, like \"No posts yet\".",
		"Offer one next step when there is one.",
		"For an empty search, repeat the query and offer to clear filters.",
		"For a failed load, offer one recovery action, like \"Retry\" or \"Go home\".",
	],
	dont: [
		"Write \"No data\". It helps no one.",
		"Put anything people need later here. It vanishes once content exists.",
		"Use it for an error inside a working page. Use a banner or an inline message.",
		"Show a raw error message or stack trace.",
	],
} satisfies DesignNotes
