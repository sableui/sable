import type { BlockMeta } from "../lib/meta"

export const ctaBandBlockMeta: BlockMeta = {
	name: "CtaBandBlock",
	family: "Marketing",
	kind: "section",
	summary: "A closing call to action: a centred h2 and one-line lede on a card, with a primary and an outline action.",
	intent:
		"Reach for this as the last section before the footer, repeating the hero's primary action once the reader has seen the case. Mid-page prompts to sign up belong inline, not in a band.",
	notes: [
		"Copied from the LandingPage page shell's closing call to action.",
		"The primary action matches the hero's, so the page asks for one thing twice rather than two things once.",
		"Sitting on a Card lifts it from the page without a coloured band, so it follows any preset.",
	],
	a11y: [
		"The section is labelled by its h2.",
		"Both actions are links styled as Buttons, because they navigate.",
	],
}
