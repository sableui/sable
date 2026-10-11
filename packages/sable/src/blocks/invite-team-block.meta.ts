import type { BlockMeta } from "../lib/meta"

export const inviteTeamBlockMeta: BlockMeta = {
	name: "InviteTeamBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "An invite card: who is already on the team as an AvatarGroup, and an email field with Send.",
	intent:
		"Reach for this for team or project invites in onboarding, an empty workspace, or a settings section. For managing an existing member list with roles, use a CardList of Entity rows instead.",
	notes: [
		"The field and Send are a <form>, so Enter sends; `onSend` receives the typed address.",
		"The AvatarGroup ring matches the card surface when framed and inherits the host surface when not.",
	],
	a11y: [
		"The AvatarGroup carries an aria-label with the count, so the stack reads as one item, not four initials.",
		"The email Input carries aria-label; there is no visible label in this compact layout.",
	],
}
