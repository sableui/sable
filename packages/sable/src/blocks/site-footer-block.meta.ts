import type { BlockMeta } from "../lib/meta"

export const siteFooterBlockMeta: BlockMeta = {
	name: "SiteFooterBlock",
	family: "Marketing",
	kind: "section",
	summary: "A site footer: the brand and a one-line tagline beside link groups in a labelled Footer nav, over a copyright line.",
	intent:
		"Reach for this at the foot of a marketing or docs site. App screens inside an AppShell take no footer; their navigation lives in the sidebar.",
	notes: [
		"Copied from the LandingPage page shell's footer.",
		"Every link is at least 36px tall (min-h-9), so the dense list is still an easy touch target.",
		"Groups go two up on a phone and three up from sm; add a group only if it has three links or more.",
	],
	a11y: [
		"Renders <footer> with a <nav aria-label=\"Footer\">, distinct from the page's main navigation.",
		"Group titles are h2s, so the footer's structure is navigable by heading.",
	],
}
