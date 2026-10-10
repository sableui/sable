import { Icon } from "../icon"
import { AppHeader } from "../components/app-header"
import { AppShell } from "../components/app-shell"
import { BottomNav, BottomNavItem } from "../components/bottom-nav"
import { Button } from "../components/button"
import {
	Fieldset,
	FieldsetContent,
	FieldsetDescription,
	FieldsetFooter,
	FieldsetLegend,
} from "../components/fieldset"
import { Field, Form } from "../components/form"
import { Input } from "../components/input"
import { PageHeader } from "../components/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../components/select"
import {
	Sidebar,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "../components/sidebar"
import { Switch } from "../components/switch"
import { Textarea } from "../components/textarea"
import { Page } from "../layout"

// ---pattern-code---
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
