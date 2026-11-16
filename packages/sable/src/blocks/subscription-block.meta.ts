import type { BlockMeta } from "../lib/meta"

export const subscriptionBlockMeta: BlockMeta = {
	name: "SubscriptionBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "20rem", max: "24rem" },
	summary: "The current plan in billing settings: its name and state as a Badge, the price, a Meter of seats used, the payment method as an Entity with Update, and Change plan beside a two-press Cancel plan that can be taken back.",
	intent:
		"Reach for this at the top of billing settings, above InvoiceHistoryBlock. Choosing a plan for the first time is PricingTableBlock or PricingCardBlock; deleting the whole account is DangerZoneBlock.",
	notes: [
		"The renewal date is in the description, and after a cancel it becomes the end date: a cancelled plan stays active until then, and the Badge says \"Cancelling\", not \"Cancelled\".",
		"Cancel plan is a ConfirmButton (two presses) rather than a dialog, because nothing ends at once and Keep my plan undoes it until the period runs out. Use DestructiveActionModal when cancelling ends access immediately.",
		"Seats are a level against a limit, so they are a Meter, not a Progress bar.",
		"The payment method is an Entity whose leading mark is an IconTile, the same row shape as a session or an integration.",
		"Change plan is the outline action and the cancel is ghost: neither is the page's primary, and cancelling must not look like the suggested path.",
	],
	a11y: [
		"The plan's state is text in a Badge; the dot only reinforces it.",
		"A status region mounted from the start announces the cancellation and the date the plan ends.",
		"The Update button is named \"Update payment method\", so it makes sense out of its row.",
	],
}
