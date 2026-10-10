# SettingsPage

Stacked settings sections inside the app shell: a content-width region, one Fieldset card per concern (each with its own save), auto-wired Form/Field rows, and a destructive zone last.

**Intent:** Reach for this for account/profile/workspace settings and any 'edit a handful of grouped preferences' route. Not for a single short form (use AuthPage's centered form shape) or bulk record editing (use DashboardPage + DataTable).

## Notes

- Region cap is `content` (896px): settings panes hold labeled rows and the occasional 2-up field, never a full grid.
- One Fieldset per concern, each with its own footer save — per-section saves beat one page-wide submit for settings.
- Field wires label/description/error a11y automatically; never hand-roll <label> + <input> pairs here.
- The destructive section is visually last, isolated in its own Fieldset with a destructive-variant action.
- Toggles use orientation="horizontal" Fields so the label sits beside the Switch.
- Lives in the same AppShell as DashboardPage: Sidebar from lg up, AppHeader + BottomNav below it, with Settings marked active in both.

## Accessibility

- AppShell provides the skip link and <main id="main-content"> landmark; the active SidebarItem and BottomNavItem carry aria-current.
- Each section is a real <fieldset> with a <legend> (FieldsetLegend).
- Field auto-wires htmlFor/id, aria-describedby (description + error), aria-invalid, and required.
- The danger action is a real button labeled by its visible text — no icon-only destructive controls.

## Source

```tsx
import { AppHeader, AppShell, BottomNav, BottomNavItem, Button, Field, Fieldset, FieldsetContent, FieldsetDescription, FieldsetFooter, FieldsetLegend, Form, Icon, Input, Page, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, Sidebar, SidebarHeader, SidebarItem, SidebarNav, Switch, Textarea } from "@sableui/react"

export function SettingsPage() {
	return (
		<AppShell
			// Sidebar hides below lg, so the same destinations ride in the shell's
			// mobile slots — without them the route has no navigation under 1024px.
			header={<AppHeader title={<span className="text-title-sm">Atelier</span>} />}
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
						<span className="text-title-sm">Atelier</span>
					</SidebarHeader>
					<SidebarNav>
						<SidebarItem icon={<Icon name="grid" />} label="Overview" render={<a href="/" />} />
						<SidebarItem icon={<Icon name="image-stack" />} label="Editions" render={<a href="/editions" />} />
						<SidebarItem icon={<Icon name="user" />} label="Collectors" render={<a href="/collectors" />} />
						<SidebarItem icon={<Icon name="bell" />} label="Activity" render={<a href="/activity" />} />
						<SidebarItem icon={<Icon name="gear" />} label="Settings" active render={<a href="/settings" />} />
					</SidebarNav>
				</Sidebar>
			}
		>
			{/* No `as="main"`: AppShell already renders <main id="main-content">. */}
			<Page max="content" gap={4} className="py-6">
				<PageHeader
					title="Settings"
					description="Your profile, notifications, and account controls."
				/>
				<Form onSubmit={(event) => event.preventDefault()}>
					<Fieldset>
						<FieldsetLegend>Profile</FieldsetLegend>
						<FieldsetDescription>How you appear across the app.</FieldsetDescription>
						<FieldsetContent>
							<Field label="Display name" required>
								<Input name="displayName" defaultValue="ada" />
							</Field>
							<Field label="Bio" description="Shown on your public profile.">
								<Textarea name="bio" rows={3} placeholder="Tell collectors who you are" />
							</Field>
							<Field label="Timezone">
								<Select defaultValue="utc" name="timezone">
									<SelectTrigger />
									<SelectContent>
										<SelectItem value="utc">UTC</SelectItem>
										<SelectItem value="est">Eastern (UTC−5)</SelectItem>
										<SelectItem value="pst">Pacific (UTC−8)</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</FieldsetContent>
						<FieldsetFooter>
							<Button type="submit">Save profile</Button>
						</FieldsetFooter>
					</Fieldset>
				</Form>
				<Form onSubmit={(event) => event.preventDefault()}>
					<Fieldset>
						<FieldsetLegend>Notifications</FieldsetLegend>
						<FieldsetDescription>What we email you about.</FieldsetDescription>
						<FieldsetContent>
							<Field label="New collector alerts" orientation="horizontal">
								<Switch name="collectorAlerts" defaultChecked />
							</Field>
							<Field label="Weekly digest" orientation="horizontal">
								<Switch name="weeklyDigest" />
							</Field>
						</FieldsetContent>
						<FieldsetFooter>
							<Button type="submit">Save notifications</Button>
						</FieldsetFooter>
					</Fieldset>
				</Form>
				<Fieldset>
					<FieldsetLegend>Danger zone</FieldsetLegend>
					<FieldsetDescription>
						Deleting your account removes your posts and collections permanently.
					</FieldsetDescription>
					<FieldsetFooter>
						<Button variant="destructive">Delete account</Button>
					</FieldsetFooter>
				</Fieldset>
			</Page>
		</AppShell>
	)
}
```
