import type { DesignNotes } from "."

export default {
	intro: "A Cmd+K palette for jumping to places and running actions by typing. Fast and curated, not a home for every option.",
	do: [
		"Group commands by task, like Navigation or Create.",
		"Write labels as actions that are easy to search for.",
		"Show useful commands before anyone types.",
		"Keep unavailable commands listed, with the reason why.",
		"Open it from a header search with the Command Menu trigger, which brings ⌘K along.",
		"Set it into the page with the inline panel when the palette belongs there, like a sidebar launcher or a settings search.",
	],
	dont: [
		"Use it in place of an ordinary dropdown.",
		"Dump every route and action into one long list.",
		"Dress a plain button up as a search field to open it.",
		"Build a palette look-alike out of a search icon and a list of buttons.",
	],
} satisfies DesignNotes
