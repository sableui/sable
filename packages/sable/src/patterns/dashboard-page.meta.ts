import type { PatternMeta } from "../lib/meta"

export const dashboardPageMeta: PatternMeta = {
	name: "DashboardPage",
	summary:
		"App-shell admin dashboard: a branded Sidebar with an account footer (AppHeader + BottomNav below lg), a KPI row, an edge-to-edge accounts table with seat-usage Meters, and supporting payout, top-customer, release and activity cards — the default shape for an operator or analytics home route.",
	intent:
		"Reach for this when a route's job is monitoring or managing many records (sales, orders, accounts, posts) with a few headline numbers. Not for reading-focused routes (use FeedPage) or single-record routes (use ListDetailPage's detail side).",
	notes: [
		"Region cap is `wide` (1280px): dashboards hold tables and multi-column grids, never a reading column.",
		"Hierarchy runs headline → records → context: KPI row, then the primary table beside its two closest companions (payout, top customers), then the lower-priority lists (upcoming, activity). Every row of the grid is filled so the route ends on content, not empty canvas.",
		"Stat cards: CardHeader carries the label (CardDescription) and the value; KPI values are `text-mono-xl` — the metric mono tier, tabular figures — never a heading tier. The trend Badge sits with its comparison note in CardContent, so the value keeps the full card width when the row folds to 2×2 on a phone.",
		"Stat cards use an explicit cols map (2 → 4) — a 4-stat row must fold to 2×2, never strand an orphan the way auto-fit can.",
		"The table runs flush to the card edges with `<CardContent flush>`, which hands the card's padding to the table (`--table-edge-px`), so the first and last columns line up with the CardHeader at any card density — never hand-set pl-6/pr-6. Numeric columns align end in mono; Table scrolls horizontally inside the card on narrow screens.",
		"Seats used / seats is a `Meter` (how full a known range is), not `Progress` (task progress). Status is `Badge appearance=\"plain\" dot`, with the app's own states mapped to tones once at the top of the file.",
		"Lists are Entity rows in CardList, inset to the card padding and divided by hairlines — never CardContent with hand-tuned px. A card that shares a grid row with a taller one becomes `flex flex-col` and pins its CardFooter with `mt-auto`.",
		"Brand and account live in the Sidebar: SidebarHeader holds the mark + wordmark, SidebarFooter holds the signed-in Entity with an OverflowMenu. Sidebar rebinds the page ink tokens to its own, so the Entity and OverflowMenu read correctly even when a theme paints the rail dark on a light page.",
		"The page has exactly one heading-1 (PageHeader); card titles are Title tier, not headings.",
		"Chrome (Sidebar) is outside the content grid; the Page region caps only content.",
		"Sidebar hides below lg, so the shell's header carries an AppHeader (brand + account) and its footer a BottomNav with the same destinations — never strand mobile users without navigation.",
	],
	a11y: [
		"AppShell provides the skip link and <main id=\"main-content\"> landmark.",
		"The active SidebarItem and BottomNavItem carry aria-current via `active`.",
		"DataTable headers are real <th>; sortable columns are announced.",
		"Each seat-usage Meter has an aria-label naming the account and aria-valuetext reading \"184 of 250 seats used\".",
		"Avatars beside a visible name use an empty alt so the name is not read twice.",
	],
}
