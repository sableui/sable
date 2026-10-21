import {
	Avatar,
	Button,
	Icon,
	Menu,
	MenuContent,
	MenuItem,
	MenuSeparator,
	MenuTrigger,
	NotificationBadge,
	Sidebar,
	SidebarAccount,
	SidebarBrand,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarItem,
	sidebarMeta,
	SidebarNav,
} from "@sableui/react"
import { useState } from "react"
import {
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** A bounded frame for the rail; `variant="inline"` keeps it visible and filling this height. */
function Frame({ children }: { children: React.ReactNode }) {
	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<div className="flex h-80">{children}</div>
		</div>
	)
}

function Nav({ collapsed }: { collapsed?: boolean }) {
	return (
		<SidebarNav>
			<SidebarItem icon={<Icon name="user" />} label="Profile" active />
			<SidebarItem
				icon={<Icon name="bell" />}
				label="Notifications"
				badge={collapsed ? undefined : <NotificationBadge count={3} />}
			/>
			<SidebarItem icon={<Icon name="gear" />} label="Settings" />
		</SidebarNav>
	)
}

function CollapsibleDemo() {
	const [collapsed, setCollapsed] = useState(false)
	return (
		<Frame>
			<Sidebar variant="inline" collapsed={collapsed}>
				<SidebarHeader>
					<span className="text-title-sm">{collapsed ? "S" : "Sable"}</span>
				</SidebarHeader>
				<Nav collapsed={collapsed} />
				<SidebarFooter>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setCollapsed((c) => !c)}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					>
						<Icon name={collapsed ? "chevron-right" : "chevron-left"} />
					</Button>
				</SidebarFooter>
			</Sidebar>
			<div className="flex-1 p-6 text-body-sm text-muted-foreground">
				Content area — it reflows as the rail collapses to icons.
			</div>
		</Frame>
	)
}

export function SidebarPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Sidebar"
				lede={ledeFor(sidebarMeta)}
			/>

			<Section
				title="Anatomy"
				description="A header, a scrolling list of destinations, and a footer pinned to the bottom."
			>
				<Frame>
					<Sidebar variant="inline">
						<SidebarHeader>
							<span className="text-title-sm">Sable</span>
						</SidebarHeader>
						<Nav />
						<SidebarFooter>
							<SidebarItem icon={<Icon name="logout" />} label="Sign out" />
						</SidebarFooter>
					</Sidebar>
					<div className="flex-1 p-6 text-body-sm text-muted-foreground">
						Main content area
					</div>
				</Frame>
			</Section>

			<Section
				title="Collapsible icon rail"
				description="Shrinks to icons, with labels moving into hover tooltips."
			>
				<CollapsibleDemo />
			</Section>

			<Section
				title="Groups and an account menu"
				description="SidebarGroup labels a run of items; SidebarAccount ends the rail as one row that opens the account menu. The brand, the items, the group labels and the account all sit on the same icon and label columns. Inside a compact Workspace the rail takes 32px rows."
			>
				<Frame>
					<Sidebar variant="inline">
						<SidebarHeader>
							<SidebarBrand mark={<Avatar shape="square" size="xs" fallback="F" alt="" />} label="Forma Studio" />
						</SidebarHeader>
						<SidebarNav>
							<SidebarItem icon={<Icon name="inbox" />} label="Inbox" badge={<span className="text-ui-num">4</span>} />
							<SidebarGroup label="Workspace">
								<SidebarItem icon={<Icon name="folder" />} label="Projects" active />
								<SidebarItem icon={<Icon name="users" />} label="Clients" />
							</SidebarGroup>
						</SidebarNav>
						<SidebarFooter>
							<Menu>
								<MenuTrigger
									render={
										<SidebarAccount
											avatar={<Avatar size="xs" fallback="EL" alt="" />}
											label="Emma Lee"
											detail="Forma Studio"
										/>
									}
								/>
								<MenuContent side="top" align="start">
									<MenuItem>Settings</MenuItem>
									<MenuItem>Keyboard shortcuts</MenuItem>
									<MenuSeparator />
									<MenuItem>Sign out</MenuItem>
								</MenuContent>
							</Menu>
						</SidebarFooter>
					</Sidebar>
					<div className="flex-1 p-6 text-body-sm text-muted-foreground">Main content area</div>
				</Frame>
			</Section>

			<MetaFooter meta={sidebarMeta} />
		</>
	)
}
