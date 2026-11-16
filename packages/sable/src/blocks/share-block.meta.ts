import type { BlockMeta } from "../lib/meta"

export const shareBlockMeta: BlockMeta = {
	name: "ShareBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "Sharing a document: a multi-select Combobox of people with a role Select and Invite, then who the link works for and a split Copy link button, each ending in a toast.",
	intent:
		"Reach for this as the body of a Share dialog or popover on a document, board or file. Inviting teammates by email address with no link is InviteTeamBlock; a list of who already has access is TeamMembersBlock.",
	notes: [
		"People are picked from a known list, so the field is a Combobox with chips, not a free-text input. Backspace in the empty field removes the last chip.",
		"Invite is disabled until someone is chosen. The toast waits for `onInvite`: return a promise and it says \"Invited …\" once the invites are sent, or that they were not sent (keeping the people chosen) if it rejects.",
		"Link access is controlled and reported through `onAccessChange`, like every other control in the card.",
		"Sharing outside the workspace by email address is InviteTeamBlock; this block picks people who are already in it.",
		"The link is shown with MiddleTruncate: the site at the start and the id at the end both stay readable in a narrow card.",
		"Copy link is a split button in a ButtonGroup: the common action on the face, the other formats in a Menu behind the chevron.",
		"Each result is a toast, including a failed copy. A ToastProvider must be mounted in the app for them to show.",
	],
	a11y: [
		"Both Selects have a name: the role by aria-label, link access by its Field label.",
		"The chevron button has its own accessible name, and the two buttons are announced as one group, \"Share link\".",
		"The full link is the truncated text's title, and copying is confirmed by the toast's live region.",
	],
}
