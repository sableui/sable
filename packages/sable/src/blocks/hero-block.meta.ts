import type { BlockMeta } from "../lib/meta"

export const heroBlockMeta: BlockMeta = {
	name: "HeroBlock",
	family: "Marketing",
	kind: "section",
	summary: "A centred hero: an outline Badge eyebrow, the page's h1 at display size, a lede, a primary and an outline call to action, and an install command in a CodeBlock.",
	intent:
		"Reach for this to open a product or developer-tool landing page. A brand page that leads with a product scene beside the headline is the BrandLandingPage page shell's hero.",
	notes: [
		"Copied from the LandingPage page shell's hero.",
		"The headline is the page's only h1 — place one HeroBlock per page.",
		"Two actions, one primary. The install command is the third, quieter way in for developers who already decided.",
		"The lede is capped at the prose measure and the headline at max-w-4xl, so both stay readable on wide screens.",
	],
	a11y: [
		"Calls to action are links styled as Buttons (render={<a />}), because they navigate.",
		"The CodeBlock's copy button is labelled and announces when it has copied.",
	],
}
