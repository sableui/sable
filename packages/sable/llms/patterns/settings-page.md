# SettingsPage

Account settings inside the app shell: a sticky SideNav section rail beside a column of section Cards — a Profile form with the page's one explicit save, Card + CardList + Entity rows with Switches that apply instantly, a read-only payouts summary, account rows, and a delete card confirmed through DestructiveActionModal.

**Intent:** Reach for this for account/profile/workspace settings and any 'edit a handful of grouped preferences' route. Not for a single short form (use AuthPage's centered form shape) or bulk record editing (use DashboardPage + DataTable).

## Notes

- Region cap is `wide`, split on a 12-column track: a 3-column SideNav rail and a 9-column section column. The rail fills the space a lone content-width column would leave empty and gives the page its table of contents.
- The rail is `SideNav` (the documented settings sub-nav), sticky, with in-page anchor items; it hides below lg, where the sections simply stack and the shell's BottomNav carries app navigation.
- One save model, stated in the copy: drafted text (the Profile form) commits through its single footer save; toggles apply the moment they change, and the Notifications description says so. Never pair a Switch with a Save button.
- Settings rows are Card + CardList + Entity with the Switch in `action` — the row owns its title and one-line description; keep descriptions short, because Entity truncates its subtitle.
- Each section is a Card whose CardTitle holds an h2, so the page has a real heading outline under PageHeader's h1; Cards carry the anchor id and `scroll-mt-*` so anchor jumps clear the top edge.
- Field wires label/description/error a11y automatically; never hand-roll <label> + <input> pairs. Pair fields side by side with Grid cols={{ base: 1, sm: 2 }}.
- The destructive action is last and isolated in its own Card, and it never acts directly: it opens DestructiveActionModal with type-to-confirm on the handle.
- Lives in the same AppShell as DashboardPage: Sidebar from lg up, AppHeader + BottomNav below it, with Settings marked active in both.

## Accessibility

- AppShell provides the skip link and <main id="main-content"> landmark; the active SidebarItem and BottomNavItem carry aria-current.
- The section rail is a labelled <nav> ("Settings sections") distinct from the primary navigation; its active item carries aria-current.
- Every section has an h2, so screen-reader heading navigation mirrors the rail.
- Each Switch takes its row title as aria-label, since the Entity title is not a <label>.
- Field auto-wires htmlFor/id, aria-describedby (description + error), aria-invalid, and required.
- DestructiveActionModal is an alertdialog: focus opens on Cancel, the backdrop does not dismiss, and the confirm stays disabled until the handle is typed.

## Source

```tsx
import { useState } from "react"
import { AppHeader, AppShell, Avatar, BottomNav, BottomNavItem, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardList, CardTitle, Col, Columns, DestructiveActionModal, DotsMenu, Entity, Field, Form, Grid, Icon, Input, MenuItem, MenuSeparator, NotificationBadge, Page, PageHeader, Row, Select, SelectContent, SelectItem, SelectTrigger, Sidebar, SidebarFooter, SidebarHeader, SidebarItem, SidebarNav, SideNav, SideNavItem, Stack, Switch, Textarea } from "@sableui/react"

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
					actions={<Avatar size="sm" fallback="AL" alt="Ada Lovelace" />}
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
					{/* Entity and DotsMenu ink with page tokens; a theme can paint the rail
					    dark on a light page, so this subtree reads the rail's ink instead. */}
					<SidebarFooter className="[--foreground:var(--sidebar-foreground)]">
						<Entity
							className="[--entity-py:0]"
							leading={<Avatar size="sm" fallback="AL" alt="" />}
							title="Ada Lovelace"
							action={
								<DotsMenu label="Account" size="icon-sm">
									<MenuItem render={<a href="/@ada" />}>View profile</MenuItem>
									<MenuItem render={<a href="/settings" />}>Settings</MenuItem>
									<MenuSeparator />
									<MenuItem>Sign out</MenuItem>
								</DotsMenu>
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
									<CardTitle>
										<h2>Profile</h2>
									</CardTitle>
									<CardDescription>How collectors see you on Atelier.</CardDescription>
								</CardHeader>
								{/* The one explicit save on the page: profile text is drafted, then
								    committed. Toggles below apply the moment they change. */}
								<Form onSubmit={(event) => event.preventDefault()} className="gap-0">
									<CardContent>
										<Stack gap={3}>
											<Row gap={2}>
												<Avatar size="lg" fallback="AL" alt="Ada Lovelace" />
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
									<CardTitle>
										<h2>Notifications</h2>
									</CardTitle>
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
									<CardTitle>
										<h2>Payouts</h2>
									</CardTitle>
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
									<CardTitle>
										<h2>Account</h2>
									</CardTitle>
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
									<CardTitle>
										<h2>Delete account</h2>
									</CardTitle>
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
```
