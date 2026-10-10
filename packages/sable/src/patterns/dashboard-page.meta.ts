import type { PatternMeta } from "../lib/meta"

export const dashboardPageMeta: PatternMeta = {
	name: "DashboardPage",
	summary:
		"App-shell dashboard: sidebar chrome (AppHeader + BottomNav below lg), a wide content region, a stat-card row that breathes, and a data table — the default shape for operator/analytics home routes.",
	intent:
		"Reach for this when a route's job is monitoring or managing many records (metrics, deployments, orders, posts). Not for reading-focused routes (use FeedPage) or single-record routes (use ListDetailPage's detail side).",
	notes: [
		"Region cap is `wide` (1280px): dashboards hold tables and multi-column grids, never a reading column.",
		"Stat cards: CardHeader carries label (CardDescription) + value + trend badge (CardAction pins it top-right); KPI values are `text-mono-xl` — the metric mono tier, tabular figures — never a heading tier.",
		"Stat cards use an explicit cols map (1 → 2 → 4) — a 4-stat row must fold to 2×2, never strand an orphan the way auto-fit can.",
		"The table runs flush to the card edges with `<CardContent flush>`, which hands the card's padding to the table (`--table-edge-px`), so the first and last columns line up with the CardHeader at any card density — never hand-set pl-6/pr-6. Numeric columns align end in mono.",
		"The Activity list is Entity rows in CardList, inset to the card padding and divided by hairlines — the same list shape as ListDetailPage, never CardContent with hand-tuned px.",
		"Believable density is part of the pattern: 7 rows, commit hashes in mono-caption, RelativeTime muted — never 3 rows of filler.",
		"The page has exactly one heading-1 (PageHeader); card titles are Title tier, not headings.",
		"Chrome (Sidebar) is outside the content grid; the Page region caps only content.",
		"Sidebar hides below lg, so the shell's header carries an AppHeader and its footer a BottomNav with the same destinations — never strand mobile users without navigation.",
	],
	a11y: [
		"AppShell provides the skip link and <main id=\"main-content\"> landmark.",
		"The active SidebarItem and BottomNavItem carry aria-current via `active`.",
		"DataTable headers are real <th>; sortable columns are announced.",
	],
}
