import type { PatternMeta } from "../lib/meta"

export const settingsPageMeta: PatternMeta = {
	name: "SettingsPage",
	summary:
		"Account settings inside the app shell: a sticky SideNav section rail beside a column of section Cards — a Profile form with the page's one explicit save, Card + CardList + Entity rows with Switches that apply instantly, a read-only payouts summary, account rows, and a delete card confirmed through DestructiveActionModal.",
	intent:
		"Reach for this for account/profile/workspace settings and any 'edit a handful of grouped preferences' route. Not for a single short form (use AuthPage's centered form shape) or bulk record editing (use DashboardPage + DataTable).",
	notes: [
		"Region cap is `wide`, split on a 12-column track: a 3-column SideNav rail and a 9-column section column. The rail fills the space a lone content-width column would leave empty and gives the page its table of contents.",
		"The rail is `SideNav` (the documented settings sub-nav), sticky, with in-page anchor items; it hides below lg, where the sections simply stack and the shell's BottomNav carries app navigation.",
		"One save model, stated in the copy: drafted text (the Profile form) commits through its single footer save; toggles apply the moment they change, and the Notifications description says so. Never pair a Switch with a Save button.",
		"Settings rows are Card + CardList + Entity with the Switch in `action` — the row owns its title and one-line description; keep descriptions short, because Entity truncates its subtitle.",
		"Each section is a Card whose CardTitle holds an h2, so the page has a real heading outline under PageHeader's h1; Cards carry the anchor id and `scroll-mt-*` so anchor jumps clear the top edge.",
		"Field wires label/description/error a11y automatically; never hand-roll <label> + <input> pairs. Pair fields side by side with Grid cols={{ base: 1, sm: 2 }}.",
		"The destructive action is last and isolated in its own Card, and it never acts directly: it opens DestructiveActionModal with type-to-confirm on the handle.",
		"Lives in the same AppShell as DashboardPage: Sidebar from lg up, AppHeader + BottomNav below it, with Settings marked active in both.",
	],
	a11y: [
		"AppShell provides the skip link and <main id=\"main-content\"> landmark; the active SidebarItem and BottomNavItem carry aria-current.",
		"The section rail is a labelled <nav> (\"Settings sections\") distinct from the primary navigation; its active item carries aria-current.",
		"Every section has an h2, so screen-reader heading navigation mirrors the rail.",
		"Each Switch takes its row title as aria-label, since the Entity title is not a <label>.",
		"Field auto-wires htmlFor/id, aria-describedby (description + error), aria-invalid, and required.",
		"DestructiveActionModal is an alertdialog: focus opens on Cancel, the backdrop does not dismiss, and the confirm stays disabled until the handle is typed.",
	],
}
