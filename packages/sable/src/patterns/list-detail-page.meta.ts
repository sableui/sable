import type { PatternMeta } from "../lib/meta"

export const listDetailPageMeta: PatternMeta = {
	name: "ListDetailPage",
	summary:
		"Two-column list-detail: a wide region split 8/4, the record list as Entity rows in the main column, and a sticky supporting rail (detail, filters, or summary) beside it.",
	intent:
		"Reach for this when a route lists records AND keeps one selected/summarized in view (members + member detail, inbox + message, orders + order). For pure browsing with no rail, a single-column FeedPage or DashboardPage table is simpler.",
	notes: [
		"Region cap is `wide`; the split is Columns 12 → Col 8 + Col 4, collapsing to stacked full-width columns below lg via breakpoint maps.",
		"List rows are Entity inside one bordered Card, in CardList: it insets each row to the card padding and divides them with hairlines — on a dark canvas rows need an anchoring surface, not a flat float.",
		"Pending records live in the same list, muted (muted title + `Invited` badge), instead of a separate section.",
		"The rail card holds label/value pairs as a Description list — muted terms, mono (tabular) values — plus one quiet action. Never hand-built `justify-between` rows.",
		"The rail is sticky (top on the 4px scale) so the summary stays in view while the list scrolls.",
	],
	a11y: [
		"Entity rows given `interactive` + `onSelect` (to open a member's detail) render as real buttons; keyboard focus follows list order. Rows here are presentational.",
		"The rail is an <aside> landmark; the list column is the main content.",
	],
}
