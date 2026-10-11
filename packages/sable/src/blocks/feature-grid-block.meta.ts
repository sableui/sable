import type { BlockMeta } from "../lib/meta"

export const featureGridBlockMeta: BlockMeta = {
	name: "FeatureGridBlock",
	family: "Marketing",
	kind: "section",
	summary: "A feature section: an overline, an h2 and a lede over a grid of article cards, each with an icon in a well, a title and one sentence — 1, 2 then 3 columns.",
	intent:
		"Reach for this to explain what a product does in six or fewer points. For a sequence (first this, then that), use StepsBlock; for one proof point with numbers, TestimonialBlock.",
	notes: [
		"Copied from the LandingPage page shell's features section.",
		"Six features fill 3 × 2 evenly; keep the count a multiple of three, or drop to cols={{ lg: 2 }}.",
		"Each body is one sentence. A feature that needs a paragraph needs its own section.",
		"Icons sit in a `sable-well`, which derives its fill from the card surface it is on.",
	],
	a11y: [
		"Each feature is an <article> with an h3 under the section's h2.",
		"The icons are decorative; each title says what the feature is.",
	],
}
