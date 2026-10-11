import type { BlockMeta } from "../lib/meta"

export const testimonialBlockMeta: BlockMeta = {
	name: "TestimonialBlock",
	family: "Marketing",
	kind: "section",
	summary: "A customer story: one large blockquote with the person's avatar, name and role, beside three outcome figures separated by rules.",
	intent:
		"Reach for this for one strong, attributable quote backed by numbers. A wall of short quotes is a different section; a logo row is Marquee.",
	notes: [
		"Copied from the BrandLandingPage page shell's customer story.",
		"The quote and the outcomes share one Card as a <figure>; the outcomes move under the quote below lg.",
		"Outcome values use display sizes because they are the proof; their labels say what each number counts.",
	],
	a11y: [
		"<figure> + <blockquote> + <figcaption> tie the quote to the person who said it.",
		"The section is labelled \"Customer story\" so it is reachable as a landmark.",
	],
}
