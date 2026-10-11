import type { BlockMeta } from "../lib/meta"

export const profileFormBlockMeta: BlockMeta = {
	name: "ProfileFormBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "20rem", max: "42rem" },
	summary: "A profile settings card: avatar with upload/remove, name and handle side by side, a bio, a timezone Select, and one Save profile in the footer.",
	intent:
		"Reach for this for the profile or account section of settings, or any form of drafted text that is committed together. Toggles that apply instantly belong in NotificationSettingsBlock, never behind this Save.",
	notes: [
		"Copied from the SettingsPage page shell's Profile section; the shell keeps its own copy so it stays one self-contained file.",
		"One explicit save for the whole card. Short pairs (name + handle) sit side by side from sm up with Grid cols={{ base: 1, sm: 2 }}.",
		"The CardTitle renders an h2, so the section joins the page outline under its h1.",
	],
	a11y: [
		"Field wires label, description and error to each control; the handle's URL preview is its description.",
		"The photo actions are type=\"button\", so neither one submits the form.",
	],
}
