import type { BlockMeta } from "../lib/meta"

export const faqBlockMeta: BlockMeta = {
	name: "FaqBlock",
	family: "Marketing",
	kind: "section",
	summary: "A FAQ section: the heading and a way to ask beside an Accordion of questions, each answer one or two sentences.",
	intent:
		"Reach for this near pricing or at the end of a landing page, for the questions that block a decision. Long help content belongs in docs, not an accordion.",
	notes: [
		"Every question starts closed: the list of questions is itself the useful summary.",
		"The way to ask a human sits beside the heading, so it is found before the reader scrolls the list.",
		"Capped at the `content` region width; questions wider than that are hard to scan.",
	],
	a11y: [
		"Accordion triggers are buttons with aria-expanded, inside headings, so the questions are navigable by heading and operable by keyboard.",
		"The contact link is a real <a> inside the lede sentence.",
	],
}
