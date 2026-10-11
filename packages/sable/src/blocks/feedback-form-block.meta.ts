import type { BlockMeta } from "../lib/meta"

export const feedbackFormBlockMeta: BlockMeta = {
	name: "FeedbackFormBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A feedback card: a one-to-five rating as a full-width ToggleGroup, an optional notes field, and Skip / Send feedback.",
	intent:
		"Reach for this for a post-session or post-purchase survey in a Sheet, Dialog or end-of-flow screen. For a feedback control anchored to a button in the app chrome, use the Feedback component (a popover).",
	notes: [
		"The rating is preselected, so one tap on Send is a complete answer; the notes are optional and say so.",
		"Skip is a ghost Button before the primary, so dismissing is always available and never competes with sending.",
		"`onDone` reports whether feedback was sent and, if so, the score and notes.",
	],
	a11y: [
		"The ToggleGroup carries aria-label=\"Rating\"; each Toggle's number is its name.",
		"The Textarea carries aria-label=\"Notes\"; its placeholder is a prompt, not the label.",
	],
}
