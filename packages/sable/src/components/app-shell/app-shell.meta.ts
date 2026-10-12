import type { ComponentMeta } from "../../lib/meta"

export const appShellMeta: ComponentMeta = {
	name: "AppShell",
	summary:
		"The application frame: slots for status banners, a mobile header, a desktop sidebar, main content, a mobile bottom nav, a persistent dock (a now-playing or call bar), and floating overlays — plus a built-in skip link and #main-content target.",
	keywords: [
		"app shell",
		"layout",
		"frame",
		"sidebar",
		"header",
		"bottom nav",
		"mobile",
		"banners",
		"main",
		"dock",
		"player bar",
		"now playing",
		"persistent",
	],
	usage: {
		description:
			"Use AppShell as the outer product frame for authenticated or app-like experiences. It coordinates responsive chrome slots and guarantees a skip link plus main landmark; put route content inside the children and let AppHeader, Sidebar, BottomNav, and Banner own their own semantics.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use AppShell once around the route tree or major app area so the skip link and main landmark stay stable.",
			},
			{
				guidance: "do",
				description:
					"Pass app-wide outage or status messages through banners so they remain above the frame.",
			},
			{
				guidance: "do",
				description:
					"Use Region inside the main content to choose each route's reading width.",
			},
			{
				guidance: "do",
				description:
					"Wrap EVERY return of a route in its own Page or Region — including early returns for loading, empty and error states. AppShell's <main> deliberately carries no padding (it is a frame, and padding belongs to the region that chose the width), so a route that returns a bare spinner or error renders flush against the chrome. This is the most common conversion bug: the happy path gets a Page, the three early returns do not.",
			},
			{
				guidance: "dont",
				description:
					"Nest AppShell inside route cards or panels. It is page chrome, not local content.",
			},
			{
				guidance: "dont",
				description:
					"Put desktop-only navigation in the mobile header slot or mobile-only controls in the sidebar slot.",
			},
		],
		anatomy: [
			{
				name: "Banners",
				required: false,
				description:
					"Full-width app status messages rendered above the shell.",
			},
			{
				name: "Header",
				required: false,
				description:
					"Mobile top chrome, usually AppHeader.",
			},
			{
				name: "Sidebar",
				required: false,
				description:
					"Desktop navigation chrome, usually Sidebar.",
			},
			{
				name: "Main",
				required: true,
				description:
					"The route content landmark with id main-content.",
			},
			{
				name: "Bottom nav",
				required: false,
				description:
					"Mobile fixed navigation with reserved bottom space.",
			},
			{
				name: "Dock",
				required: false,
				description:
					"Persistent bottom chrome that outlives routes — a now-playing bar, a call bar. Sticky above the bottom nav; the desktop Sidebar shortens to clear it.",
			},
		],
	},
	related: {
		components: ["AppHeader", "Sidebar", "SideNav", "BottomNav", "Banner"],
		patterns: ["DashboardPage", "FeedPage", "SettingsPage"],
	},
	status: "stable",
	props: [
		{
			name: "banners",
			type: "ReactNode",
			description:
				"Full-width status banners pinned in flow above the frame (offline / chain-down).",
		},
		{
			name: "header",
			type: "ReactNode",
			description:
				"Mobile top header (e.g. AppHeader); expected to hide itself at lg.",
		},
		{
			name: "sidebar",
			type: "ReactNode",
			description:
				"Desktop side navigation (e.g. Sidebar); expected to hide itself below lg. Leading column of the body row.",
		},
		{
			name: "bottomNav",
			type: "ReactNode",
			description:
				"Mobile bottom navigation (e.g. BottomNav); fixed to the bottom edge. main reserves space for it.",
		},
		{
			name: "dock",
			type: "ReactNode",
			description:
				"Persistent chrome kept on screen across routes (a now-playing bar, an active-call bar, an upload tray). Full width, sticky to the bottom edge and above bottomNav on mobile; its height is published as --dock-height and the app Sidebar subtracts it. In flow, so main needs no reserved space. The contents paint their own surface and top border, and name themselves (e.g. <section aria-label=\"Player\">). Mount AppShell in a layout that survives navigation, or the playback restarts.",
		},
		{
			name: "overlays",
			type: "ReactNode",
			description:
				"Floating overlays — a message launcher, FAB, or modal mount points.",
		},
	],
	a11y: [
		"Renders a skip link to #main-content as the first focusable element.",
		"Wraps content in a <main id=\"main-content\"> landmark.",
		"Slot components own their own ARIA (nav landmarks, labels).",
		"The dock follows <main> in DOM order, so keyboard and screen-reader users reach the player after the page content, not before it.",
	],
	tokensUsed: ["background", "foreground", "primary", "primary-foreground"],
	examples: [
		{
			label: "Full frame",
			code: `<AppShell
  banners={<Banner tone="warning">Network congested — mints may be slow.</Banner>}
  header={<AppHeader title="Studio" />}
  sidebar={
    <Sidebar>
      <SidebarNav>
        <SidebarItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
        <SidebarItem icon={<Icon name="bell" />} label="Notifications" render={<Link to="/notifications" />} />
        <SidebarItem icon={<Icon name="gear" />} label="Settings" render={<Link to="/settings" />} />
      </SidebarNav>
    </Sidebar>
  }
  bottomNav={
    <BottomNav>
      <BottomNavItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} />
      <BottomNavItem icon={<Icon name="bell" />} label="Alerts" render={<Link to="/notifications" />} />
    </BottomNav>
  }
>
  <Region max="feed">
    <PageHeader title="Home" description="Latest posts from artists you follow." />
  </Region>
</AppShell>`,
		},
		{
			label: "Minimal (sidebar + content only)",
			code: `<AppShell
  sidebar={
    <Sidebar>
      <SidebarNav>
        <SidebarItem icon={<Icon name="home" />} label="Dashboard" active render={<Link to="/" />} />
      </SidebarNav>
    </Sidebar>
  }
>
  <Region max="wide">
    <PageHeader title="Dashboard" />
  </Region>
</AppShell>`,
		},
		{
			label: "Route content width",
			code: '<AppShell sidebar={<Sidebar><SidebarNav><SidebarItem icon={<Icon name="home" />} label="Home" active /></SidebarNav></Sidebar>}><Region max="content"><PageHeader title="Settings" description="Manage account and workspace preferences." /><Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent><Field label="Display name"><Input defaultValue="Nova" /></Field></CardContent></Card></Region></AppShell>',
		},
	],
}
