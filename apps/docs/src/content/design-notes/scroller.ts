import type { DesignNotes } from "."

export default {
	intro: "A contained scrolling area that fades its edges where there's more to see. Good for chip rows, media strips and long lists in a fixed space.",
	do: [
		"Use it for strips people expect to browse sideways.",
		"Make sure the overflow is easy to notice.",
		"Give it a short name for what it holds, like \"Tags\".",
	],
	dont: [
		"Hide main layout or required controls inside it.",
		"Use it to hide content that overflowed by accident.",
	],
} satisfies DesignNotes
