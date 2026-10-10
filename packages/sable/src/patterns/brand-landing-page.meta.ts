import type { PatternMeta } from "../lib/meta"

export const brandLandingPageMeta: PatternMeta = {
	name: "BrandLandingPage",
	summary:
		"High-fidelity brand/product landing page: pill navigation, editorial hero type, a dark product scene, calm status tones, CTA pair, feature cards, metrics, and a complete branded footer.",
	intent:
		"Use this for a polished product marketing route that still needs to show a credible app surface. It is warmer and more tactile than the canonical LandingPage, but avoids trend-driven neon and generic hype cues.",
	notes: [
		"One display headline owns the first viewport; supporting copy stays in body-lg at prose measure.",
		"The nav spends one compact pill surface, with a clear brand signal and two primary paths: sign in and request access.",
		"The product scene uses overlay tokens for a stable dark media surface, then semantic tones for status and chart signals.",
		"The footer closes the page with brand reassurance, a three-column sitemap, a digest signup, operational mini-metrics, and legal links.",
		"Every surface outside the product scene is a real Card (feature, metric and digest cards); status marks are StatusDot. The scene's nested panels take `rounded-concentric-xl/<inset>` from the shell's radius, so the corners stay parallel at any radius preset.",
		"Radius and shadow are theme-controlled. In Cove the same rounded-lg/xl classes read larger and softer; in other themes the structure still holds.",
		"Color is intentionally broad: porcelain/plum/lavender/blue/mint/saffron/coral through semantic roles, not a one-note purple gradient.",
	],
	a11y: [
		"The brand nav is a labeled nav landmark with real links and visible text.",
		"The footer is a real footer landmark with a labeled footer nav, visible link text, and a labeled email field.",
		"TextReveal preserves the full headline as one accessible label and honors reduced-motion policy.",
		"Status dots are paired with visible text labels so color is never the only signal.",
	],
}
