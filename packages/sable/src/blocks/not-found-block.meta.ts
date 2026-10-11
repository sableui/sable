import type { BlockMeta } from "../lib/meta"

export const notFoundBlockMeta: BlockMeta = {
	name: "NotFoundBlock",
	family: "System",
	kind: "section",
	summary: "A not-found page body: the status code in mono, a plain-language h1, what probably happened, and two ways on — home and search.",
	intent:
		"Reach for this as the body of a 404 route. An empty list or a search with no results inside a working page is EmptyState, not this.",
	notes: [
		"The heading says what happened in words; the code is a small mono label for people who look for it.",
		"Two ways on, one primary. Never a dead end with only the browser's back button.",
		"Capped at the `form` region width, so the short message stays a tight, centred column.",
	],
	a11y: [
		"It renders the page's h1 — use it as the route's main content, inside <main>.",
		"Both actions are links styled as Buttons, because they navigate.",
	],
}
