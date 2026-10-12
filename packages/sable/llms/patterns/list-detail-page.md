# ListDetailPage

Searchable list beside the selected record's detail: interactive Entity rows in a CardList (5 of 12 columns) and a sticky detail pane (7) with an editable field, a label/value list, record actions with a destructive confirmation, and recent activity. Below lg it becomes a drill-in.

**Intent:** Reach for this when a route lists records AND works on one at a time (members + member, inbox + message, orders + order). For pure browsing with no selection, a single-column FeedPage or a DashboardPage table is simpler.

## Notes

- Region cap is `wide`; Columns 12 → Col 5 (list) + Col 7 (detail). Below lg the list and detail share one column as a drill-in: selecting a row shows the detail with an `All members` back button (lg:hidden), and the back button returns to the list. The panes swap with `max-lg:hidden`, so desktop always shows both.
- Rows are interactive Entity inside one Card + CardList. Selection is Entity `selected`; `sable-surface` on the list card makes its selected step 12% ink off the card, so a selected row stays distinct from its muted avatar.
- Search filters the list in place (name, email, role). No matches swap the CardList for an EmptyState with a Clear search action; the selected detail stays open.
- A pending invite lives in the same list: a mail glyph in the Avatar, an `Invited` Badge, and an invite-specific detail (role on joining, sent, expires, invited by; Resend and Revoke actions).
- The role Select edits the record in place; its Field description states what the role can do. The owner's role is read-only and the owner has no remove action.
- Read-only facts are a native `<dl className="sable-list-dl sable-list-dl-2">` inside an `@container`, so pairs go two-up only when the pane is wide enough.
- Remove / revoke run through DestructiveActionModal; on confirm the next row is selected. Page-level counts (members, pending, seats) live in the PageHeader description and update with the list.
- The detail pane is sticky (lg:top-6) so it stays in view while a long list scrolls.

## Accessibility

- Each row is a real button (Entity `interactive` + `onSelect`): Tab moves through rows, Enter/Space selects. The selected row is Entity `selected`, which paints the selected fill and sets aria-current; list avatars are aria-hidden so initials are not read before the name.
- The detail pane is a labelled region (`Member details`) whose title is a level-2 heading.
- On a phone, drilling in moves focus to the back button; going back returns focus to the row that was open. After a remove, focus lands on the newly selected row; after Clear search, on the search field.

## Source

```tsx
import { useState, useEffect, useRef } from "react"
import { Avatar, Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardList, CardTitle, Col, Columns, DestructiveActionModal, EmptyState, Entity, Field, Icon, Page, PageHeader, Row, SearchInput, Select, SelectContent, SelectItem, SelectTrigger, Stack, StatusDot } from "@sableui/react"

type Role = "owner" | "admin" | "editor" | "viewer"

const roles: { value: Role; label: string }[] = [
	{ value: "owner", label: "Owner" },
	{ value: "admin", label: "Admin" },
	{ value: "editor", label: "Editor" },
	{ value: "viewer", label: "Viewer" },
]

const roleLabel: Record<Role, string> = {
	owner: "Owner",
	admin: "Admin",
	editor: "Editor",
	viewer: "Viewer",
}

const roleSummary: Record<Role, string> = {
	owner: "Full access, including payouts and billing. Transfer ownership in studio settings.",
	admin: "Manages members, editions and payouts.",
	editor: "Drafts, prices and releases editions.",
	viewer: "Sees editions and sales, but can't change them.",
}

type Activity = { id: string; icon: string; text: string; when: string }

type Member = {
	id: string
	name: string
	email: string
	initials: string
	role: Role
	pending: boolean
	handle?: string
	joined?: string
	lastActive?: string
	editions?: number
	invitedBy?: string
	sent?: string
	expires?: string
	resent?: boolean
	activity: Activity[]
}

const seats = 10

const initialMembers: Member[] = [
	{
		id: "u_01", name: "Ada Lovelace", handle: "@ada", email: "ada@atelier.art", initials: "AL", role: "owner", pending: false,
		joined: "Mar 4, 2024", lastActive: "Online now", editions: 12,
		activity: [
			{ id: "a1", icon: "gem", text: "Released Analytical Engine No. 3 — edition of 50", when: "2 hours ago" },
			{ id: "a2", icon: "mail", text: "Invited louise@bourgeois.studio as Editor", when: "2 days ago" },
		],
	},
	{
		id: "u_02", name: "Grace Hopper", handle: "@grace", email: "grace@atelier.art", initials: "GH", role: "admin", pending: false,
		joined: "Mar 9, 2024", lastActive: "20 minutes ago", editions: 4,
		activity: [
			{ id: "a1", icon: "user", text: "Changed Frida Kahlo's role to Viewer", when: "Yesterday" },
			{ id: "a2", icon: "edit", text: "Updated pricing on First Compiler — edition of 10", when: "3 days ago" },
			{ id: "a3", icon: "gem", text: "Released First Compiler — edition of 10", when: "Sep 28" },
		],
	},
	{
		id: "u_03", name: "Mary Shelley", handle: "@mary", email: "mary@atelier.art", initials: "MS", role: "editor", pending: false,
		joined: "Jun 18, 2024", lastActive: "3 hours ago", editions: 7,
		activity: [
			{ id: "a1", icon: "calendar", text: "Scheduled Frankenstein Studies for Oct 14", when: "3 hours ago" },
			{ id: "a2", icon: "gem", text: "Released The Last Man — edition of 25", when: "Sep 21" },
		],
	},
	{
		id: "u_04", name: "Nina Simone", handle: "@nina", email: "nina@atelier.art", initials: "NS", role: "editor", pending: false,
		joined: "Jan 12, 2025", lastActive: "Yesterday", editions: 3,
		activity: [
			{ id: "a1", icon: "upload", text: "Uploaded artwork for Little Girl Blue", when: "Yesterday" },
			{ id: "a2", icon: "gem", text: "Released Feeling Good — edition of 100", when: "Aug 30" },
		],
	},
	{
		id: "u_05", name: "Frida Kahlo", handle: "@frida", email: "frida@atelier.art", initials: "FK", role: "viewer", pending: false,
		joined: "Jul 2, 2025", lastActive: "4 days ago", editions: 0,
		activity: [{ id: "a1", icon: "comment", text: "Commented on the Las Dos Fridas draft", when: "4 days ago" }],
	},
	{
		id: "i_01", name: "louise@bourgeois.studio", email: "louise@bourgeois.studio", initials: "", role: "editor", pending: true,
		invitedBy: "Ada Lovelace", sent: "2 days ago", expires: "In 5 days",
		activity: [],
	},
]

export function ListDetailPage() {
	const [members, setMembers] = useState(initialMembers)
	const [selectedId, setSelectedId] = useState<string | null>("u_02")
	const [query, setQuery] = useState("")
	// Below lg the list and the detail share one column: selecting drills in.
	const [showDetail, setShowDetail] = useState(false)
	const [confirming, setConfirming] = useState(false)
	const listRef = useRef<HTMLDivElement>(null)
	const backRef = useRef<HTMLButtonElement>(null)
	const searchRef = useRef<HTMLInputElement>(null)

	const needle = query.trim().toLowerCase()
	const visible = members.filter((m) =>
		[m.name, m.email, m.handle ?? "", roleLabel[m.role]].some((v) => v.toLowerCase().includes(needle)),
	)
	const selected = members.find((m) => m.id === selectedId) ?? null
	const active = members.filter((m) => !m.pending).length
	const pending = members.length - active

	// Drilling in on a phone moves focus to the detail's back control; the
	// control is display:none at lg, so desktop focus stays on the list.
	useEffect(() => {
		if (showDetail && backRef.current?.offsetParent) backRef.current.focus()
	}, [showDetail, selectedId])

	function select(id: string) {
		setSelectedId(id)
		setShowDetail(true)
	}

	function focusRow(id: string | undefined) {
		requestAnimationFrame(() => {
			listRef.current?.querySelector<HTMLButtonElement>(`[data-member-id="${id}"] button`)?.focus()
		})
	}

	function backToList() {
		setShowDetail(false)
		focusRow(selectedId ?? undefined)
	}

	function setRole(id: string, role: Role) {
		setMembers((list) => list.map((m) => (m.id === id ? { ...m, role } : m)))
	}

	function resend(id: string) {
		setMembers((list) =>
			list.map((m) => (m.id === id ? { ...m, sent: "Just now", expires: "In 7 days", resent: true } : m)),
		)
	}

	function remove(id: string) {
		const index = members.findIndex((m) => m.id === id)
		const rest = members.filter((m) => m.id !== id)
		setMembers(rest)
		const next = rest[Math.min(index, rest.length - 1)]?.id
		setSelectedId(next ?? null)
		setShowDetail(false)
		// The control that opened the confirmation is gone; land on the next row.
		focusRow(next)
	}

	return (
		<Page as="main" max="wide" gap={4} className="py-6">
			<PageHeader
				title="Members"
				description={`${active} members · ${pending} pending ${pending === 1 ? "invite" : "invites"} · ${members.length} of ${seats} seats used`}
				actions={<Button iconStart={<Icon name="plus" />}>Invite member</Button>}
			/>
			<Columns count={{ base: 1, lg: 12 }}>
				<Col span={{ base: 1, lg: 5 }} className={showDetail ? "max-lg:hidden" : undefined}>
					<Stack gap={3}>
						<SearchInput
							ref={searchRef}
							value={query}
							onValueChange={setQuery}
							placeholder="Search name, email or role"
							aria-label="Search members"
						/>
						{/* sable-surface derives the rows' selected step from the card (12% ink),
						    so a selected row stays distinct from its muted avatar. */}
						<Card ref={listRef} className="sable-surface">
							{visible.length > 0 ? (
								<CardList aria-label="Members">
									{visible.map((m) => {
										const isSelected = m.id === selectedId
										return (
											<Entity
												key={m.id}
												data-member-id={m.id}
												interactive
												selected={isSelected}
												onSelect={() => select(m.id)}
												leading={
													<Avatar variant="art"
														seed={m.name}
														fallback={m.pending ? <Icon name="mail" className="size-5" /> : m.initials}
														status={m.lastActive === "Online now" ? <StatusDot tone="success" /> : undefined}
														// The row's title already names it: keep the initials out of the row's name.
														aria-hidden
													/>
												}
												title={m.name}
												subtitle={
													m.pending
														? `${roleLabel[m.role]} · invite sent ${m.sent?.toLowerCase()}`
														: `${roleLabel[m.role]} · ${m.handle}`
												}
												action={m.pending ? <Badge tone="info">Invited</Badge> : undefined}
											/>
										)
									})}
								</CardList>
							) : (
								<CardContent>
									<EmptyState
										icon={<Icon name="search" />}
										title="No members found"
										description={`Nobody matches “${query.trim()}”. Try a name, email or role.`}
										action={
											<Button variant="secondary" size="sm" onClick={() => {
												setQuery("")
												searchRef.current?.focus()
											}}>
												Clear search
											</Button>
										}
									/>
								</CardContent>
							)}
						</Card>
					</Stack>
				</Col>
				<Col span={{ base: 1, lg: 7 }} className={showDetail ? undefined : "max-lg:hidden"}>
					<Stack role="region" aria-label="Member details" gap={3} className="lg:sticky lg:top-6">
						<Button
							ref={backRef}
							variant="ghost"
							size="sm"
							iconStart={<Icon name="chevron-left" />}
							onClick={backToList}
							className="self-start lg:hidden"
						>
							All members
						</Button>
						{selected === null ? (
							<EmptyState
								surface="card"
								icon={<Icon name="user" />}
								title="No member selected"
								description="Choose someone from the list to see their role and activity."
							/>
						) : (
							<>
								<Card>
									<CardHeader>
										<Row gap={2}>
											<Avatar variant="art"
												size="lg"
												fallback={selected.pending ? <Icon name="mail" className="size-6" /> : selected.initials}
												status={selected.lastActive === "Online now" ? <StatusDot tone="success" /> : undefined}
												alt={selected.pending ? "Pending invite" : selected.name}
											/>
											<Stack gap={0} className="min-w-0">
												<CardTitle render={<h2 />} className="truncate">
													{selected.name}
												</CardTitle>
												<CardDescription className="truncate">
													{selected.pending ? "Hasn't joined yet" : `${selected.handle} · ${selected.email}`}
												</CardDescription>
											</Stack>
										</Row>
										{selected.pending ? (
											<CardAction>
												<Badge tone="info">Invited</Badge>
											</CardAction>
										) : null}
									</CardHeader>
									<CardContent>
										<Stack gap={5}>
											<Field
												label={selected.pending ? "Role on joining" : "Role"}
												description={roleSummary[selected.role]}
											>
												<Select
													items={roles}
													value={selected.role}
													onValueChange={(value) => setRole(selected.id, value as Role)}
													disabled={selected.role === "owner"}
												>
													<SelectTrigger className="max-w-72" />
													<SelectContent>
														{roles
															.filter((r) => r.value !== "owner" || selected.role === "owner")
															.map((r) => (
																<SelectItem key={r.value} value={r.value}>
																	{r.label}
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</Field>
											<div className="@container">
												{selected.pending ? (
													<dl className="sable-list-dl sable-list-dl-2">
														<dt>Sent</dt>
														<dd>{selected.sent}</dd>
														<dt>Expires</dt>
														<dd>{selected.expires}</dd>
														<dt>Invited by</dt>
														<dd>{selected.invitedBy}</dd>
													</dl>
												) : (
													<dl className="sable-list-dl sable-list-dl-2">
														<dt>Email</dt>
														<dd>{selected.email}</dd>
														<dt>Joined</dt>
														<dd>{selected.joined}</dd>
														<dt>Last active</dt>
														<dd className={selected.lastActive === "Online now" ? "text-success" : undefined}>
															{selected.lastActive}
														</dd>
														<dt>Editions released</dt>
														<dd>{selected.editions}</dd>
													</dl>
												)}
											</div>
										</Stack>
									</CardContent>
									{selected.role !== "owner" ? (
										<CardFooter>
											<Row gap={2} wrap>
												{selected.pending ? (
													<Button
														variant="secondary"
														size="sm"
														iconStart={<Icon name={selected.resent ? "check" : "send"} />}
														disabled={selected.resent}
														onClick={() => resend(selected.id)}
													>
														{selected.resent ? "Invite resent" : "Resend invite"}
													</Button>
												) : null}
												<Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
													{selected.pending ? "Revoke invite" : "Remove from studio"}
												</Button>
											</Row>
										</CardFooter>
									) : null}
								</Card>
								{selected.activity.length > 0 ? (
									<Card>
										<CardHeader>
											<CardTitle render={<h3 />}>
												Recent activity
											</CardTitle>
										</CardHeader>
										<CardList>
											{selected.activity.map((a) => (
												<Entity
													key={a.id}
													leading={<Icon name={a.icon} className="text-muted-foreground" />}
													title={a.text}
													subtitle={a.when}
												/>
											))}
										</CardList>
									</Card>
								) : null}
								<DestructiveActionModal
									open={confirming}
									onOpenChange={setConfirming}
									title={selected.pending ? "Revoke this invite?" : `Remove ${selected.name}?`}
									description={
										selected.pending
											? `${selected.email} won't be able to join with the link they were sent.`
											: "They lose access to the studio right away. Editions they released stay on sale."
									}
									confirmLabel={selected.pending ? "Revoke invite" : "Remove member"}
									onConfirm={() => remove(selected.id)}
								/>
							</>
						)}
					</Stack>
				</Col>
			</Columns>
		</Page>
	)
}
```
