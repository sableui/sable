import type { BlockMeta } from "../lib/meta"

export const profileCardBlockMeta: BlockMeta = {
	name: "ProfileCardBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A profile card: a cover banner, an avatar rising into it, Share and Follow, the name and handle, a one-line bio and two counts.",
	intent:
		"Reach for this for a person or creator summary — a suggested-follow card, a hover target's full view, the top of a profile sidebar. For a small inline preview on hover, use ContextCard; for a row in a list of people, use Entity.",
	notes: [
		"The avatar overlaps the banner by half its height with a ring in the card colour, so it reads as sitting on the card, not pasted over the art.",
		"Follow is the one primary action and flips to a secondary Following once pressed; Share is an icon-only ghost Button beside it.",
		"Counts pair a label-tier number with muted body text, so the numbers scan as a row.",
	],
	a11y: [
		"The Share button carries aria-label; Follow's visible text changes with its state.",
		"The banner is decorative (aria-hidden); the Avatar's alt is the person's name.",
	],
}
