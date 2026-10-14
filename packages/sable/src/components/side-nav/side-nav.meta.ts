import type { ComponentMeta } from "../../lib/meta"

export const sideNavMeta: ComponentMeta = {
	name: "SideNav",
	summary:
		"A lightweight in-content vertical navigation list - the settings / docs sub-nav, distinct from the app-chrome Sidebar. Router-agnostic items, optional SideNavGroup sections, and an explicit active-state vocabulary for content rails or sidebar chrome.",
	keywords: [
		"side nav",
		"navigation",
		"settings nav",
		"sidebar",
		"rail",
		"docs nav",
		"active item",
		"group",
	],
	usage: {
		description:
			"Use SideNav for vertical navigation inside a settings page, documentation area, dashboard rail, or sidebar chrome. It is router-agnostic: compose items with render={<Link />} and choose activeVariant based on whether the nav sits in content or app chrome.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use aria-label on SideNav when a page contains more than one nav landmark.",
			},
			{
				guidance: "do",
				description:
					"Group related items with SideNavGroup when the rail has more than one conceptual area.",
			},
			{
				guidance: "do",
				description:
					"Use size='lg' and activeVariant='sidebar' when the nav is part of persistent app chrome.",
			},
			{
				guidance: "do",
				description:
					"Rows are rounded-sm, which nests in the usual rounded-lg p-2 frame. In any other rounded, padded frame give each item rounded-concentric-<outer>/<inset> — a same-radius row inset into a frame reads as a second system.",
			},
			{
				guidance: "dont",
				description:
					"Use SideNav for bottom mobile navigation; use BottomNav in AppShell's bottomNav slot.",
			},
			{
				guidance: "dont",
				description:
					"Mix content and sidebar active variants in the same rail unless individual items intentionally override the group.",
			},
		],
		anatomy: [
			{
				name: "Nav",
				required: true,
				description:
					"The landmark container for the vertical navigation list.",
			},
			{
				name: "Group",
				required: false,
				description:
					"Optional labelled cluster of related navigation items.",
			},
			{
				name: "Item",
				required: true,
				description:
					"Interactive row with label, optional icon, optional badge, and active state.",
			},
			{
				name: "Badge",
				required: false,
				description:
					"Trailing count or state indicator aligned to the row end.",
			},
		],
	},
	related: {
		components: ["Sidebar", "AppShell", "BottomNav", "Badge", "Icon"],
		patterns: ["SettingsPage", "DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "size",
			type: '"md" | "lg"',
			description:
				'Density shared by all items. "md" (default) = the lightweight in-content sub-nav; "lg" = chrome-weight (larger label + icon, roomier rows) for a rail that pairs with the app Sidebar.',
		},
		{
			name: "activeVariant",
			type: '"content" | "sidebar"',
			default: '"content"',
			description:
				'Active-state token vocabulary shared by all items. "content" uses bg-accent/text-accent-foreground for local rails inside the content area; "sidebar" uses bg-sidebar-accent/text-sidebar-accent-foreground for SideNavs rendered inside app chrome.',
		},
	],
	subcomponents: [
		{
			name: "SideNavItem",
			type: '{ label: ReactNode; icon?: ReactNode; active?: boolean; badge?: ReactNode; size?: "md" | "lg"; activeVariant?: "content" | "sidebar"; render?: useRender.RenderProp } + button props',
			description:
				"A single row. label is the row text; icon is an optional leading icon; active marks the current sub-section (active fill + aria-current=\"page\"); badge is a trailing node (e.g. a count) pushed to the row end; size and activeVariant override the enclosing SideNav per item; render composes another element, e.g. render={<Link to=\"/x\" />}.",
		},
		{
			name: "SideNavGroup",
			type: "{ label?: ReactNode } + div props",
			description:
				"A labelled section within a SideNav - groups settings into areas. label renders an optional sentence-case caption heading above the group's items.",
		},
	],
	a11y: [
		"SideNav renders a <nav> landmark; pair multiple navs with aria-label to distinguish them.",
		"The active item carries aria-current=\"page\".",
		"Items expose a focus-visible ring; the active state is reinforced by weight + fill, not colour alone.",
		'Use activeVariant="content" for local in-page rails and activeVariant="sidebar" when a SideNav is placed on Sidebar chrome.',
	],
	tokensUsed: [
		"muted",
		"muted-foreground",
		"foreground",
		"accent",
		"accent-foreground",
		"ring",
		"sidebar-foreground",
		"sidebar-accent",
		"sidebar-accent-foreground",
		"sidebar-ring",
	],
	examples: [
		{
			label: "Settings sub-nav",
			code: '<SideNav><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Account" render={<Link to="/settings/account" />} /><SideNavItem label="Notifications" render={<Link to="/settings/notifications" />} /></SideNav>',
		},
		{
			label: "Grouped",
			code: '<SideNav><SideNavGroup label="Account"><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Security" render={<Link to="/settings/security" />} /></SideNavGroup><SideNavGroup label="Workspace"><SideNavItem label="Members" render={<Link to="/settings/members" />} /></SideNavGroup></SideNav>',
		},
		{
			label: "Chrome-weight rail (size=lg)",
			code: '<SideNav size="lg"><SideNavItem label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem label="Billing" render={<Link to="/settings/billing" />} /><SideNavItem label="Security" render={<Link to="/settings/security" />} /></SideNav>',
		},
		{
			label: "Inside Sidebar chrome",
			code: '<SideNav size="lg" activeVariant="sidebar"><SideNavItem label="Overview" active render={<Link to="/" />} /><SideNavItem label="Reports" render={<Link to="/reports" />} /><SideNavItem label="Settings" render={<Link to="/settings" />} /></SideNav>',
		},
		{
			label: "Grouped with icons and badges",
			code: '<SideNav aria-label="Settings sections"><SideNavGroup label="Account"><SideNavItem icon={<Icon name="user" />} label="Profile" active render={<Link to="/settings/profile" />} /><SideNavItem icon={<Icon name="lock" />} label="Security" badge={<Badge tone="warning" size="sm">2</Badge>} render={<Link to="/settings/security" />} /></SideNavGroup><SideNavGroup label="Workspace"><SideNavItem icon={<Icon name="bell" />} label="Notifications" render={<Link to="/settings/notifications" />} /></SideNavGroup></SideNav>',
		},
	],
}
