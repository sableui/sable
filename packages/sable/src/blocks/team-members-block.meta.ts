import type { BlockMeta } from "../lib/meta"

export const teamMembersBlockMeta: BlockMeta = {
	name: "TeamMembersBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "20rem", max: "42rem" },
	summary: "A members card: Entity rows with avatar, name and email, a role Badge, and an OverflowMenu of role changes and removal; pending invites sit in the same list.",
	intent:
		"Reach for this to manage who is in a workspace, project or team. For inviting people when the list is empty or short, InviteTeamBlock is the lighter shape; for hundreds of members with filters, use a DataTable.",
	notes: [
		"Each row's menu offers only what applies to it: Make admin or Make member, Resend invite for pending rows, then the destructive action after a separator.",
		"The owner has no menu — ownership is transferred elsewhere — and a control-sized spacer keeps the role badges aligned.",
		"Pending invites are outline Badges in the same list, so the team's full size reads in one place.",
	],
	a11y: [
		"Each OverflowMenu is labelled with the member's name (\"Manage Mara Okafor\"), so the triggers are distinguishable in a list.",
		"Roles are text in a Badge; tone only distinguishes the owner.",
	],
}
