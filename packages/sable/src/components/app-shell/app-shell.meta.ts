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
		"inset",
		"inset frame",
		"floating panel",
		"rounded content",
		"scroll container",
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
				guidance: "do",
				description:
					"Use frame=\"inset\" for dense, multi-pane product apps — a CRM, an issue tracker, an AI workspace — where framing the content as one raised panel on the rail's ground helps it read as the workspace and the rail as chrome. Keep the Sidebar on surface=\"rail\" so its tint is the ground. Inset moves the page scroll from the window to <main id=\"main-content\"> on desktop: point scroll listeners, scroll restoration and scroll-to-top at that element, not window.",
			},
			{
				guidance: "dont",
				description:
					"Nest AppShell inside route cards or panels. It is page chrome, not local content.",
			},
			{
				guidance: "dont",
				description:
					"Wrap a route in its own h-full overflow-y-auto box inside an inset shell. main is already the page's scroll container; a second one traps the scrollbar inside a smaller box and breaks sticky headers and the skip link's scroll target. Scroll a genuinely separate pane (a list beside a detail view) with Scroller.",
				instead: ["Scroller"],
			},
			{
				guidance: "dont",
				description:
					"Combine frame=\"inset\" with a full-width header bar above the rail. The inset ground is the rail running the full height of the window; a bar across the top cuts it off. Use the flush frame with Sidebar surface=\"page\" for that layout.",
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
					"The route content landmark with id main-content. With frame=\"inset\", from lg it is a rounded, bordered panel that scrolls inside itself.",
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
		{
			name: "frame",
			type: '"flush" | "inset"',
			default: '"flush"',
			description:
				"How the desktop frame (lg and up) holds the content; below lg both are the same mobile layout with page scroll. \"flush\": main sits on the page beside the rail and the document scrolls. \"inset\": the shell fills the viewport and paints the shell-ground token (one step off the rail's surface, tunable with --theme-shell-ground) behind the rail and around the panel; main becomes a rounded-lg panel with a hairline border and shadow-sm, inset by a spacing step from the window edges, that scrolls inside itself (scrollbar-quiet) while the rail stays put. The Sidebar in the sidebar slot drops its right border and fills the row. main stays the #main-content target (tabIndex -1, so the skip link lands focus in the scroller) and the inline-size query container; sticky children stick to the panel's top; banners and the dock stay in flow, so the panel's bottom gap sits above a dock. With Sidebar surface=\"page\" the ground is the page colour and the panel's border alone lifts it.",
		},
	],
	subcomponents: [
		{
			name: "SkipLink",
			type: 'ComponentProps<"a">',
			description:
				"AppShell's skip link on its own, for a layout that is not an AppShell (a storefront with a top header). Put it first in the body and give the page's <main> the matching id: `<SkipLink />` then `<main id=\"main-content\" tabIndex={-1}>`. `href` defaults to #main-content, the label to \"Skip to content\".",
		},
	],
	a11y: [
		"Renders a skip link to #main-content as the first focusable element.",
		"Wraps content in a <main id=\"main-content\"> landmark.",
		"Slot components own their own ARIA (nav landmarks, labels).",
		"The dock follows <main> in DOM order, so keyboard and screen-reader users reach the player after the page content, not before it.",
		"With frame=\"inset\", <main> is the desktop scroll container and takes tabIndex -1: the skip link moves focus into it, so PageDown and the arrow keys scroll the content, without adding a tab stop.",
	],
	tokensUsed: ["background", "foreground", "primary", "primary-foreground", "sidebar", "shell-ground", "border"],
	examples: [
		{
			label: "Full frame",
			code: `<AppShell
  banners={<Banner tone="warning">Sync is delayed — changes may be slow to appear.</Banner>}
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
    <PageHeader title="Home" description="Latest posts from people you follow." />
  </Region>
</AppShell>`,
		},
		{
			label: "Inset frame",
			code: `<AppShell
  frame="inset"
  header={<AppHeader title="Pipeline" />}
  sidebar={
    <Sidebar>
      <SidebarHeader>
        <SidebarBrand mark={<Icon name="gem" variant="solid" />} label="Relay" render={<Link to="/" />} />
      </SidebarHeader>
      <SidebarNav>
        <SidebarItem icon={<Icon name="inbox" />} label="Inbox" render={<Link to="/inbox" />} />
        <SidebarItem icon={<Icon name="user" />} label="People" active render={<Link to="/people" />} />
        <SidebarItem icon={<Icon name="folder" />} label="Companies" render={<Link to="/companies" />} />
      </SidebarNav>
    </Sidebar>
  }
  bottomNav={
    <BottomNav>
      <BottomNavItem icon={<Icon name="inbox" />} label="Inbox" render={<Link to="/inbox" />} />
      <BottomNavItem icon={<Icon name="user" />} label="People" active render={<Link to="/people" />} />
      <BottomNavItem icon={<Icon name="folder" />} label="Companies" render={<Link to="/companies" />} />
    </BottomNav>
  }
>
  <Page max="wide" gap={4} className="py-6">
    <PageHeader
      title="People"
      description="Everyone in your pipeline, newest first."
      actions={<Button><Icon name="plus" />Add person</Button>}
    />
    <Card>
      <CardContent flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead numeric>Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Ada Lovelace</TableCell>
              <TableCell>Northwind</TableCell>
              <TableCell numeric>4</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Grace Hopper</TableCell>
              <TableCell>Harbor Labs</TableCell>
              <TableCell numeric>2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Page>
</AppShell>`,
		},
		{
			label: "SkipLink in a layout of your own",
			code: `<>
  <SkipLink />
  <header className="flex items-center justify-between px-(--page-inset) py-4">
    <Link to="/">Alder & Lune</Link>
    <Button variant="ghost" size="icon" aria-label="Search"><Icon name="search" /></Button>
  </header>
  <main id="main-content" tabIndex={-1}>
    <Region max="wide">
      <PageHeader title="Lighting" />
    </Region>
  </main>
</>`,
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
