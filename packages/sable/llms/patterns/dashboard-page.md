# DashboardPage

App-shell admin dashboard: a branded Sidebar with an account footer (AppHeader + BottomNav below lg), a KPI row, an edge-to-edge accounts table with seat-usage Meters, and supporting payout, top-customer, release and activity cards — the default shape for an operator or analytics home route.

**Intent:** Reach for this when a route's job is monitoring or managing many records (sales, orders, accounts, posts) with a few headline numbers. Not for reading-focused routes (use FeedPage) or single-record routes (use ListDetailPage's detail side).

## Notes

- Region cap is `wide` (1280px): dashboards hold tables and multi-column grids, never a reading column.
- Hierarchy runs headline → records → context: KPI row, then the primary table beside its two closest companions (payout, top customers), then the lower-priority lists (upcoming, activity). Every row of the grid is filled so the route ends on content, not empty canvas.
- Stat cards: CardHeader carries the label (CardDescription) and the value; KPI values are `text-mono-xl` — the metric mono tier, tabular figures — never a heading tier. The trend Badge sits with its comparison note in CardContent, so the value keeps the full card width when the row folds to 2×2 on a phone.
- Stat cards use an explicit cols map (2 → 4) — a 4-stat row must fold to 2×2, never strand an orphan the way auto-fit can.
- The table runs flush to the card edges with `<CardContent flush>`, which hands the card's padding to the table (`--table-edge-px`), so the first and last columns line up with the CardHeader at any card density — never hand-set pl-6/pr-6. Numeric columns align end in mono; Table scrolls horizontally inside the card on narrow screens.
- Seats used / seats is a `Meter` (how full a known range is), not `Progress` (task progress). Status is `Badge appearance="plain" dot`, with the app's own states mapped to tones once at the top of the file.
- Lists are Entity rows in CardList, inset to the card padding and divided by hairlines — never CardContent with hand-tuned px. A card that shares a grid row with a taller one becomes `flex flex-col` and pins its CardFooter with `mt-auto`.
- Brand and account live in the Sidebar: SidebarHeader holds the mark + wordmark, SidebarFooter holds the signed-in Entity with an OverflowMenu. Sidebar rebinds the page ink tokens to its own, so the Entity and OverflowMenu read correctly even when a theme paints the rail dark on a light page.
- The page has exactly one heading-1 (PageHeader); card titles are Title tier, not headings.
- Chrome (Sidebar) is outside the content grid; the Page region caps only content.
- Sidebar hides below lg, so the shell's header carries an AppHeader (brand + account) and its footer a BottomNav with the same destinations — never strand mobile users without navigation.

## Accessibility

- AppShell provides the skip link and <main id="main-content"> landmark.
- The active SidebarItem and BottomNavItem carry aria-current via `active`.
- DataTable headers are real <th>; sortable columns are announced.
- Each seat-usage Meter has an aria-label naming the account and aria-valuetext reading "184 of 250 seats used".
- Avatars beside a visible name use an empty alt so the name is not read twice.

## Source

```tsx
import { AppHeader, AppShell, Avatar, Badge, BottomNav, BottomNavItem, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardList, CardTitle, DataTable, Entity, Grid, Icon, MenuItem, MenuSeparator, Meter, NotificationBadge, OverflowMenu, Page, PageHeader, RelativeTime, Row, Sidebar, SidebarBrand, SidebarFooter, SidebarHeader, SidebarItem, SidebarNav, Stack } from "@sableui/react"

// Account status → Badge tone. Sable has no status vocabulary of its own;
// an app maps ITS states onto tones once, here, and every badge follows.
const STATUS_TONE = { active: "success", onboarding: "info", full: "1", cancelled: "neutral" } as const
const STATUS_LABEL = { active: "Active", onboarding: "Onboarding", full: "Seats full", cancelled: "Cancelled" } as const
type AccountStatus = keyof typeof STATUS_TONE

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const shortDate = (offset: number) =>
	new Date(Date.now() + offset).toLocaleDateString("en-US", { month: "short", day: "numeric" })

const stats = [
	{ label: "Revenue", value: "$18,240", delta: "+8.2%", up: true, note: "vs. $16,857" },
	{ label: "Active seats", value: "1,284", delta: "+3.1%", up: true, note: "182 added" },
	{ label: "Accounts", value: "312", delta: "+12.4%", up: true, note: "Best month yet" },
	{ label: "Seat usage", value: "64%", delta: "−1.8%", up: false, note: "6 near their limit" },
]

const accounts = [
	{ id: "ac_01", title: "Northwind", status: "active" as const, used: 184, seats: 250, price: 16, started: -6 * DAY },
	{ id: "ac_02", title: "Harbor Labs", status: "full" as const, used: 100, seats: 100, price: 20, started: -19 * DAY },
	{ id: "ac_03", title: "Brightline", status: "active" as const, used: 61, seats: 150, price: 16, started: -2 * DAY },
	{ id: "ac_04", title: "Tidewater Co.", status: "active" as const, used: 212, seats: 300, price: 12, started: -27 * DAY },
	{ id: "ac_05", title: "Saltworks", status: "cancelled" as const, used: 38, seats: 75, price: 20, started: -44 * DAY },
	{ id: "ac_06", title: "Paper Moon", status: "full" as const, used: 50, seats: 50, price: 24, started: -58 * DAY },
	{ id: "ac_07", title: "Signal Studio", status: "onboarding" as const, used: 0, seats: 200, price: 16, started: 3 * DAY },
	{ id: "ac_08", title: "Bluewater", status: "cancelled" as const, used: 72, seats: 120, price: 12, started: -71 * DAY },
	{ id: "ac_09", title: "Ember & Field", status: "full" as const, used: 80, seats: 80, price: 20, started: -86 * DAY },
]
const accountCount = 312

const payout = {
	amount: 8862.64,
	date: 5 * DAY,
	lines: [
		{ label: "Subscriptions", value: 9127.33 },
		{ label: "Processing (2.9%)", value: -264.69 },
		{ label: "Deposits to", value: "Checking ••4821" },
	],
}

const customers = [
	{ id: "cu_01", name: "Northwind", handle: "northwind.io", initials: "NW", seats: 184, spent: 2944 },
	{ id: "cu_02", name: "Tidewater Co.", handle: "tidewater.co", initials: "TC", seats: 212, spent: 2544 },
	{ id: "cu_03", name: "Harbor Labs", handle: "harborlabs.com", initials: "HL", seats: 100, spent: 2000 },
	{ id: "cu_04", name: "Ember & Field", handle: "emberfield.com", initials: "EF", seats: 80, spent: 1600 },
]

const upcoming = [
	{ id: "up_01", title: "Version 2.4", detail: "Shared reports · All plans", at: 3 * DAY },
	{ id: "up_02", title: "Audit log export", detail: "Business plan · Beta", at: 12 * DAY },
	{ id: "up_03", title: "Version 2.5", detail: "Offline mode · All plans", at: 26 * DAY },
	{ id: "up_04", title: "Usage-based billing", detail: "Studio and Business · Beta", at: 34 * DAY },
]

const activity = [
	{ id: "ev_01", who: "Nina Simone", initials: "NS", what: "added 12 seats to Northwind · 184 of 250", when: 2 * MIN },
	{ id: "ev_02", who: "Grace Hopper", initials: "GH", what: "upgraded Brightline to Studio", when: 26 * MIN },
	{ id: "ev_03", who: "Frida Kahlo", initials: "FK", what: "paid invoice INV-0042 for Tidewater Co.", when: 1 * HOUR },
	{ id: "ev_04", who: "Mary Shelley", initials: "MS", what: "joined the Harbor Labs workspace", when: 3 * HOUR },
	{ id: "ev_05", who: "Nina Simone", initials: "NS", what: "booked onboarding for Signal Studio", when: 6 * HOUR },
]

export function DashboardPage() {
	return (
		<AppShell
			// Sidebar hides below lg, so the same destinations ride in the shell's
			// mobile slots — without them the route has no navigation under 1024px.
			header={
				<AppHeader
					title={
						<Row gap={1} align="center">
							<Icon name="gem" variant="solid" className="text-xl" />
							<span className="text-title-sm">Atelier</span>
						</Row>
					}
					actions={<Avatar variant="art" size="sm" fallback="AL" alt="Ada Lovelace" />}
				/>
			}
			bottomNav={
				<BottomNav aria-label="Primary">
					<BottomNavItem icon={<Icon name="grid" />} label="Overview" showLabel active render={<a href="/" />} />
					<BottomNavItem icon={<Icon name="folder" />} label="Accounts" showLabel render={<a href="/accounts" />} />
					<BottomNavItem icon={<Icon name="user" />} label="Customers" showLabel render={<a href="/customers" />} />
					<BottomNavItem icon={<Icon name="bell" />} label="Activity" showLabel render={<a href="/activity" />} />
					<BottomNavItem icon={<Icon name="gear" />} label="Settings" showLabel render={<a href="/settings" />} />
				</BottomNav>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<SidebarBrand mark={<Icon name="gem" variant="solid" />} label="Atelier" render={<a href="/" />} />
					</SidebarHeader>
					<SidebarNav>
						<SidebarItem icon={<Icon name="grid" />} label="Overview" active render={<a href="/" />} />
						<SidebarItem icon={<Icon name="folder" />} label="Accounts" render={<a href="/accounts" />} />
						<SidebarItem icon={<Icon name="user" />} label="Customers" render={<a href="/customers" />} />
						<SidebarItem
							icon={<Icon name="bell" />}
							label="Activity"
							badge={<NotificationBadge count={4} tone="neutral" />}
							render={<a href="/activity" />}
						/>
						<SidebarItem icon={<Icon name="gear" />} label="Settings" render={<a href="/settings" />} />
					</SidebarNav>
					<SidebarFooter>
						<Entity
							className="[--entity-py:0]"
							leading={<Avatar variant="art" size="sm" fallback="AL" alt="" />}
							title="Ada Lovelace"
							subtitle="@ada"
							action={
								<OverflowMenu label="Account" size="icon-sm">
									<MenuItem render={<a href="/@ada" />}>View profile</MenuItem>
									<MenuItem render={<a href="/settings" />}>Settings</MenuItem>
									<MenuSeparator />
									<MenuItem>Sign out</MenuItem>
								</OverflowMenu>
							}
						/>
					</SidebarFooter>
				</Sidebar>
			}
		>
			<Page max="wide" gap={4} className="py-6">
				<PageHeader
					title="Overview"
					description="Revenue and account activity for the last 30 days."
					actions={
						<Row gap={2}>
							<Button variant="outline">
								<Icon name="download" />
								Export
							</Button>
							<Button>
								<Icon name="plus" />
								New account
							</Button>
						</Row>
					}
				/>
				<Grid cols={{ base: 2, xl: 4 }} gap={3}>
					{stats.map((stat) => (
						<Card key={stat.label}>
							<CardHeader>
								<CardDescription>{stat.label}</CardDescription>
								<CardTitle className="text-mono-xl">{stat.value}</CardTitle>
							</CardHeader>
							<CardContent>
								<Row gap={1} wrap>
									<Badge
										tone={stat.up ? "success" : "warning"}
										size="sm"
										icon={<Icon name={stat.up ? "arrow-up" : "arrow-down"} />}
									>
										{stat.delta}
									</Badge>
									<span className="text-caption text-muted-foreground">{stat.note}</span>
								</Row>
							</CardContent>
						</Card>
					))}
				</Grid>
				<Grid cols={{ base: 1, xl: 3 }} gap={3}>
					<Card className="flex flex-col xl:col-span-2">
						<CardHeader>
							<CardTitle>Accounts</CardTitle>
							<CardDescription>Seats across your customers, newest first.</CardDescription>
						</CardHeader>
						<CardContent flush className="mt-4 flex-1">
							<DataTable
								data={accounts}
								rowKey={(row) => row.id}
								defaultSort={{ key: "started", direction: "desc" }}
								columns={[
									{ key: "title", header: "Account", sortable: true, className: "text-label-md whitespace-nowrap" },
									{
										key: "status",
										header: "Status",
										cell: (row) => (
											<Badge appearance="plain" tone={STATUS_TONE[row.status as AccountStatus]} dot>
												{STATUS_LABEL[row.status as AccountStatus]}
											</Badge>
										),
									},
									{
										key: "used",
										header: "Seats",
										sortable: true,
										sortValue: (row) => row.used / row.seats,
										cell: (row) => (
											<Row gap={3} align="center" className="min-w-40">
												<Meter
													value={row.used}
													max={row.seats}
													size="sm"
													tone={row.used === row.seats ? "success" : "primary"}
													aria-label={`${row.title} seats used`}
													getAriaValueText={(_, v) => `${v} of ${row.seats} seats used`}
													className="flex-1"
												/>
												<span className="text-mono-caption whitespace-nowrap text-muted-foreground">
													{row.used}/{row.seats}
												</span>
											</Row>
										),
									},
									{
										key: "revenue",
										header: "Revenue",
										align: "end",
										sortable: true,
										sortValue: (row) => row.used * row.price,
										cell: (row) =>
											row.used > 0 ? (
												<span className="text-mono-sm">{usd.format(row.used * row.price)}</span>
											) : (
												<span className="text-mono-sm text-muted-foreground">—</span>
											),
									},
									{
										key: "started",
										header: "Started",
										align: "end",
										sortable: true,
										cell: (row) => (
											<span className="text-body-sm whitespace-nowrap text-muted-foreground">{shortDate(row.started)}</span>
										),
									},
								]}
							/>
						</CardContent>
						<CardFooter className="justify-between">
							<span className="text-caption text-muted-foreground">
								Showing {accounts.length} of {accountCount} accounts
							</span>
							<Button variant="ghost" size="sm" bleed="end" render={<a href="/accounts" />}>
								View all accounts
								<Icon name="arrow-right" />
							</Button>
						</CardFooter>
					</Card>
					<Stack gap={3}>
						<Card>
							<CardHeader>
								<CardDescription>Next payout</CardDescription>
								<CardTitle className="text-mono-xl">{usdCents.format(payout.amount)}</CardTitle>
								<CardAction>
									<Badge tone="info" size="sm" icon={<Icon name="calendar" />}>
										{shortDate(payout.date)}
									</Badge>
								</CardAction>
							</CardHeader>
							<CardContent>
								<dl className="sable-list-dl text-body-sm">
									{payout.lines.map((line) => (
										<div key={line.label} className="contents">
											<dt>{line.label}</dt>
											<dd className={typeof line.value === "number" ? "text-end text-mono-sm" : "text-end"}>
												{typeof line.value === "number" ? usdCents.format(line.value) : line.value}
											</dd>
										</div>
									))}
								</dl>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Top customers</CardTitle>
								<CardDescription>By spend this month.</CardDescription>
								<CardAction>
									<Button variant="ghost" size="sm" render={<a href="/customers" />}>
										View all
									</Button>
								</CardAction>
							</CardHeader>
							<CardList>
								{customers.map((person) => (
									<Entity
										key={person.id}
										leading={<Avatar variant="art" size="sm" fallback={person.initials} alt="" />}
										title={person.name}
										subtitle={`${person.handle} · ${person.seats} seats`}
										action={<span className="text-mono-sm">{usd.format(person.spent)}</span>}
									/>
								))}
							</CardList>
						</Card>
					</Stack>
				</Grid>
				<Grid cols={{ base: 1, xl: 3 }} gap={3}>
					<Card className="flex flex-col">
						<CardHeader>
							<CardTitle>Upcoming releases</CardTitle>
							<CardDescription>Scheduled to ship to customers.</CardDescription>
						</CardHeader>
						<CardList>
							{upcoming.map((release) => (
								<Entity
									key={release.id}
									title={release.title}
									subtitle={release.detail}
									action={<RelativeTime date={Date.now() + release.at} className="text-caption text-muted-foreground" />}
								/>
							))}
						</CardList>
						<CardFooter className="mt-auto">
							<Button variant="outline" size="sm" render={<a href="/releases/new" />}>
								<Icon name="calendar" />
								Schedule a release
							</Button>
						</CardFooter>
					</Card>
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Activity</CardTitle>
							<CardDescription>Seats, upgrades, and invoices.</CardDescription>
							<CardAction>
								<Button variant="ghost" size="sm" render={<a href="/activity" />}>
									View all
								</Button>
							</CardAction>
						</CardHeader>
						<CardList>
							{activity.map((item) => (
								<Entity
									key={item.id}
									leading={<Avatar variant="art" size="sm" fallback={item.initials} alt="" />}
									title={item.who}
									subtitle={item.what}
									action={<RelativeTime date={Date.now() - item.when} className="text-caption text-muted-foreground" />}
								/>
							))}
						</CardList>
					</Card>
				</Grid>
			</Page>
		</AppShell>
	)
}
```
