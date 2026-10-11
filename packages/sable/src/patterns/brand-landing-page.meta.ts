import type { PatternMeta } from "../lib/meta"

export const brandLandingPageMeta: PatternMeta = {
	name: "BrandLandingPage",
	summary:
		"High-fidelity brand/product landing page: pill navigation, editorial hero type, a dark product scene, a value section, a how-it-works sequence, a customer story with outcomes, a closing CTA band, and a complete branded footer.",
	intent:
		"Use this for a polished product marketing route that still needs to show a credible app surface. It is warmer and more tactile than the canonical LandingPage, but avoids trend-driven neon and generic hype cues.",
	notes: [
		"The story runs promise → product → value → process → proof → ask: hero, product scene, 'Why Cove' value cards, a three-step how-it-works list, a customer story with outcome figures, then one closing CTA. Each section adds new evidence; no number is repeated from the product scene.",
		"One display headline owns the first viewport; supporting copy stays in body-lg at prose measure. Section headings are heading-1 under a `text-overline` eyebrow.",
		"The nav spends one compact pill surface, with a clear brand signal and two primary paths: sign in and request access.",
		"The product scene and the closing CTA band are dark islands: a `dark` class on the wrapper re-scopes every semantic token, so surfaces, muted ink, Badge tones and Buttons take the theme's own dark values in either page mode. Never fake a dark panel with overlay ink at reduced opacity — status tones tuned for a light page vanish on it.",
		"The scene is a picture of the product: `aria-hidden` + `inert` keep its sample button and figures out of the tab order and the outline. On narrow screens it drops the side column and keeps the signal map, so it scales instead of stacking into a second page.",
		"The chart keeps past weeks on the quiet `secondary` fill and gives the current week the one accent, so the signal reads at a glance.",
		"Value cards are real Cards with a neutral `sable-well` icon tile; the customer story is a Card rendered as a figure, with outcome figures split by Separator. The scene's nested panels take `rounded-concentric-xl/<inset>` from the shell's radius, so the corners stay parallel at any radius preset.",
		"The footer closes the page with brand reassurance, a plain status Badge, a three-column sitemap (three columns at every width), a digest signup, and legal links.",
		"All figures, names and the testimonial are sample content; replace them with real, verifiable claims.",
	],
	a11y: [
		"The brand nav is a labeled nav landmark with real links and visible text.",
		"Each content section is a labelled region (by its h2, or aria-label for the customer story); the decorative product scene is hidden from assistive tech and inert.",
		"The how-it-works steps are an ordered list; the testimonial is a figure with a blockquote and a figcaption naming the speaker.",
		"The footer is a real footer landmark with a labeled footer nav, visible link text, and a labeled email field.",
		"TextReveal preserves the full headline as one accessible label and honors reduced-motion policy; Reveal shows the value cards immediately when motion is off.",
		"Status dots and the status Badge are paired with visible text labels so color is never the only signal.",
	],
}
