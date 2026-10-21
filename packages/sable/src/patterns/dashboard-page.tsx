import { Icon } from "../icon"
import { AppHeader } from "../components/app-header"
import { AppShell } from "../components/app-shell"
import { Avatar } from "../components/avatar"
import { Badge } from "../components/badge"
import { BottomNav, BottomNavItem } from "../components/bottom-nav"
import { Button } from "../components/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardList,
	CardTitle,
} from "../components/card"
import { DataTable } from "../components/data-table"
import { Entity } from "../components/entity"
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../components/menu"
import { Meter } from "../components/meter"
import { NotificationBadge } from "../components/notification-badge"
import { PageHeader } from "../components/page-header"
import { RelativeTime } from "../components/relative-time"
import {
	Sidebar,
	SidebarAccount,
	SidebarFooter,
	SidebarBrand,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "../components/sidebar"
import { Grid, Page, Row, Stack } from "../layout"

// ---pattern-code---
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
						<Menu>
							<MenuTrigger
								render={
									<SidebarAccount
										avatar={<Avatar variant="art" size="xs" fallback="AL" alt="" />}
										label="Ada Lovelace"
										detail="@ada"
									/>
								}
							/>
							<MenuContent side="top" align="start">
								<MenuItem render={<a href="/@ada" />}>View profile</MenuItem>
								<MenuItem render={<a href="/settings" />}>Settings</MenuItem>
								<MenuSeparator />
								<MenuItem>Sign out</MenuItem>
							</MenuContent>
						</Menu>
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
