# ListDetailPage

Two-column list-detail: a wide region split 8/4, the record list as Entity rows in the main column, and a sticky supporting rail (detail, filters, or summary) beside it.

**Intent:** Reach for this when a route lists records AND keeps one selected/summarized in view (members + member detail, inbox + message, orders + order). For pure browsing with no rail, a single-column FeedPage or DashboardPage table is simpler.

## Notes

- Region cap is `wide`; the split is Columns 12 → Col 8 + Col 4, collapsing to stacked full-width columns below lg via breakpoint maps.
- List rows are Entity inside one bordered Card, in CardList: it insets each row to the card padding and divides them with hairlines — on a dark canvas rows need an anchoring surface, not a flat float.
- Pending records live in the same list, muted (muted title + `Invited` badge), instead of a separate section.
- The rail card holds label/value pairs as a Description list — muted terms, mono (tabular) values — plus one quiet action. Never hand-built `justify-between` rows.
- The rail is sticky (top on the 4px scale) so the summary stays in view while the list scrolls.

## Accessibility

- Entity rows given `interactive` + `onSelect` (to open a member's detail) render as real buttons; keyboard focus follows list order. Rows here are presentational.
- The rail is an <aside> landmark; the list column is the main content.

## Source

```tsx
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardList, CardTitle, Col, Columns, Description, DescriptionItem, Entity, Page, PageHeader, SearchInput, Stack } from "@sableui/react"

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
```
