import type { PatternMeta } from "../lib/meta"

export const landingPageMeta: PatternMeta = {
	name: "LandingPage",
	summary:
		"Marketing hero + feature grid: display-tier headline as the page's single loud moment, an eyebrow kicker, a two-action CTA row, and a three-up feature grid that reveals on scroll.",
	intent:
		"Reach for this for the marketing/landing route of a product — the one page where Display type and scroll reveals belong. Not for product UI (display type and one-per-view rules forbid it inside the app).",
	notes: [
		"Display type is the marketing voice: exactly one display headline per page, tight leading, weight 700+.",
		"The eyebrow is a small outline Badge (`size=\"sm\"`) — the badge's own size, never a type class forced onto its label; hierarchy above the headline is eyebrow → display → lede.",
		"The lede is body-lg capped at the prose measure — the headline may be wide, reading text may not.",
		"Two CTAs max: one primary, one quiet outline. More actions dilute the hero.",
		"Reveal wraps below-the-fold sections only; it no-ops under reduced motion via the motion policy.",
		"Feature cards are Cards in a Grid with minItemWidth (three-up that reflows on its own width), each icon + title + body-sm copy.",
	],
	a11y: [
		"The hero headline is the page h1; feature titles are h2s restyled with the Title tier.",
		"Reveal renders content immediately (no animation) when prefers-reduced-motion is set.",
		"CTA buttons are real links or buttons with visible text — no icon-only CTAs.",
	],
}
