import type { BlockMeta } from "../lib/meta"

export const pricingCardBlockMeta: BlockMeta = {
	name: "PricingCardBlock",
	family: "Commerce",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A single-plan pricing card: a Monthly/Yearly ToggleGroup, the price and billing note, a checked feature list, and one full-width call to action.",
	intent:
		"Reach for this when one plan is on offer — an upgrade prompt, a paywall, a plan summary in billing settings. Comparing several tiers side by side is a pricing table, not three of these.",
	notes: [
		"The period switch is a ToggleGroup (a segmented control), not Tabs: it changes a value in place rather than showing another panel.",
		"The price is a heading tier because it is the card's headline; its unit and billing note sit beside and below it in muted body text.",
		"`onStart` receives the period showing, so checkout opens on the plan the person was looking at.",
	],
	a11y: [
		"The ToggleGroup carries aria-label=\"Billing period\"; each Toggle's text is its name.",
		"The check icons are decorative beside each feature's text.",
	],
}
