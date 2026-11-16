import type { BlockMeta } from "../lib/meta"

export const searchBlockMeta: BlockMeta = {
	name: "SearchBlock",
	family: "Navigation",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "Search with its three answers: a SearchInput and Pill filters over a list that shows Skeleton rows while it works, Entity results with the match highlighted, or an EmptyState with a way out.",
	intent:
		"Reach for this as a search panel that stays on the page — a sidebar, a popover, the top of a list. Search that opens over the app from a shortcut and runs commands is CommandPaletteBlock; filtering rows already on screen needs only SearchInput.",
	notes: [
		"The list area has one height for results, loading and empty, so the card never jumps while someone types.",
		"With nothing typed it shows recent items instead of an empty box.",
		"Loading is Skeleton rows in the shape of a result, plus a Spinner in the status line that later carries the count.",
		"The typed text is painted in each title with useMatchHighlight: no <mark> elements, and the accessible name is unchanged.",
		"The empty state names what was searched and offers one action that clears both the text and the filter. It is named apart from the field's own clear button.",
		"The timer stands in for a request. Each change restarts it, which is the debounce.",
	],
	a11y: [
		"The field has an accessible name, and the Pills are toggle buttons with aria-pressed.",
		"The status line is a live region: it announces searching, then the number of results.",
		"Each result is one button covering its row. The skeleton rows are hidden from assistive technology.",
	],
}
