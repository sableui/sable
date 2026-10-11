import type { BlockMeta } from "../lib/meta"

export const orderTrackingBlockMeta: BlockMeta = {
	name: "OrderTrackingBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "An order status card: order number, item and a status Badge in the header over a vertical dot Stepper of delivery milestones.",
	intent:
		"Reach for this for anything that moves through known stages — a delivery, an application, a review, a deployment. For an open-ended activity log, use a list of Entity rows with timestamps instead.",
	notes: [
		"The Stepper's `current` is the step under way; finished steps show their timestamp and future steps show none.",
		"The status Badge restates the current stage in one word so the card scans without reading the steps.",
	],
	a11y: [
		"The Stepper is labelled \"Delivery status\" and marks the current step for assistive tech.",
		"The Badge's tone is backed by its text; colour alone never carries the status.",
	],
}
