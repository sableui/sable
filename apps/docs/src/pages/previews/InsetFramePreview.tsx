import {
	AppHeader,
	AppShell,
	Avatar,
	Badge,
	BottomNav,
	BottomNavItem,
	Button,
	Card,
	CardContent,
	Entity,
	Icon,
	MenuItem,
	MenuSeparator,
	NotificationBadge,
	OverflowMenu,
	Page,
	PageHeader,
	Row,
	Sidebar,
	SidebarBrand,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@sableui/react"

/**
 * AppShell `frame="inset"` at full size — served at `/preview/app-shell-inset`
 * and embedded scaled on the App Shell page. A CRM people list: the rail sits
 * on its own tinted ground and the list scrolls inside the raised panel.
 */
const STAGE_TONE = { lead: "info", qualified: "1", proposal: "warning", won: "success", lost: "neutral" } as const
const STAGE_LABEL = { lead: "Lead", qualified: "Qualified", proposal: "Proposal", won: "Won", lost: "Lost" } as const
type Stage = keyof typeof STAGE_TONE

const NAMES = [
	"Ada Lovelace", "Grace Hopper", "Frida Kahlo", "Mary Shelley", "Nina Simone", "Hedy Lamarr",
	"Rosalind Franklin", "Katherine Johnson", "Dorothy Vaughan", "Lise Meitner", "Emmy Noether", "Joan Clarke",
	"Margaret Hamilton", "Radia Perlman", "Barbara Liskov", "Annie Easley", "Chien-Shiung Wu", "Mae Jemison",
	"Sophie Germain", "Hypatia Rhodes", "Ida Wells", "Zora Hurston", "Octavia Butler", "Ursula Le Guin",
]
const COMPANIES = ["Northwind", "Harbor Labs", "Brightline", "Tidewater Co.", "Saltworks", "Paper Moon", "Signal Studio", "Bluewater"]
const STAGES: Stage[] = ["lead", "qualified", "proposal", "won", "lost", "qualified", "proposal", "lead"]

const people = NAMES.map((name, i) => ({
	id: `p_${i}`,
	name,
	initials: name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2),
	email: `${name.split(" ")[0].toLowerCase()}@${COMPANIES[i % COMPANIES.length].toLowerCase().replace(/[^a-z]/g, "")}.com`,
	company: COMPANIES[i % COMPANIES.length],
	stage: STAGES[i % STAGES.length],
	value: 4000 + ((i * 3791) % 46000),
}))

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

const NAV = [
	{ icon: "inbox", label: "Inbox", badge: 6 },
	{ icon: "user", label: "People", active: true },
	{ icon: "folder", label: "Companies" },
	{ icon: "chart", label: "Reports" },
	{ icon: "gear", label: "Settings" },
] as const

export function InsetFramePreview() {
	return (
		<AppShell
			frame="inset"
			header={
				<AppHeader
					title={
						<Row gap={1} align="center">
							<Icon name="gem" variant="solid" className="text-xl" />
							<span className="text-title-sm">Relay</span>
						</Row>
					}
					actions={<Avatar variant="art" size="sm" fallback="AL" alt="Ada Lovelace" />}
				/>
			}
			bottomNav={
				<BottomNav aria-label="Primary">
					{NAV.map((item) => (
						<BottomNavItem
							key={item.label}
							icon={<Icon name={item.icon} />}
							label={item.label}
							showLabel
							active={"active" in item}
							render={<a href="#main-content" />}
						/>
					))}
				</BottomNav>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<SidebarBrand mark={<Icon name="gem" variant="solid" />} label="Relay" render={<a href="#main-content" />} />
					</SidebarHeader>
					<SidebarNav>
						{NAV.map((item) => (
							<SidebarItem
								key={item.label}
								icon={<Icon name={item.icon} />}
								label={item.label}
								active={"active" in item}
								badge={"badge" in item ? <NotificationBadge count={item.badge} tone="neutral" /> : undefined}
								render={<a href="#main-content" />}
							/>
						))}
					</SidebarNav>
					<SidebarFooter>
						<Entity
							className="[--entity-py:0]"
							leading={<Avatar variant="art" size="sm" fallback="AL" alt="" />}
							title="Ada Lovelace"
							subtitle="Relay Inc."
							action={
								<OverflowMenu label="Account" size="icon-sm">
									<MenuItem>Profile</MenuItem>
									<MenuItem>Workspace settings</MenuItem>
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
					title="People"
					description={`${people.length} people across ${COMPANIES.length} companies.`}
					actions={
						<Row gap={2}>
							<Button variant="outline">
								<Icon name="download" />
								Export
							</Button>
							<Button>
								<Icon name="plus" />
								Add person
							</Button>
						</Row>
					}
				/>
				<Card>
					<CardContent flush>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Company</TableHead>
									<TableHead>Stage</TableHead>
									<TableHead numeric>Deal value</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{people.map((person) => (
									<TableRow key={person.id}>
										<TableCell>
											<Entity
												className="[--entity-py:0]"
												leading={<Avatar variant="art" size="sm" fallback={person.initials} alt="" />}
												title={person.name}
												subtitle={person.email}
											/>
										</TableCell>
										<TableCell>{person.company}</TableCell>
										<TableCell>
											<Badge appearance="plain" tone={STAGE_TONE[person.stage]} dot>
												{STAGE_LABEL[person.stage]}
											</Badge>
										</TableCell>
										<TableCell numeric>{usd.format(person.value)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</Page>
		</AppShell>
	)
}
