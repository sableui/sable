import type { PatternMeta } from "../lib/meta"

export const landingPageMeta: PatternMeta = {
	name: "LandingPage",
	summary:
		"Product / open-source landing page: a centered hero with an eyebrow Badge, one display headline, lede, two CTAs and a copyable install command; a Browser-framed product preview composed from real components; a six-up feature grid; a setup section with tabbed code; an agent-workflow section with terminal output; a CTA card; and a link-column footer.",
	intent:
		"Reach for this for the marketing route of a developer product, library, or tool: the page where the product shows itself working and the reader installs or signs up. For a branded, editorial marketing site use BrandLandingPage. Not for product UI (display type and one-per-view rules forbid it inside the app).",
	notes: [
		"Display type is the marketing voice: exactly one display headline per page (`text-display-lg` on phones, `text-display-2xl` from `sm`). Every section below uses `text-heading-1` with a `text-overline` kicker.",
		"The eyebrow is a small outline Badge (`size=\"sm\"`): the badge's own size, never a type class forced onto its label. Hierarchy above the fold is eyebrow, display, lede, CTAs, install command.",
		"The lede is body-lg capped at the prose measure. The headline may be wide; reading text may not.",
		"Two CTAs max per row: one primary, one quiet outline. The install line is a `CodeBlock` with `prompt=\"$\"`, so it truncates on one line and copy takes only the command.",
		"Show the product instead of describing it. The preview is real components (PageHeader, metric Cards, a Meter, a CardList of Entity rows, Message and Bubble, ChatComposer) inside `Browser`, wrapped in an `inert` div so the picture's controls never take focus. Secondary columns hide on small screens rather than stacking into a long mock.",
		"Features are Cards in a fixed `Grid cols={{ base: 1, sm: 2, lg: 3 }}`, so six items always land as full rows (3 x 2, 2 x 3, 1 x 6) without an orphan.",
		"Multi-line code uses `CodeBlock` with a filename; switch related snippets with `Tabs`, defaulting to the most complete one. Terminal output passes `highlight={false}` so a code highlighter does not colour prose.",
		"Reveal wraps below-the-fold blocks only (features, code, CTA). It no-ops under reduced motion via the motion policy.",
		"Hide nav groups on narrow screens by wrapping them in a `max-md:hidden` div: a `Row` or `Button` sets its own display, which a `hidden` class on the same element does not reliably override.",
	],
	a11y: [
		"The hero headline is the page h1; section titles are h2s and feature and step titles are h3s. Footer column labels are h2s inside the footer nav.",
		"The product preview is a `figure` with a visible figcaption. Its content is `inert`, which removes it from the tab order and the accessibility tree, so its headings and buttons do not pollute the outline.",
		"Reveal renders content immediately (no animation) when prefers-reduced-motion is set.",
		"CTA buttons are real links with visible text, with no icon-only CTAs. Footer links keep a 36px minimum row height for touch.",
	],
}
