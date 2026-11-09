import type { BlockMeta } from "../lib/meta"
export const invoicePreviewBlockMeta: BlockMeta = {
	name: "InvoicePreviewBlock", family: "Commerce", kind: "card", width: { min: "18rem", max: "20rem" },
	summary: "A draft invoice with a discount, a rolling amount due, and sending feedback inside its one button.",
	intent: "A copyable reference for a total that changes and feedback that stays in the action. Replace the one-second stand-in with the real request when integrating billing.",
	notes: [
		"NumberTicker rolls the amount due; TextSwap changes the button's label in place; Button owns the spinner and busy state.",
		"The discount Switch applies at once, with the deduction on the same row so the line items reconcile with the amount due.",
		"The status Badge moves from Draft to Sent. Changing the discount returns the invoice to draft; pressing Sent sends it again.",
	],
	a11y: [
		"The button keeps focus through sending and sent, exposes its busy state, and announces its new label; TextSwap's visual copies are hidden.",
		"The discount is locked only while sending.",
	],
}
