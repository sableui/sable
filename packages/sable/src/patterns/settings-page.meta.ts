import type { PatternMeta } from "../lib/meta"

export const settingsPageMeta: PatternMeta = {
	name: "SettingsPage",
	summary:
		"Stacked settings sections inside the app shell: a content-width region, one Fieldset card per concern (each with its own save), auto-wired Form/Field rows, and a destructive zone last.",
	intent:
		"Reach for this for account/profile/workspace settings and any 'edit a handful of grouped preferences' route. Not for a single short form (use AuthPage's centered form shape) or bulk record editing (use DashboardPage + DataTable).",
	notes: [
		"Region cap is `content` (896px): settings panes hold labeled rows and the occasional 2-up field, never a full grid.",
		"One Fieldset per concern, each with its own footer save — per-section saves beat one page-wide submit for settings.",
		"Field wires label/description/error a11y automatically; never hand-roll <label> + <input> pairs here.",
		"The destructive section is visually last, isolated in its own Fieldset with a destructive-variant action.",
		"Toggles use orientation=\"horizontal\" Fields so the label sits beside the Switch.",
		"Lives in the same AppShell as DashboardPage: Sidebar from lg up, AppHeader + BottomNav below it, with Settings marked active in both.",
	],
	a11y: [
		"AppShell provides the skip link and <main id=\"main-content\"> landmark; the active SidebarItem and BottomNavItem carry aria-current.",
		"Each section is a real <fieldset> with a <legend> (FieldsetLegend).",
		"Field auto-wires htmlFor/id, aria-describedby (description + error), aria-invalid, and required.",
		"The danger action is a real button labeled by its visible text — no icon-only destructive controls.",
	],
}
