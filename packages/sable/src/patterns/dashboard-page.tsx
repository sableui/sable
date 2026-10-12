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
import { OverflowMenu } from "../components/overflow-menu"
import { Entity } from "../components/entity"
import { MenuItem, MenuSeparator } from "../components/menu"
import { Meter } from "../components/meter"
import { NotificationBadge } from "../components/notification-badge"
import { PageHeader } from "../components/page-header"
import { RelativeTime } from "../components/relative-time"
import {
	Sidebar,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "../components/sidebar"
import { Grid, Page, Row, Stack } from "../layout"

// ---pattern-code---
// Edition status → Badge tone. Sable has no status vocabulary of its own;
// an app maps ITS states onto tones once, here, and every badge follows.
const STATUS_TONE = { live: "success", scheduled: "info", "sold-out": "edition", closed: "neutral" } as const
const STATUS_LABEL = { live: "Live", scheduled: "Scheduled", "sold-out": "Sold out", closed: "Closed" } as const
type EditionStatus = keyof typeof STATUS_TONE

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const shortDate = (offset: number) =>
	new Date(Date.now() + offset).toLocaleDateString("en-US", { month: "short", day: "numeric" })

const stats = [
	{ label: "Revenue", value: "$18,240", delta: "+8.2%", up: true, note: "vs. $16,857" },
	{ label: "Collects", value: "1,284", delta: "+3.1%", up: true, note: "182 first-time" },
	{ label: "Collectors", value: "312", delta: "+12.4%", up: true, note: "Best month yet" },
	{ label: "Sell-through", value: "64%", delta: "−1.8%", up: false, note: "6 open editions" },
]

const editions = [
	{ id: "ed_01", title: "Gold Rush", status: "live" as const, sold: 184, supply: 250, price: 48, released: -6 * DAY },
	{ id: "ed_02", title: "Quiet Harbor", status: "sold-out" as const, sold: 100, supply: 100, price: 120, released: -19 * DAY },
	{ id: "ed_03", title: "Dusk, no. 4", status: "live" as const, sold: 61, supply: 150, price: 64, released: -2 * DAY },
	{ id: "ed_04", title: "Tidewater", status: "live" as const, sold: 212, supply: 300, price: 36, released: -27 * DAY },
	{ id: "ed_05", title: "Salt Study", status: "closed" as const, sold: 38, supply: 75, price: 90, released: -44 * DAY },
	{ id: "ed_06", title: "Paper Moon", status: "sold-out" as const, sold: 50, supply: 50, price: 220, released: -58 * DAY },
	{ id: "ed_07", title: "Night Signal", status: "scheduled" as const, sold: 0, supply: 200, price: 56, released: 3 * DAY },
	{ id: "ed_08", title: "Low Tide, Blue", status: "closed" as const, sold: 72, supply: 120, price: 42, released: -71 * DAY },
	{ id: "ed_09", title: "Ember Field", status: "sold-out" as const, sold: 80, supply: 80, price: 140, released: -86 * DAY },
]
const editionCount = 24

const payout = {
	amount: 8214.6,
	date: 5 * DAY,
	lines: [
		{ label: "Sales", value: 9127.33 },
		{ label: "Platform fee (10%)", value: -912.73 },
		{ label: "Deposits to", value: "Checking ••4821" },
	],
}

const collectors = [
	{ id: "co_01", name: "Nina Simone", handle: "@nina", initials: "NS", pieces: 14, spent: 1460 },
	{ id: "co_02", name: "Grace Hopper", handle: "@grace", initials: "GH", pieces: 11, spent: 1128 },
	{ id: "co_03", name: "Frida Kahlo", handle: "@frida", initials: "FK", pieces: 9, spent: 942 },
	{ id: "co_04", name: "Mary Shelley", handle: "@mary", initials: "MS", pieces: 6, spent: 588 },
]

const upcoming = [
	{ id: "up_01", title: "Night Signal", detail: "Edition of 200 · $56", at: 3 * DAY },
	{ id: "up_02", title: "Tidewater, second printing", detail: "Edition of 100 · $40", at: 12 * DAY },
	{ id: "up_03", title: "Dusk, no. 5", detail: "Edition of 150 · $64", at: 26 * DAY },
	{ id: "up_04", title: "Quiet Harbor, artist proofs", detail: "Edition of 10 · $480", at: 34 * DAY },
]

const activity = [
	{ id: "ac_01", who: "Nina Simone", initials: "NS", what: "collected Gold Rush · 185 of 250", when: 2 * MIN },
	{ id: "ac_02", who: "Grace Hopper", initials: "GH", what: "collected Dusk, no. 4 · 61 of 150", when: 26 * MIN },
	{ id: "ac_03", who: "Frida Kahlo", initials: "FK", what: "tipped $20 on Tidewater", when: 1 * HOUR },
	{ id: "ac_04", who: "Mary Shelley", initials: "MS", what: "started following you", when: 3 * HOUR },
	{ id: "ac_05", who: "Nina Simone", initials: "NS", what: "set a reminder for Night Signal", when: 6 * HOUR },
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
					<BottomNavItem icon={<Icon name="image-stack" />} label="Editions" showLabel render={<a href="/editions" />} />
					<BottomNavItem icon={<Icon name="user" />} label="Collectors" showLabel render={<a href="/collectors" />} />
					<BottomNavItem icon={<Icon name="bell" />} label="Activity" showLabel render={<a href="/activity" />} />
					<BottomNavItem icon={<Icon name="gear" />} label="Settings" showLabel render={<a href="/settings" />} />
				</BottomNav>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<Row gap={1} align="center" className="px-3">
							<Icon name="gem" variant="solid" className="text-xl" />
							<span className="text-title-sm">Atelier</span>
						</Row>
					</SidebarHeader>
					<SidebarNav>
						<SidebarItem icon={<Icon name="grid" />} label="Overview" active render={<a href="/" />} />
						<SidebarItem icon={<Icon name="image-stack" />} label="Editions" render={<a href="/editions" />} />
						<SidebarItem icon={<Icon name="user" />} label="Collectors" render={<a href="/collectors" />} />
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
					description="Sales and collector activity for the last 30 days."
					actions={
						<Row gap={2}>
							<Button variant="outline">
								<Icon name="download" />
								Export
							</Button>
							<Button>
								<Icon name="plus" />
								New edition
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
							<CardTitle>Editions</CardTitle>
							<CardDescription>Sales across your releases, newest first.</CardDescription>
						</CardHeader>
						<CardContent flush className="mt-4 flex-1">
							<DataTable
								data={editions}
								rowKey={(row) => row.id}
								defaultSort={{ key: "released", direction: "desc" }}
								columns={[
									{ key: "title", header: "Edition", sortable: true, className: "text-label-md whitespace-nowrap" },
									{
										key: "status",
										header: "Status",
										cell: (row) => (
											<Badge appearance="plain" tone={STATUS_TONE[row.status as EditionStatus]} dot>
												{STATUS_LABEL[row.status as EditionStatus]}
											</Badge>
										),
									},
									{
										key: "sold",
										header: "Sold",
										sortable: true,
										sortValue: (row) => row.sold / row.supply,
										cell: (row) => (
											<Row gap={3} align="center" className="min-w-40">
												<Meter
													value={row.sold}
													max={row.supply}
													size="sm"
													tone={row.sold === row.supply ? "success" : "primary"}
													aria-label={`${row.title} sold`}
													getAriaValueText={(_, v) => `${v} of ${row.supply} sold`}
													className="flex-1"
												/>
												<span className="text-mono-caption whitespace-nowrap text-muted-foreground">
													{row.sold}/{row.supply}
												</span>
											</Row>
										),
									},
									{
										key: "revenue",
										header: "Revenue",
										align: "end",
										sortable: true,
										sortValue: (row) => row.sold * row.price,
										cell: (row) =>
											row.sold > 0 ? (
												<span className="text-mono-sm">{usd.format(row.sold * row.price)}</span>
											) : (
												<span className="text-mono-sm text-muted-foreground">—</span>
											),
									},
									{
										key: "released",
										header: "Release",
										align: "end",
										sortable: true,
										cell: (row) => (
											<span className="text-body-sm whitespace-nowrap text-muted-foreground">{shortDate(row.released)}</span>
										),
									},
								]}
							/>
						</CardContent>
						<CardFooter className="justify-between">
							<span className="text-caption text-muted-foreground">
								Showing {editions.length} of {editionCount} editions
							</span>
							<Button variant="ghost" size="sm" render={<a href="/editions" />}>
								View all editions
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
								<CardTitle>Top collectors</CardTitle>
								<CardDescription>By spend this month.</CardDescription>
								<CardAction>
									<Button variant="ghost" size="sm" render={<a href="/collectors" />}>
										View all
									</Button>
								</CardAction>
							</CardHeader>
							<CardList>
								{collectors.map((person) => (
									<Entity
										key={person.id}
										leading={<Avatar variant="art" size="sm" fallback={person.initials} alt="" />}
										title={person.name}
										subtitle={`${person.handle} · ${person.pieces} pieces`}
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
							<CardDescription>Scheduled to open to collectors.</CardDescription>
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
							<Button variant="outline" size="sm" render={<a href="/editions/new" />}>
								<Icon name="calendar" />
								Schedule a release
							</Button>
						</CardFooter>
					</Card>
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Activity</CardTitle>
							<CardDescription>Collects, tips, and follows.</CardDescription>
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
