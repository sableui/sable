import type { BlockMeta } from "../lib/meta"

export const trafficSourcesBlockMeta: BlockMeta = {
	name: "TrafficSourcesBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "A share card: a donut PieChart of where a total comes from, the total in the hole, a legend, and the headline share in words in the footer.",
	intent:
		"Reach for this for a split of one total into four or fewer parts — traffic sources, revenue by plan, tickets by channel. More parts, or values to compare exactly, belong in a horizontal BarChart.",
	notes: [
		"The total sits in the donut's hole, so the card answers \"how many\" and \"from where\" at once.",
		"The footer puts the biggest share in a sentence — the takeaway does not depend on reading the slices.",
		"The slices sweep in clockwise as the card scrolls into view.",
	],
	a11y: [
		"The chart's data table lists every source and its count; the legend repeats it visually.",
		"Hovering or arrowing through the slices pulls each out and announces it.",
	],
}
