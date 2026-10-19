/**
 * The component taxonomy — a single, ordered, enforced source of truth.
 *
 * Before this file the grouping lived only as a hand-maintained array inside the
 * docs app's `App.tsx`. That had two consequences, both of which had already
 * happened:
 *
 * 1. `registry.json` carried NO grouping at all, so every agent consuming the
 *    machine-readable catalog got a flat list of every component with no sense of
 *    which ones are siblings.
 * 2. Nothing checked that a shipped component was filed anywhere, so
 *    `PanelGroup`, `PanelSection`, `ScrubField` and `StatusBar` shipped in 0.31.0
 *    with no nav entry and no docs page and nobody noticed for four releases.
 *
 * `build-registry` now validates this file against the components on disk in both
 * directions and fails on any drift, and the docs nav is generated from it. The
 * taxonomy is a contract like the token and icon contracts, not a convenience.
 *
 * ── Two axes, deliberately separate ──────────────────────────────────────────
 *
 * `GROUP` answers *what kind of thing is this* (its role). `REGISTER` answers
 * *which surface language does it speak*. Keeping them apart is the point: the
 * old taxonomy had a "Workspace" group sitting alongside role groups, so any
 * workspace form control had two equally valid homes and no rule to choose. That
 * is not hypothetical — `ColorField` was filed under Workspace even though its
 * own design note called it "generic form vocabulary, not domain logic".
 *
 * A component's register is now a tag it carries into whichever role group it
 * belongs to, and Workspace is no longer a group.
 */

/**
 * A component's role — the axis the navigation is organised by.
 *
 * Sized for FINDING (Oct 2026 review). The previous nine groups were sound by
 * kind but three of them had grown past what a reader scans: Forms (27), Data
 * Display (21), Status (17). A designer looking for a checkbox, a badge or a
 * spinner had to read a long list to find it. So the big groups split along
 * the line people already search by — Material's "Selection" vs "Text inputs",
 * "Badges", "Loading" — and every group now holds 4–14 members.
 *
 * Alphabetical, groups and members alike. A reading order ("do → capture →
 * overlay → …") has to be learned before it helps; A–Z is known already, so a
 * reader scanning for "Selection" or "Status" knows where to look without
 * knowing the system. A test keeps both lists sorted.
 */
export const COMPONENT_GROUPS = [
	"Actions",
	"Badges & pills",
	"Charts",
	"Chat & AI",
	"Containers",
	"Data display",
	"Forms",
	"Layout",
	"Loading & progress",
	"Media & mockups",
	"Navigation",
	"Overlays",
	"Selection",
	"Status",
	"Text & code",
] as const

export type ComponentGroup = (typeof COMPONENT_GROUPS)[number]

/** Which surface language a component speaks. */
export type ComponentRegister = "page" | "workspace" | "either"

/**
 * Every shipped component, filed once. The register is a tag, never a group.
 */
export const COMPONENT_TAXONOMY: Record<string, [ComponentGroup, ComponentRegister]> = {
	/* ── Actions ──────────────────────────────────────────────────────────────
	   Things whose whole purpose is to DO something on activation. `OverflowMenu`
	   is here, not in Overlays: it is the "more actions" button a reader reaches
	   for as an action (and the options half of Button's "main action with
	   options" pattern) — that its list opens in a layer is how it works, not
	   what it is. Copying is `useCopy` on a Button, not a component. */
	Button: ["Actions", "either"],
	ButtonGroup: ["Actions", "either"],
	ConfirmButton: ["Actions", "either"],
	LikeButton: ["Actions", "either"],
	Menubar: ["Actions", "either"],
	OverflowMenu: ["Actions", "either"],
	ReactionPicker: ["Actions", "either"],
	Toolbar: ["Actions", "either"],

	/* ── Forms ────────────────────────────────────────────────────────────────
	   Typing or entering a value, and the structure a form is built from.
	   Choosing from options moved out to Selection. `ColorField` and
	   `ScrubField` are form vocabulary that happens to be used in tool chrome —
	   the register tag carries that, not the group. */
	Calendar: ["Forms", "either"],
	ColorField: ["Forms", "either"],
	DatePicker: ["Forms", "either"],
	Fieldset: ["Forms", "either"],
	FileDropzone: ["Forms", "page"],
	Form: ["Forms", "either"],
	Input: ["Forms", "either"],
	InputGroup: ["Forms", "either"],
	Label: ["Forms", "either"],
	NumberField: ["Forms", "either"],
	OtpField: ["Forms", "either"],
	ScrubField: ["Forms", "workspace"],
	SearchInput: ["Forms", "either"],
	Textarea: ["Forms", "either"],

	/* ── Selection ────────────────────────────────────────────────────────────
	   Choosing from options: on/off, one of many, several of many, a point on a
	   range. Split from Forms so a 27-item group became two a reader can scan.
	   `Toggle` sits with `Switch`, which its own meta calls its sibling;
	   `ThemeSelector`/`ThemeSwitcher` capture a stored preference. */
	Checkbox: ["Selection", "either"],
	CheckboxCard: ["Selection", "page"],
	RadioCard: ["Selection", "page"],
	Combobox: ["Selection", "either"],
	DisclosurePicker: ["Selection", "either"],
	FontPicker: ["Selection", "either"],
	Radio: ["Selection", "either"],
	Select: ["Selection", "either"],
	Slider: ["Selection", "either"],
	Switch: ["Selection", "either"],
	ThemeSelector: ["Selection", "either"],
	ThemeSwitcher: ["Selection", "either"],
	Toggle: ["Selection", "either"],

	/* ── Overlays ─────────────────────────────────────────────────────────────
	   Anything that renders above the page in its own layer. */
	CaretMenu: ["Overlays", "either"],
	CommandMenu: ["Overlays", "either"],
	ContextCard: ["Overlays", "page"],
	ContextMenu: ["Overlays", "either"],
	DestructiveActionModal: ["Overlays", "either"],
	Dialog: ["Overlays", "either"],
	Feedback: ["Overlays", "page"],
	Menu: ["Overlays", "either"],
	Popover: ["Overlays", "either"],
	SettingsMenu: ["Overlays", "either"],
	Sheet: ["Overlays", "either"],
	Tooltip: ["Overlays", "either"],

	/* ── Navigation ───────────────────────────────────────────────────────────
	   Getting somewhere else, or to more of the same thing. `Pagination` and
	   `ShowMore` (and a `Button` with `loading` for load-more) reveal more content and
	   stay together; `Tree` is the hierarchy browser. */
	Breadcrumbs: ["Navigation", "either"],
	BottomNav: ["Navigation", "page"],
	NavigationMenu: ["Navigation", "page"],
	Pagination: ["Navigation", "either"],
	SectionRail: ["Navigation", "page"],
	ShowMore: ["Navigation", "page"],
	SideNav: ["Navigation", "page"],
	Sidebar: ["Navigation", "page"],
	Tabs: ["Navigation", "either"],
	Tree: ["Navigation", "workspace"],

	/* ── Layout ───────────────────────────────────────────────────────────────
	   The frame a product lives in, in either register (renamed from "Shells":
	   a designer looks for the app header and panels under Layout). The layout
	   PRIMITIVES — Stack, Row, Region, Grid — are foundations, not components,
	   and live on the Grid & layout page. */
	AppHeader: ["Layout", "page"],
	AppShell: ["Layout", "page"],
	PageHeader: ["Layout", "page"],
	PanelGroup: ["Layout", "workspace"],
	PanelSection: ["Layout", "workspace"],
	SectionHeader: ["Layout", "page"],
	StatusBar: ["Layout", "workspace"],
	Workspace: ["Layout", "workspace"],

	/* ── Containers ───────────────────────────────────────────────────────────
	   A box that holds other content: bounds it, folds it, scrolls it, divides
	   it. `Card` moved here from Data Display — people look for a card as a
	   container, not as a way of showing data. */
	Accordion: ["Containers", "either"],
	Card: ["Containers", "page"],
	Collapsible: ["Containers", "either"],
	Scroller: ["Containers", "either"],
	Separator: ["Containers", "either"],

	/* ── Charts ───────────────────────────────────────────────────────────────
	   Plotted data for dashboards, landing pages and decks: SVG on the theme's
	   tones, with arrival and data-change motion and a data table for assistive
	   tech. Data-heavy apps (streaming, zoom, thousands of points) belong on a
	   charting library. `SegmentedBar` and `Meter` stay in Data display: they
	   are readings, not plots. */
	AreaChart: ["Charts", "page"],
	BarChart: ["Charts", "page"],
	LineChart: ["Charts", "page"],
	PieChart: ["Charts", "page"],
	RadarChart: ["Charts", "page"],
	RadialChart: ["Charts", "page"],
	Sparkline: ["Charts", "either"],
	ActivityHeatmap: ["Charts", "either"],

	/* ── Data display ─────────────────────────────────────────────────────────
	   Showing records and readings. `Meter` (bar or ring) is here: it shows a
	   value within a known range (a reading), which is not loading or progress. */
	Avatar: ["Data display", "either"],
	DataTable: ["Data display", "either"],
	DateTile: ["Data display", "page"],
	Entity: ["Data display", "either"],
	GlidingHighlight: ["Data display", "either"],
	Meter: ["Data display", "either"],
	NumberTicker: ["Data display", "either"],
	RelativeTime: ["Data display", "either"],
	SegmentedBar: ["Data display", "either"],
	Table: ["Data display", "either"],

	/* ── Badges & pills ───────────────────────────────────────────────────────
	   Small labelled shapes. `Badge` (with `dot`) / `StatusDot` belong HERE, not in
	   Status: an earlier audit moved them next to Toast/Banner and the crossing
	   links went UP (14 → 21) — they relate to Badge, Pill and Entity, which is
	   a badge-shaped argument. This group makes that finding the obvious home. */
	Badge: ["Badges & pills", "either"],
	NotificationBadge: ["Badges & pills", "either"],
	Pill: ["Badges & pills", "page"],
	StatusDot: ["Badges & pills", "either"],

	/* ── Text & code ──────────────────────────────────────────────────────────
	   Presenting a string: code, a shortcut, a truncated path, a copyable value. */
	Code: ["Text & code", "either"],
	CodeBlock: ["Text & code", "either"],
	Kbd: ["Text & code", "either"],
	MiddleTruncate: ["Text & code", "either"],

	/* ── Status ───────────────────────────────────────────────────────────────
	   Telling the user what happened or what state they are in: alerts,
	   callouts, empty and error states. `Note` (a callout) joins Banner and
	   Toast — it is where a designer looks for an "alert" box. */
	Banner: ["Status", "page"],
	EmptyState: ["Status", "page"],
	InlineStatus: ["Status", "either"],
	Note: ["Status", "page"],
	Toast: ["Status", "either"],

	/* ── Loading & progress ───────────────────────────────────────────────────
	   Waiting, and how far along something is. */
	PageLoader: ["Loading & progress", "page"],
	Progress: ["Loading & progress", "either"],
	Skeleton: ["Loading & progress", "either"],
	Spinner: ["Loading & progress", "either"],
	Stepper: ["Loading & progress", "page"],

	/* ── Chat & AI ────────────────────────────────────────────────────────────
	   A deliberate exception to "group by kind", made for finding: someone
	   building a conversation looks for one place, and these were scattered
	   across five groups. The rule that keeps it from becoming a second home for
	   everything: a member exists ONLY inside a conversation. A Button used in a
	   chat is still a Button; a Message has no meaning outside one. */
	Attachment: ["Chat & AI", "either"],
	Bubble: ["Chat & AI", "either"],
	ChatComposer: ["Chat & AI", "either"],
	Marker: ["Chat & AI", "either"],
	Message: ["Chat & AI", "either"],
	MessageScroller: ["Chat & AI", "either"],
	StreamingText: ["Chat & AI", "either"],
	ThinkingOrb: ["Chat & AI", "either"],
	ToolCall: ["Chat & AI", "either"],

	/* ── Media & mockups ──────────────────────────────────────────────────────
	   Presenting images and video: players, galleries, scrolling strips, and the
	   device frames a product image sits in. `Video` was filed as a mockup; it is
	   a player, and it sits with the other media now. */
	Browser: ["Media & mockups", "page"],
	Carousel: ["Media & mockups", "page"],
	GradientArt: ["Media & mockups", "either"],
	Marquee: ["Media & mockups", "page"],
	MediaImage: ["Media & mockups", "either"],
	MediaTile: ["Media & mockups", "page"],
	Phone: ["Media & mockups", "page"],
	Video: ["Media & mockups", "page"],
}

/** Every component in a group, alphabetical — the order the docs nav renders. */
export function componentsInGroup(group: ComponentGroup): string[] {
	return Object.entries(COMPONENT_TAXONOMY)
		.filter(([, [g]]) => g === group)
		.map(([name]) => name)
		// By the label a reader sees ("Side Nav" before "Sidebar"), not the
		// export name, or the sidebar looks out of order.
		.sort((a, b) => componentLabel(a).localeCompare(componentLabel(b)))
}

/** `PanelGroup` → `panel-group`. The docs route and the llms/ filename. */
export function componentSlug(name: string): string {
	return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

/**
 * Nav labels that are deliberately shorter than the component name. Everything
 * else derives from the name, so this stays a list of exceptions rather than a
 * second copy of the roster.
 */
const LABEL_OVERRIDES: Record<string, string> = {
	DestructiveActionModal: "Destructive Modal",
	OtpField: "OTP Field",
}

/** `PanelGroup` → `Panel Group`, honouring the shortened and acronym-cased exceptions. */
export function componentLabel(name: string): string {
	return LABEL_OVERRIDES[name] ?? name.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
}
