import type { PatternMeta } from "../lib/meta"

export const listDetailPageMeta: PatternMeta = {
	name: "ListDetailPage",
	summary:
		"Searchable list beside the selected record's detail: interactive Entity rows in a CardList (5 of 12 columns) and a sticky detail pane (7) with an editable field, a label/value list, record actions with a destructive confirmation, and recent activity. Below lg it becomes a drill-in.",
	intent:
		"Reach for this when a route lists records AND works on one at a time (members + member, inbox + message, orders + order). For pure browsing with no selection, a single-column FeedPage or a DashboardPage table is simpler.",
	notes: [
		"Region cap is `wide`; Columns 12 → Col 5 (list) + Col 7 (detail). Below lg the list and detail share one column as a drill-in: selecting a row shows the detail with an `All members` back button (lg:hidden), and the back button returns to the list. The panes swap with `max-lg:hidden`, so desktop always shows both.",
		"Rows are interactive Entity inside one Card + CardList. Selection is Entity `selected`; `sable-surface` on the list card makes its selected step 12% ink off the card, so a selected row stays distinct from its muted avatar.",
		"Search filters the list in place (name, email, role). No matches swap the CardList for an EmptyState with a Clear search action; the selected detail stays open.",
		"A pending invite lives in the same list: a mail glyph in the Avatar, an `Invited` Badge, and an invite-specific detail (role on joining, sent, expires, invited by; Resend and Revoke actions).",
		"The role Select edits the record in place; its Field description states what the role can do. The owner's role is read-only and the owner has no remove action.",
		"Read-only facts are a native `<dl className=\"sable-list-dl sable-list-dl-2\">` inside an `@container`, so pairs go two-up only when the pane is wide enough.",
		"Remove / revoke run through DestructiveActionModal; on confirm the next row is selected. Page-level counts (members, pending, seats) live in the PageHeader description and update with the list.",
		"The detail pane is sticky (lg:top-6) so it stays in view while a long list scrolls.",
	],
	a11y: [
		"Each row is a real button (Entity `interactive` + `onSelect`): Tab moves through rows, Enter/Space selects. The selected row is Entity `selected`, which paints the selected fill and sets aria-current; list avatars are aria-hidden so initials are not read before the name.",
		"The detail pane is a labelled region (`Member details`) whose title is a level-2 heading.",
		"On a phone, drilling in moves focus to the back button; going back returns focus to the row that was open. After a remove, focus lands on the newly selected row; after Clear search, on the search field.",
	],
}
