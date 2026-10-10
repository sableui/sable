import type { ComponentMeta } from "../../lib/meta"

export const bottomNavMeta: ComponentMeta = {
	name: "BottomNav",
	summary:
		"Mobile bottom tab bar (fixed, hidden at lg), with home-indicator safe-area padding and evenly distributed BottomNavItem tabs. Items are router-agnostic via `render`.",
	status: "stable",
	keywords: [
		"bottom nav",
		"mobile nav",
		"tabs",
		"app navigation",
	],
	usage: {
		description: "Use BottomNav for a small set of top-level mobile destinations that should remain reachable with one thumb. Mount it through `<AppShell bottomNav={…}>` so the content area reserves matching bottom space; it hides at lg, where the Sidebar takes over.",
		bestPractices: [
			{
				guidance: "do",
				description: "Limit the nav to the primary destinations users switch between often.",
			},
			{
				guidance: "do",
				description: "Give every item a clear label (it is the accessible name), and turn on showLabel when the icons alone are not obvious.",
			},
			{
				guidance: "dont",
				description: "Do not use BottomNav for desktop navigation, dense menus, or page-local actions.",
			},
			{
				guidance: "dont",
				description: "Do not omit the safe-area padding by overriding its padding-bottom. On a device with a home indicator the last row of targets ends up under the gesture area, where taps dismiss the app instead.",
			},
		],
		anatomy: [
			{
				name: "BottomNav",
				required: true,
				description: "The fixed or anchored navigation container.",
			},
			{
				name: "BottomNavItem",
				required: true,
				description: "One destination with label, icon, and active state.",
			},
		],
	},
	related: {
		components: [
			"Sidebar",
			"SideNav",
			"AppHeader",
		],
	},
	props: [],
	subcomponents: [
		{
			name: "BottomNavItem",
			type: "{ label: string; icon?: ReactNode; active?: boolean; badge?: ReactNode; showLabel?: boolean; render?: useRender.RenderProp } + button props",
			description:
				"A single tab, placed as a child of BottomNav. `label` is the accessible name (aria-label) and optional visible label; `icon` is the glyph node (consumer swaps fill weight for the active state); `active` marks the current route (active ink + aria-current); `badge` overlays a corner dot/count on the icon; `showLabel` shows the label text beneath the icon — defaults to false (icon-only); turn it on when the icons alone are not self-evident; `render` renders as another element, e.g. render={<Link to=\"/x\" />}.",
		},
	],
	a11y: [
		"BottomNav renders a <nav> landmark.",
		"Each tab is a 44px minimum touch target with an aria-label.",
		"Active tab carries aria-current=\"page\".",
	],
	tokensUsed: ["background", "border", "muted-foreground", "foreground", "ring"],
	examples: [
		{
			label: "Tab bar",
			code: '<BottomNav><BottomNavItem icon={<Icon name="home" />} label="Home" active render={<Link to="/" />} /><BottomNavItem icon={<Icon name="bell" />} label="Notifications" badge={<NotificationBadge dot />} render={<Link to="/notifications" />} /></BottomNav>',
		},
		{
			label: "When NOT to use it",
			code: `// BottomNav is for 3–5 PEER destinations on a small viewport — the mobile
// counterpart to SideNav, not an action bar.

// ✗ Actions. A bottom bar of verbs (Save / Share / Delete) is a toolbar; it
//   competes with the OS gesture area and has no "current" state to show.
// ✗ More than five items. Past that, labels truncate and targets shrink below
//   the 44px floor — use a "More" destination that opens a Sheet.
// ✗ Nested navigation. BottomNav switches top-level sections only; drilling in
//   happens inside the section, with Breadcrumbs or a back affordance.

<AppShell bottomNav={<BottomNav>
  <BottomNavItem label="Home" icon={<Icon name="home" />} active />
  <BottomNavItem label="Search" icon={<Icon name="search" />} />
  <BottomNavItem label="Account" icon={<Icon name="user" />} />
</BottomNav>}>
  <Region max="feed">Route content</Region>
</AppShell>`,
		},
	],
}
