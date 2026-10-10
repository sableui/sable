import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardList,
	CardTitle,
} from "../components/card"
import { Description, DescriptionItem } from "../components/description"
import { Entity } from "../components/entity"
import { PageHeader } from "../components/page-header"
import { SearchInput } from "../components/search-input"
import { Col, Columns, Page, Stack } from "../layout"

// ---pattern-code---
const members = [
	{ id: "u_01", name: "Ada Lovelace", handle: "@ada", role: "Owner", initials: "AL", pending: false },
	{ id: "u_02", name: "Grace Hopper", handle: "@grace", role: "Admin", initials: "GH", pending: false },
	{ id: "u_03", name: "Mary Shelley", handle: "@mary", role: "Member", initials: "MS", pending: false },
	{ id: "u_04", name: "Nina Simone", handle: "@nina", role: "Member", initials: "NS", pending: false },
	{ id: "u_05", name: "Frida Kahlo", handle: "@frida", role: "Member", initials: "FK", pending: false },
	{ id: "u_06", name: "hopper@navy.mil", handle: "invited 2 days ago", role: "Member", initials: "?", pending: true },
]

export function ListDetailPage() {
	return (
		<Page as="main" max="wide" gap={4} className="py-6">
			<PageHeader
				title="Members"
				description="Everyone with access to this workspace."
				actions={<Button>Invite member</Button>}
			/>
			<Columns count={{ base: 1, lg: 12 }}>
				<Col span={{ base: 1, lg: 8 }}>
					<Stack gap={3}>
						<SearchInput placeholder="Search members" aria-label="Search members" />
						<Card className="overflow-hidden">
							<CardList>
									{members.map((member) => (
										<Entity
											key={member.id}
											leading={
												<Avatar
													fallback={member.pending ? "•" : member.initials}
													alt={member.pending ? "" : member.name}
												/>
											}
											title={
												<span className={member.pending ? "text-muted-foreground" : undefined}>
													{member.name}
												</span>
											}
											subtitle={member.handle}
											action={
												member.pending ? (
													<Badge>Invited</Badge>
												) : (
													<Badge appearance="outline">{member.role}</Badge>
												)
											}
										/>
									))}
							</CardList>
						</Card>
					</Stack>
				</Col>
				<Col span={{ base: 1, lg: 4 }}>
					<aside className="sticky top-6">
						<Card>
							<CardHeader>
								<CardTitle>Workspace</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								{/* Label/value pairs are a Description list, not hand-built rows. */}
								<Description>
									<DescriptionItem term="Members" detail={<span className="text-mono-md">5</span>} />
									<DescriptionItem term="Pending invites" detail={<span className="text-mono-md">1</span>} />
									<DescriptionItem term="Seats used" detail={<span className="text-mono-md">6 / 10</span>} />
								</Description>
								<Button variant="outline" size="sm" className="mt-1 self-start">
									Manage plan
								</Button>
							</CardContent>
						</Card>
					</aside>
				</Col>
			</Columns>
		</Page>
	)
}
