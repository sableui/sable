import type { BlockMeta } from "../lib/meta"

export const invoiceHistoryBlockMeta: BlockMeta = {
	name: "InvoiceHistoryBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "20rem", max: "42rem" },
	summary: "A billing history card: a flush Table of date, plan, amount and status per invoice, with a download button on each row.",
	intent:
		"Reach for this in billing settings, under the current plan. For a long, filterable history (hundreds of rows, date ranges, export), use DataTable on its own page.",
	notes: [
		"The table runs edge to edge (CardContent flush); its first and last columns still line up with the card header's padding.",
		"Amounts are a numeric column — right-aligned with tabular figures — so they compare by eye.",
		"On a narrow screen the table scrolls sideways inside the card (with a quiet scrollbar) rather than squeezing its columns.",
	],
	a11y: [
		"The download column has a screen-reader-only header, and each button names its invoice (\"Download INV-0042\").",
		"Status is text in a Badge; the dot's colour only reinforces it.",
	],
}
