# TeamMembersBlock

A members card: Entity rows with avatar, name and email, a role Badge, and an OverflowMenu of role changes and removal; pending invites sit in the same list.

**Intent:** Reach for this to manage who is in a workspace, project or team. For inviting people when the list is empty or short, InviteTeamBlock is the lighter shape; for hundreds of members with filters, use a DataTable.

**Block:** Settings & team · card · designed for 20rem–42rem wide (fills its container up to the max)

## Notes

- Each row's menu offers only what applies to it: Make admin or Make member, Resend invite for pending rows, then the destructive action after a separator.
- The owner has no menu — ownership is transferred elsewhere — and a control-sized spacer keeps the role badges aligned.
- Pending invites are outline Badges in the same list, so the team's full size reads in one place.

## Accessibility

- Each OverflowMenu is labelled with the member's name ("Manage Mara Okafor"), so the triggers are distinguishable in a list.
- Roles are text in a Badge; tone only distinguishes the owner.

## Source

```tsx
import { Avatar, Badge, Button, Card, CardAction, CardDescription, CardHeader, CardList, CardTitle, cn, Entity, Icon, MenuItem, MenuSeparator, OverflowMenu } from "@sableui/react"

const members = [
	{ id: "u1", name: "Ada Lovelace", initials: "AL", email: "ada@studio.com", role: "Owner" },
	{ id: "u2", name: "Mara Okafor", initials: "MO", email: "mara@studio.com", role: "Admin" },
	{ id: "u3", name: "Sam Rivera", initials: "SR", email: "sam@studio.com", role: "Member" },
	{ id: "u4", name: "jun@studio.com", initials: "J", email: "Invited 2 days ago", role: "Pending" },
]

export interface TeamMembersBlockProps {
	className?: string
	/** false drops the card's surface and border — for a muted section that already frames it. */
	framed?: boolean
	onInvite?: () => void
	/** Called with the member's id and the action chosen from their menu. */
	onMemberAction?: (id: string, action: "make-admin" | "make-member" | "resend" | "remove") => void
}

export function TeamMembersBlock({ className, framed = true, onInvite, onMemberAction }: TeamMembersBlockProps) {
	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-2xl", className)}>
			<CardHeader>
				<CardTitle render={<h2 />}>Members</CardTitle>
				<CardDescription>{members.length} people in this workspace.</CardDescription>
				<CardAction>
					<Button size="sm" iconStart={<Icon name="plus" />} onClick={onInvite}>
						Invite
					</Button>
				</CardAction>
			</CardHeader>
			<CardList>
				{members.map((m) => (
					<Entity
						key={m.id}
						leading={<Avatar variant="art" size="sm" fallback={m.initials} alt={m.name} />}
						title={m.name}
						subtitle={m.email}
						action={
							<div className="flex items-center gap-2">
								<Badge appearance={m.role === "Pending" ? "outline" : "plain"} tone={m.role === "Owner" ? "edition" : "neutral"} size="sm">
									{m.role}
								</Badge>
								{/* The owner is not managed from here; a placeholder keeps the column aligned. */}
								{m.role === "Owner" ? (
									<span aria-hidden className="size-(--control-sm)" />
								) : (
									<OverflowMenu label={`Manage ${m.name}`} size="icon-sm">
										{m.role === "Pending" ? (
											<MenuItem onClick={() => onMemberAction?.(m.id, "resend")}>Resend invite</MenuItem>
										) : m.role === "Admin" ? (
											<MenuItem onClick={() => onMemberAction?.(m.id, "make-member")}>Make member</MenuItem>
										) : (
											<MenuItem onClick={() => onMemberAction?.(m.id, "make-admin")}>Make admin</MenuItem>
										)}
										<MenuSeparator />
										<MenuItem variant="destructive" onClick={() => onMemberAction?.(m.id, "remove")}>
											{m.role === "Pending" ? "Cancel invite" : "Remove from workspace"}
										</MenuItem>
									</OverflowMenu>
								)}
							</div>
						}
					/>
				))}
			</CardList>
		</Card>
	)
}
```
