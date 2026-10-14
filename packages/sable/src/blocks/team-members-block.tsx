import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardAction, CardDescription, CardHeader, CardList, CardTitle } from "../components/card"
import { OverflowMenu } from "../components/overflow-menu"
import { Entity } from "../components/entity"
import { MenuItem, MenuSeparator } from "../components/menu"
import { Icon } from "../icon"
import { cn } from "../lib/cn"

// ---block-code---
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
								<Badge appearance={m.role === "Pending" ? "outline" : "plain"} tone={m.role === "Owner" ? "1" : "neutral"} size="sm">
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
