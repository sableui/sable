import type { BlockMeta } from "../lib/meta"

export const pricingTableBlockMeta: BlockMeta = {
	name: "PricingTableBlock",
	family: "Commerce",
	kind: "section",
	summary: "A three-tier pricing section: heading, a Monthly/Yearly ToggleGroup, and three equal-height plan cards with the recommended one outlined in primary and badged \"Most popular\".",
	intent:
		"Reach for this on a pricing page or the pricing band of a landing page, to compare plans side by side. A single plan on offer (an upgrade prompt, a paywall) is PricingCardBlock.",
	notes: [
		"One featured tier at most: it takes the primary button and a primary outline; the others take outline buttons so the recommendation is unmistakable.",
		"Cards stretch to the tallest one and push their buttons to the bottom, so the calls to action line up across the row.",
		"The yearly saving is stated in the toggle itself, where the choice is made. `onChoose` receives the tier id and the period showing.",
	],
	a11y: [
		"Each plan is an <article> with an h3 under the section's h2, so the tiers are navigable by heading.",
		"The ToggleGroup is labelled \"Billing period\"; prices update in place and stay in the reading order of each card.",
	],
}
