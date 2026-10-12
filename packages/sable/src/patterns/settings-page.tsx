import { useState } from "react"
import { Icon } from "../icon"
import { AppHeader } from "../components/app-header"
import { AppShell } from "../components/app-shell"
import { Avatar } from "../components/avatar"
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
import { DestructiveActionModal } from "../components/destructive-action-modal"
import { OverflowMenu } from "../components/overflow-menu"
import { Entity } from "../components/entity"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { MenuItem, MenuSeparator } from "../components/menu"
import { NotificationBadge } from "../components/notification-badge"
import { PageHeader } from "../components/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import { SideNav, SideNavItem } from "../components/side-nav"
import {
	Sidebar,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "../components/sidebar"
import { Switch } from "../components/switch"
import { Textarea } from "../components/textarea"
import { Col, Columns, Grid, Page, Row, Stack } from "../layout"

// ---pattern-code---
const sections = [
	{ id: "profile", label: "Profile" },
	{ id: "notifications", label: "Notifications" },
	{ id: "payouts", label: "Payouts" },
	{ id: "account", label: "Account" },
]

const timezones = [
	{ value: "europe-london", label: "London (GMT+1)" },
	{ value: "europe-paris", label: "Paris (GMT+2)" },
	{ value: "america-new-york", label: "New York (GMT−4)" },
	{ value: "america-los-angeles", label: "Los Angeles (GMT−7)" },
	{ value: "asia-tokyo", label: "Tokyo (GMT+9)" },
]

const notifications = [
	{ name: "notifyCollects", title: "New collects", description: "When someone collects your work", on: true },
	{ name: "notifySoldOut", title: "Sold out", description: "When an edition sells its last copy", on: true },
	{ name: "notifyFollowers", title: "New followers", description: "When a collector follows you", on: false },
	{ name: "notifyDigest", title: "Weekly digest", description: "Sales and collectors, every Monday", on: true },
	{ name: "notifyProduct", title: "Product updates", description: "New Atelier features", on: false },
]

const payouts = [
	{ label: "Next payout", value: "$1,284.60", note: "Friday, Oct 16" },
	{ label: "Pending", value: "$412.00", note: "Clears in 7 days" },
	{ label: "Paid this year", value: "$18,920.00", note: "Across 214 collects" },
]

export function SettingsPage() {
	const [activeSection, setActiveSection] = useState("profile")
	const [deleteOpen, setDeleteOpen] = useState(false)

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
					<BottomNavItem icon={<Icon name="grid" />} label="Overview" showLabel render={<a href="/" />} />
					<BottomNavItem icon={<Icon name="image-stack" />} label="Editions" showLabel render={<a href="/editions" />} />
					<BottomNavItem icon={<Icon name="user" />} label="Collectors" showLabel render={<a href="/collectors" />} />
					<BottomNavItem icon={<Icon name="bell" />} label="Activity" showLabel render={<a href="/activity" />} />
					<BottomNavItem icon={<Icon name="gear" />} label="Settings" showLabel active render={<a href="/settings" />} />
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
						<SidebarItem icon={<Icon name="grid" />} label="Overview" render={<a href="/" />} />
						<SidebarItem icon={<Icon name="image-stack" />} label="Editions" render={<a href="/editions" />} />
						<SidebarItem icon={<Icon name="user" />} label="Collectors" render={<a href="/collectors" />} />
						<SidebarItem
							icon={<Icon name="bell" />}
							label="Activity"
							badge={<NotificationBadge count={4} tone="neutral" />}
							render={<a href="/activity" />}
						/>
						<SidebarItem icon={<Icon name="gear" />} label="Settings" active render={<a href="/settings" />} />
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
			{/* No `as="main"`: AppShell already renders <main id="main-content">. */}
			<Page max="wide" gap={4} className="py-6">
				<PageHeader
					title="Settings"
					description="Manage your profile, notifications, and payouts."
				/>
				<Columns gap={4}>
					{/* The section rail is a desktop aid; on mobile the sections simply stack. */}
					<Col span={{ base: 12, lg: 3 }} className="hidden lg:block">
						<SideNav aria-label="Settings sections" className="sticky top-6">
							{sections.map((section) => (
								<SideNavItem
									key={section.id}
									label={section.label}
									active={activeSection === section.id}
									onClick={() => setActiveSection(section.id)}
									render={<a href={`#${section.id}`} />}
								/>
							))}
						</SideNav>
					</Col>
					<Col span={{ base: 12, lg: 9 }}>
						<Stack gap={3}>
							<Card id="profile" className="scroll-mt-6">
								<CardHeader>
									<CardTitle render={<h2 />}>Profile</CardTitle>
									<CardDescription>How collectors see you on Atelier.</CardDescription>
								</CardHeader>
								{/* The one explicit save on the page: profile text is drafted, then
								    committed. Toggles below apply the moment they change. */}
								<Form onSubmit={(event) => event.preventDefault()} className="gap-0">
									<CardContent>
										<Stack gap={3}>
											<Row gap={2}>
												<Avatar variant="art" size="lg" fallback="AL" alt="Ada Lovelace" />
												<Stack gap={0.5} align="start">
													<Row gap={1}>
														<Button type="button" variant="outline" size="sm">
															Upload photo
														</Button>
														<Button type="button" variant="ghost" size="sm">
															Remove
														</Button>
													</Row>
													<p className="text-caption text-muted-foreground">
														Square PNG or JPG, at least 400 px.
													</p>
												</Stack>
											</Row>
											<Grid cols={{ base: 1, sm: 2 }} gap={3}>
												<Field label="Display name" name="displayName" required>
													<Input defaultValue="Ada Lovelace" autoComplete="name" />
												</Field>
												<Field label="Handle" name="handle" description="atelier.com/@ada" required>
													<Input defaultValue="ada" autoComplete="username" spellCheck={false} />
												</Field>
											</Grid>
											<Field label="Bio" name="bio" description="Shown on your profile and edition pages.">
												<Textarea
													rows={3}
													defaultValue="Generative artist working in plotted ink and code. New editions of 25 to 100 every month."
												/>
											</Field>
											<Grid cols={{ base: 1, sm: 2 }} gap={3}>
												<Field label="Timezone" name="timezone" description="Release times use this zone.">
													<Select defaultValue="europe-london" items={timezones}>
														<SelectTrigger />
														<SelectContent>
															{timezones.map((zone) => (
																<SelectItem key={zone.value} value={zone.value}>
																	{zone.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</Field>
											</Grid>
										</Stack>
									</CardContent>
									<CardFooter className="justify-end">
										<Button type="submit">Save profile</Button>
									</CardFooter>
								</Form>
							</Card>

							<Card id="notifications" className="scroll-mt-6">
								<CardHeader>
									<CardTitle render={<h2 />}>Notifications</CardTitle>
									<CardDescription>
										Email updates about your editions. Changes save automatically.
									</CardDescription>
								</CardHeader>
								<CardList>
									{notifications.map((item) => (
										<Entity
											key={item.name}
											title={item.title}
											subtitle={item.description}
											action={
												<Switch
													name={item.name}
													defaultChecked={item.on}
													aria-label={item.title}
												/>
											}
										/>
									))}
								</CardList>
							</Card>

							<Card id="payouts" className="scroll-mt-6">
								<CardHeader>
									<CardTitle render={<h2 />}>Payouts</CardTitle>
									<CardDescription>Paid in USD every Friday to Chase checking ••4821.</CardDescription>
									<CardAction>
										<Button variant="outline" size="sm" render={<a href="/settings/payouts" />}>
											Manage payouts
										</Button>
									</CardAction>
								</CardHeader>
								<CardContent>
									<Grid cols={{ base: 1, sm: 3 }} gap={3}>
										{payouts.map((stat) => (
											<Stack key={stat.label} gap={0.5}>
												<p className="text-body-sm text-muted-foreground">{stat.label}</p>
												<p className="text-mono-lg text-foreground">{stat.value}</p>
												<p className="text-caption text-muted-foreground">{stat.note}</p>
											</Stack>
										))}
									</Grid>
								</CardContent>
							</Card>

							<Card id="account" className="scroll-mt-6">
								<CardHeader>
									<CardTitle render={<h2 />}>Account</CardTitle>
									<CardDescription>Sign-in details and your data.</CardDescription>
								</CardHeader>
								<CardList>
									<Entity
										leading={<Icon name="mail" className="text-lg text-muted-foreground" />}
										title="Email"
										subtitle="ada@atelier.art"
										action={
											<Button variant="outline" size="sm">
												Change
											</Button>
										}
									/>
									<Entity
										leading={<Icon name="download" className="text-lg text-muted-foreground" />}
										title="Export data"
										subtitle="Editions, sales, and collectors"
										action={
											<Button variant="outline" size="sm">
												Export
											</Button>
										}
									/>
								</CardList>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle render={<h2 />}>Delete account</CardTitle>
									<CardDescription>
										Permanently remove your profile, editions, and sales history. Collectors keep
										the editions they own.
									</CardDescription>
								</CardHeader>
								<CardFooter className="justify-end">
									<Button variant="destructive" onClick={() => setDeleteOpen(true)}>
										Delete account
									</Button>
								</CardFooter>
							</Card>
						</Stack>
					</Col>
				</Columns>
			</Page>
			<DestructiveActionModal
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				title="Delete your account?"
				description="This permanently removes your profile, 12 editions, and sales history. Pending payouts are still sent. This can't be undone."
				confirmLabel="Delete account"
				confirmingLabel="Deleting…"
				confirmText="ada"
				onConfirm={() => setDeleteOpen(false)}
			/>
		</AppShell>
	)
}
