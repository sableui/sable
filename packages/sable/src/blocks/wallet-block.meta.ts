import type { BlockMeta } from "../lib/meta"

export const walletBlockMeta: BlockMeta = {
	name: "WalletBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A balance card: the balance in the metric mono tier, Send and Receive as an equal pair, and recent activity as Entity rows with signed amounts.",
	intent:
		"Reach for this for an account balance, store credit or credits summary with its latest movements. For a full transaction history with filters, use a DataTable.",
	notes: [
		"The balance is CardTitle at `text-mono-xl` — tabular figures, never a heading tier — under its label as CardDescription.",
		"Send is primary and Receive secondary, side by side at equal width: two directions of one action, with sending the riskier and more frequent.",
		"Incoming amounts are `text-success`; outgoing stay muted rather than red, because a payout or refund is not an error.",
	],
	a11y: [
		"Each activity row's leading swatch is aria-hidden; the title and detail carry the meaning.",
		"Amounts keep their sign in text (+49.00 / -850.00), so the direction does not depend on colour.",
	],
}
