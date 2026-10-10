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
	CardHeader,
	CardList,
	CardTitle,
} from "../components/card"
import { DataTable } from "../components/data-table"
import { Entity } from "../components/entity"
import { PageHeader } from "../components/page-header"
import { RelativeTime } from "../components/relative-time"
import {
	Sidebar,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "../components/sidebar"
import { Grid, Page, Row } from "../layout"

/** Deployment status → Badge tone. Sable has no status vocabulary of its own;
 *  an app maps ITS states onto tones once, here, and every badge follows. */
const STATUS_TONE = { ready: "standard", building: "warning", queued: "neutral", failed: "destructive" } as const
const statusTone = (status: keyof typeof STATUS_TONE) => STATUS_TONE[status]

// ---pattern-code---
const MIN = 60 * 1000
const HOUR = 60 * MIN

const stats = [
	{ label: "Revenue", value: "$12,480", delta: "+8.2%", up: true, note: "vs. previous 30 days" },
	{ label: "Collects", value: "1,284", delta: "+3.1%", up: true, note: "182 from new collectors" },
	{ label: "New collectors", value: "312", delta: "+12.4%", up: true, note: "best month this year" },
	{ label: "Sell-through", value: "64%", delta: "−1.8%", up: false, note: "across 48 active editions" },
]

const deployments = [
	{ id: "dp_01", project: "storefront", commit: "a41f2c9", status: "ready" as const, duration: "42s", updated: 2 * MIN },
	{ id: "dp_02", project: "api", commit: "7c03bd1", status: "building" as const, duration: "1m 08s", updated: 9 * MIN },
	{ id: "dp_03", project: "docs", commit: "e992a70", status: "queued" as const, duration: "—", updated: 12 * MIN },
	{ id: "dp_04", project: "worker", commit: "51b8e04", status: "failed" as const, duration: "18s", updated: 1 * HOUR },
	{ id: "dp_05", project: "storefront", commit: "90cc41a", status: "ready" as const, duration: "39s", updated: 3 * HOUR },
	{ id: "dp_06", project: "renderer", commit: "b7714dd", status: "ready" as const, duration: "2m 31s", updated: 5 * HOUR },
	{ id: "dp_07", project: "api", commit: "f30a9e2", status: "ready" as const, duration: "1m 02s", updated: 8 * HOUR },
]

const activity = [
	{ id: "ac_01", who: "Nina Simone", initials: "NS", what: "collected Gold Rush #42", when: 2 * MIN },
	{ id: "ac_02", who: "Grace Hopper", initials: "GH", what: "minted a 100-run edition", when: 26 * MIN },
	{ id: "ac_03", who: "Ada Lovelace", initials: "AL", what: "followed you", when: 1 * HOUR },
	{ id: "ac_04", who: "Mary Shelley", initials: "MS", what: "collected Quiet Harbor", when: 3 * HOUR },
	{ id: "ac_05", who: "Frida Kahlo", initials: "FK", what: "tipped 0.2 SOL on Process", when: 6 * HOUR },
]

export function DashboardPage() {
	return (
		<AppShell
			// Sidebar hides below lg, so the same destinations ride in the shell's
			// mobile slots — without them the route has no navigation under 1024px.
			header={<AppHeader title={<span className="text-title-sm">Atelier</span>} />}
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
						<span className="text-title-sm">Atelier</span>
					</SidebarHeader>
					<SidebarNav>
						<SidebarItem icon={<Icon name="grid" />} label="Overview" active render={<a href="/" />} />
						<SidebarItem icon={<Icon name="image-stack" />} label="Editions" render={<a href="/editions" />} />
						<SidebarItem icon={<Icon name="user" />} label="Collectors" render={<a href="/collectors" />} />
						<SidebarItem icon={<Icon name="bell" />} label="Activity" render={<a href="/activity" />} />
						<SidebarItem icon={<Icon name="gear" />} label="Settings" render={<a href="/settings" />} />
					</SidebarNav>
				</Sidebar>
			}
		>
			<Page max="wide" gap={4} className="py-6">
				<PageHeader
					title="Overview"
					description="Sales, collects, and edition activity for the last 30 days."
					actions={
						<Row gap={2}>
							<Button variant="outline">Export</Button>
							<Button>New edition</Button>
						</Row>
					}
				/>
				<Grid cols={{ base: 1, sm: 2, xl: 4 }} gap={3}>
					{stats.map((stat) => (
						<Card key={stat.label}>
							<CardHeader>
								<CardDescription>{stat.label}</CardDescription>
								<CardTitle className="text-mono-xl">{stat.value}</CardTitle>
								<CardAction>
									<Badge tone={stat.up ? "success" : "neutral"} size="sm">
										<Icon name={stat.up ? "chevron-up" : "chevron-down"} />
										{stat.delta}
									</Badge>
								</CardAction>
							</CardHeader>
							<CardContent>
								<p className="text-caption text-muted-foreground">{stat.note}</p>
							</CardContent>
						</Card>
					))}
				</Grid>
				<Grid cols={{ base: 1, xl: 3 }} gap={3}>
					<Card className="xl:col-span-2">
						<CardHeader>
							<CardTitle>Recent deployments</CardTitle>
							<CardDescription>Builds across every project, newest first.</CardDescription>
							<CardAction>
								<Button variant="ghost" size="sm" render={<a href="/deployments" />}>
									View all
								</Button>
							</CardAction>
						</CardHeader>
						<CardContent flush>
							<DataTable
								data={deployments}
								rowKey={(row) => row.id}
								columns={[
									{ key: "project", header: "Project", sortable: true, className: "text-label-md" },
									{ key: "commit", header: "Commit", cell: (row) => <span className="text-mono-caption text-muted-foreground">{row.commit}</span> },
									{ key: "status", header: "Status", cell: (row) => <Badge appearance="plain" tone={statusTone(row.status)} dot>{row.status}</Badge> },
									{ key: "duration", header: "Duration", align: "end", cell: (row) => <span className="text-mono-caption">{row.duration}</span> },
									{ key: "updated", header: "Updated", align: "end", cell: (row) => <RelativeTime date={Date.now() - row.updated} className="text-body-xs text-muted-foreground" /> },
								]}
							/>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Activity</CardTitle>
							<CardDescription>Collects, mints, and follows.</CardDescription>
						</CardHeader>
						<CardList>
							{activity.map((item) => (
								<Entity
									key={item.id}
									density="compact"
									leading={<Avatar size="sm" fallback={item.initials} alt={item.who} />}
									title={
										<span className="text-body-sm">
											<span className="text-label-md">{item.who}</span>{" "}
											<span className="text-muted-foreground">{item.what}</span>
										</span>
									}
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
