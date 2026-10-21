import type { PatternMeta } from "../lib/meta"

export const trackerPageMeta: PatternMeta = {
	name: "TrackerPage",
	summary:
		"Records workspace in the tool register: a Sidebar rail of grouped views ending in an account menu, a WorkspaceBar of Breadcrumbs over pill Tabs, a filter row, one grouped DataTable, and a docked inspector of PanelSection property rows with a pinned comment form. Below lg the rail and the inspector become sheets and a BottomNav takes the last row.",
	intent:
		"Reach for this when a team works through records in a dense tool — an issue tracker, a support queue, a pipeline: a grouped list, a docked inspector for the selected record, and a rail of views. For records a person reads and edits one at a time on a page, ListDetailPage is the page-register shape; for monitoring with headline numbers, DashboardPage.",
	keywords: [
		"issue tracker",
		"tracker",
		"linear",
		"like linear",
		"jira",
		"project management",
		"task manager",
		"support queue",
		"triage",
		"crm",
		"pipeline",
		"records workspace",
		"inspector",
		"backlog",
	],
	notes: [
		"Workspace sets the compact density for everything inside: 32px rail rows, 28px tables, 24px property fields. Nothing in the pattern sizes a control or a row by hand. The Overview tab is a reading view, so it sits in `<Density value=\"comfortable\">` and its prose gets page type back.",
		"The rail is Sable's own parts on one grid: SidebarBrand, SidebarGroup, SidebarItem and SidebarAccount share the icon and label columns. The account row is the trigger of the account Menu, which holds Settings, an Appearance submenu wired to useSableTheme (light, dark, system) and Sign out. No Settings button or badge sits in the footer.",
		"There is no Workspace `toolbar`: the bars belong to the list column, so the inspector runs the full height beside them. The first WorkspaceBar carries Breadcrumbs; the second carries pill Tabs, a view switch in chrome, which sits beside the bar's other controls rather than drawing a rule.",
		"One DataTable groups the rows (`groupBy`, `groups`): one header for every group, a StatusDot, a count and an add action per group header, and Done starting closed. The segmented ToggleGroup switches the grouping between status and assignee. Filtering to nothing swaps the table for an EmptyState with a Clear filters action.",
		"Workflow states map onto StatusDot tones once (`STATUSES`), so group headers and the status Select read from one place. A product with a richer status glyph keeps that one mapping and swaps the icon.",
		"The inspector is a Panel with `narrow=\"sheet\"`: docked at 320px from lg, a right sheet below it, its content rendered once. Below lg it opens only when a row is picked (`inspecting`), so a phone never loads with a sheet over the list. Properties are PanelSection + PropertyRow with xs Select triggers and an xs DatePicker; Activity uses RelativeTime; the comment Form is pinned under the scrolling body.",
		"The rail is a Panel with `narrow=\"sheet\" side=\"left\"`, opened from a `lg:hidden` menu button in the first bar; in the sheet the Sidebar fills its width. Workspace `bottomNav` reserves the BottomNav's row below lg, so the status bar ends above it.",
	],
	a11y: [
		"Workspace renders a skip link to the canvas (`Skip to issues`) and WorkspaceCanvas is the main landmark; the rail and the inspector are labelled complementary regions (`Workspace navigation`, `Issue details`), and as sheets they keep those labels as their dialog titles.",
		"The page has one level-1 heading (visually hidden; the breadcrumb shows the place) and the inspector's title is a level-2 heading.",
		"Group header rows are real buttons with aria-expanded; rows open the inspector from the keyboard (DataTable's row activation). Every icon-only action has an accessible name and a tooltip.",
		"Each SidebarGroup is a named group; the account row names the person, and its menu is a standard Menu with a radio group for the colour mode.",
	],
}
