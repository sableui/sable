import type { BlockMeta } from "../lib/meta"

export const recentOrdersBlockMeta: BlockMeta = {
	name: "RecentOrdersBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "20rem", max: "48rem" },
	summary: "A data-table card for a dashboard: a flush DataTable of recent orders with sortable columns, status Badges and clickable rows, a status Select in the header, and a count with View all orders below.",
	intent:
		"Reach for this as the table tile on a dashboard: the latest few records, filtered and sorted in place, each opening its detail. A full history with paging and export is DataTable on its own page; a fixed billing history with downloads is InvoiceHistoryBlock.",
	notes: [
		"The table runs edge to edge (CardContent flush) and its outer columns still line up with the header; on a narrow screen it scrolls sideways inside the card.",
		"The filter is a Select in CardAction: one choice that changes the rows, where a row of Pills would crowd the header.",
		"Sorting is DataTable's own (Customer, Placed, Total), newest first on arrival.",
		"Placed is a RelativeTime, and the sample orders are timed from the page load.",
		"A filter with no matches shows DataTable's empty row, not an empty card.",
	],
	a11y: [
		"Status is text in a Badge; the dot only reinforces it.",
		"Rows open from the keyboard as well as by click (DataTable's row click), and sortable headers announce their direction.",
		"The filter Select is named \"Filter by status\".",
	],
}
