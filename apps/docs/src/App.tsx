import {
	COMPONENT_GROUPS,
	componentLabel,
	componentSlug,
	componentsInGroup,
} from "@sableui/react"
import { type ComponentType, useEffect, useRef } from "react"
import {
	DocsShell,
	type NavArea,
	type NavSection,
} from "./components/DocsShell"
import { IntroCurtain, introPending } from "./components/IntroCurtain"
import { RouteBoundary } from "./components/RouteErrorBoundary"
import { CanvasSkeleton, DocPageSkeleton, HomeSkeleton, PreviewSkeleton } from "./components/RouteSkeleton"
import { ANCHORS as BUILD_WITH_SABLE_ANCHORS } from "./content/build-with-sable"
import { lazyRoute } from "./lib/lazy-route"
import { redirect, useRoute } from "./lib/router"
import site from "./site-meta.json"

/**
 * Each route is code-split with React.lazy so the catalog loads page-by-page
 * instead of shipping every demo in one eager bundle. `page()` adapts a named
 * page export into the default export React.lazy expects.
 */
function page<T extends Record<string, ComponentType>>(
	loader: () => Promise<T>,
	name: keyof T,
): ComponentType {
	return lazyRoute(() =>
		loader().then((m) => ({ default: m[name] as ComponentType })),
	)
}

const PatternPreviewRoute = lazyRoute(() =>
	import("./pages/PatternPreview").then((m) => ({ default: m.PatternPreview })),
)

const CustomizeRoute = lazyRoute(() =>
	import("./pages/CustomizeCanvas").then((m) => ({ default: m.CustomizeCanvasPage })),
)

const NotFoundRoute = page(() => import("./pages/NotFound"), "NotFoundPage")

const GuidelinesRoute = page(
	() => import("./pages/Guidelines"),
	"GuidelinesPage",
)

/**
 * The nav.
 *
 * Component sections are GENERATED from Sable's taxonomy contract
 * (`COMPONENT_GROUPS` + `COMPONENT_TAXONOMY`), not hand-listed here. They used to
 * be hand-listed, and that is precisely how PanelGroup, PanelSection, ScrubField
 * and StatusBar shipped in 0.31.0 with no nav entry and no docs page: nothing
 * connected the roster to the catalog, so nobody noticed for four releases.
 * `build-registry` now fails if a component is missing from the taxonomy or has
 * no page, so this list cannot drift from what actually ships.
 *
 * Foundations and Patterns stay hand-listed: they are documentation pages, not
 * components, so they have no taxonomy entry to derive from.
 */
const componentSections: NavSection[] = COMPONENT_GROUPS.map((group) => ({
	title: group,
	items: componentsInGroup(group).map((name) => ({
		slug: componentSlug(name),
		label: componentLabel(name),
	})),
})).filter((section) => section.items.length > 0)

/**
 * The areas of the docs, in the order the top bar presents them.
 *
 * Ordered the way someone arrives: what the system is and how to use it, then
 * what it has, then what to try, then what to copy wholesale.
 */
const areas: NavArea[] = [
	{
		id: "docs",
		label: "Docs",
		home: "getting-started",
		sections: [
			{
				title: "Getting started",
				items: [
					{
						slug: "introduction",
						label: "Home",
						keywords: ["install", "setup", "getting started", "npm", "pnpm"],
					},
					{
						slug: "getting-started",
						label: "Get started",
						keywords: ["install", "setup", "agent", "quickstart"],
						anchors: [
							{ id: "update", label: "Update Sable", detail: "One command: pnpm exec sable upgrade updates the package and your agent's setup.", keywords: ["update", "upgrade", "latest", "version", "existing app"] },
						],
					},
					{
						slug: "build-with-sable",
						label: "Build with Sable",
						keywords: ["agent", "build", "inspire", "audit", "polish", "fix", "preset", "workflow", "skill", "cli", "commands"],
						anchors: BUILD_WITH_SABLE_ANCHORS,
					},
					{
						slug: "credits",
						label: "Credits and license",
						keywords: ["attribution", "license", "sources"],
					},
					{ slug: "ios-prototype", label: "iOS prototypes", keywords: ["native", "iphone", "ios", "prototype", "replacement"] },
					{
						slug: "whats-new",
						label: "What's new",
						keywords: [
							"changelog",
							"releases",
							"versions",
							"history",
							"recent",
						],
					},
					{
						slug: "guidelines",
						label: "Guidelines",
						keywords: [
							"rules",
							"lint",
							"enforced",
							"do",
							"dont",
							"best practices",
							"checklist",
							"standards",
							"conventions",
						],
					},
				],
			},
			{
				title: "Foundations",
				items: [
					{
						slug: "themes",
						label: "Presets",
						keywords: ["theming", "dark mode", "light mode", "brand", "tokens"],
					},
					{
						slug: "colors",
						label: "Color",
						keywords: ["palette", "contrast", "semantic tokens", "accent"],
					},
					{
						slug: "typography",
						label: "Typography",
						keywords: ["type scale", "font", "text", "heading", "measure"],
					},
					{
						slug: "dimensions",
						label: "Spacing & sizing",
						keywords: ["spacing", "sizing", "radius", "density", "scale"],
					},
					{
						slug: "shape",
						label: "Shape",
						keywords: ["radius", "corners", "concentric", "border", "edge"],
					},
					{
						slug: "elevation",
						label: "Surfaces",
						keywords: ["shadow", "depth", "layering", "z-index", "surface", "elevation", "popover"],
					},
					{
						slug: "motion",
						label: "Motion",
						keywords: [
							"animation",
							"transition",
							"easing",
							"duration",
							"reduced motion",
						],
					},
					{
						slug: "interactions",
						label: "Interactions",
						keywords: [
							"micro-interactions",
							"microinteractions",
							"hover",
							"press",
							"glide",
							"sliding indicator",
							"rolling number",
							"confirm",
							"shake",
							"loading",
							"subtle motion",
						],
					},
					{
						slug: "grid",
						label: "Grid & Layout",
						keywords: ["columns", "region", "gutter", "page inset", "stack"],
					},
					{
						slug: "icons",
						label: "Icons",
						keywords: ["glyph", "symbol", "iconography", "brand marks"],
					},
					{
						slug: "scrolling",
						label: "Scrolling",
						keywords: ["scrollbar", "overflow", "scroller", "edge fade", "scroll"],
					},
					{
						slug: "accessibility",
						label: "Accessibility",
						keywords: ["a11y", "wcag", "contrast", "focus", "screen reader", "keyboard", "aria"],
					},
				],
			},
		],
	},
	{
		id: "components",
		label: "Components",
		// No index page: the sidebar and search already list every component,
		// and a grid of mostly text cards added a click without adding a view.
		// The tab opens the first component; llms.txt is the agent-facing index.
		home: componentSections[0]?.items[0]?.slug ?? "button",
		sections: [
			...componentSections,
			{
				// Compositions of these components, copied in rather than imported:
				// blocks (a card, a form) and page shells (a whole route).
				title: "Compositions",
				items: [
					{
						slug: "blocks",
						label: "Blocks",
						keywords: ["block", "section", "card", "template", "starter", "example", "pricing", "sign in", "form", "recipe"],
					},
					{
						slug: "patterns",
						label: "Page shells",
						keywords: ["layout", "scaffold", "starter", "shell", "pattern", "template", "dashboard", "settings", "auth"],
					},
				],
			},
		],
	},
	{
		id: "canvas",
		label: "Canvas",
		// One page, so no rail (see DocsShell); the item makes it findable from search.
		home: "customize",
		sections: [
			{
				title: "Canvas",
				items: [
					{
						slug: "customize",
						label: "Canvas",
						keywords: ["customize", "theme", "look", "preset", "brand", "tune", "export"],
					},
				],
			},
		],
	},
]

const pages: Record<string, ComponentType> = {
	"ios-prototype": page(() => import("./pages/IosPrototype"), "IosPrototypePage"),
	introduction: page(() => import("./pages/Introduction"), "IntroductionPage"),
	"getting-started": page(() => import("./pages/GettingStarted"), "GettingStartedPage"),
	"build-with-sable": page(() => import("./pages/BuildWithSable"), "BuildWithSablePage"),
	credits: page(() => import("./pages/Credits"), "CreditsPage"),
	"whats-new": page(() => import("./pages/WhatsNew"), "WhatsNewPage"),
	patterns: page(() => import("./pages/Patterns"), "PatternsPage"),
	blocks: page(() => import("./pages/Blocks"), "BlocksPage"),
	themes: page(() => import("./pages/Themes"), "ThemesPage"),
	colors: page(() => import("./pages/Colors"), "ColorsPage"),
	typography: page(() => import("./pages/Typography"), "TypographyPage"),
	motion: page(() => import("./pages/Motion"), "MotionPage"),
	interactions: page(() => import("./pages/Interactions"), "InteractionsPage"),
	grid: page(() => import("./pages/GridLayout"), "GridLayoutPage"),
	icons: page(() => import("./pages/Icons"), "IconsPage"),
	dimensions: page(() => import("./pages/Dimensions"), "DimensionsPage"),
	elevation: page(() => import("./pages/Elevation"), "ElevationPage"),
	shape: page(() => import("./pages/FoundationPages"), "ShapePage"),
	scrolling: page(() => import("./pages/FoundationPages"), "ScrollingPage"),
	accessibility: page(() => import("./pages/FoundationPages"), "AccessibilityPage"),
	button: page(() => import("./pages/components/ButtonPage"), "ButtonPage"),
	"button-group": page(() => import("./pages/components/ButtonGroupPage"), "ButtonGroupPage"),
	"confirm-button": page(() => import("./pages/components/ConfirmButtonPage"), "ConfirmButtonPage"),
	"like-button": page(() => import("./pages/components/LikeButtonPage"), "LikeButtonPage"),
	badge: page(() => import("./pages/components/BadgePage"), "BadgePage"),
	card: page(() => import("./pages/components/CardPage"), "CardPage"),
	carousel: page(
		() => import("./pages/components/CarouselPage"),
		"CarouselPage",
	),
	marquee: page(() => import("./pages/components/MarqueePage"), "MarqueePage"),
	"gradient-art": page(() => import("./pages/components/GradientArtPage"), "GradientArtPage"),
	"media-image": page(() => import("./pages/components/MediaImagePage"), "MediaImagePage"),
	"media-tile": page(() => import("./pages/components/MediaTilePage"), "MediaTilePage"),
	"message-scroller": page(
		() => import("./pages/components/MessageScrollerPage"),
		"MessageScrollerPage",
	),
	message: page(() => import("./pages/components/MessagePage"), "MessagePage"),
	bubble: page(() => import("./pages/components/BubblePage"), "BubblePage"),
	"reaction-picker": page(() => import("./pages/components/ReactionPickerPage"), "ReactionPickerPage"),
	attachment: page(
		() => import("./pages/components/AttachmentPage"),
		"AttachmentPage",
	),
	marker: page(() => import("./pages/components/MarkerPage"), "MarkerPage"),
	"caret-menu": page(() => import("./pages/components/CaretMenuPage"), "CaretMenuPage"),
	"chat-composer": page(
		() => import("./pages/components/ChatComposerPage"),
		"ChatComposerPage",
	),
	"settings-menu": page(
		() => import("./pages/components/SettingsMenuPage"),
		"SettingsMenuPage",
	),
	dialog: page(() => import("./pages/components/DialogPage"), "DialogPage"),
	input: page(() => import("./pages/components/InputPage"), "InputPage"),
	"input-group": page(() => import("./pages/components/InputGroupPage"), "InputGroupPage"),
	textarea: page(
		() => import("./pages/components/TextareaPage"),
		"TextareaPage",
	),
	label: page(() => import("./pages/components/LabelPage"), "LabelPage"),
	checkbox: page(
		() => import("./pages/components/CheckboxPage"),
		"CheckboxPage",
	),
	switch: page(() => import("./pages/components/SwitchPage"), "SwitchPage"),
	separator: page(
		() => import("./pages/components/SeparatorPage"),
		"SeparatorPage",
	),
	tabs: page(() => import("./pages/components/TabsPage"), "TabsPage"),
	tooltip: page(() => import("./pages/components/TooltipPage"), "TooltipPage"),
	radio: page(() => import("./pages/components/RadioPage"), "RadioPage"),
	select: page(() => import("./pages/components/SelectPage"), "SelectPage"),
	toggle: page(() => import("./pages/components/TogglePage"), "TogglePage"),
	toolbar: page(() => import("./pages/components/ToolbarPage"), "ToolbarPage"),
	popover: page(() => import("./pages/components/PopoverPage"), "PopoverPage"),
	menu: page(() => import("./pages/components/MenuPage"), "MenuPage"),
	menubar: page(() => import("./pages/components/MenubarPage"), "MenubarPage"),
	sheet: page(() => import("./pages/components/SheetPage"), "SheetPage"),
	avatar: page(() => import("./pages/components/AvatarPage"), "AvatarPage"),
	progress: page(
		() => import("./pages/components/ProgressPage"),
		"ProgressPage",
	),
	skeleton: page(
		() => import("./pages/components/SkeletonPage"),
		"SkeletonPage",
	),
	spinner: page(() => import("./pages/components/SpinnerPage"), "SpinnerPage"),
	"streaming-text": page(
		() => import("./pages/components/StreamingTextPage"),
		"StreamingTextPage",
	),
	"gliding-highlight": page(
		() => import("./pages/components/GlidingHighlightPage"),
		"GlidingHighlightPage",
	),
	"thinking-orb": page(
		() => import("./pages/components/ThinkingOrbPage"),
		"ThinkingOrbPage",
	),
	"tool-call": page(
		() => import("./pages/components/ToolCallPage"),
		"ToolCallPage",
	),
	table: page(() => import("./pages/components/TablePage"), "TablePage"),
	pill: page(() => import("./pages/components/PillPage"), "PillPage"),
	"notification-badge": page(
		() => import("./pages/components/NotificationBadgePage"),
		"NotificationBadgePage",
	),
	"number-ticker": page(
		() => import("./pages/components/NumberTickerPage"),
		"NumberTickerPage",
	),
	"status-dot": page(
		() => import("./pages/components/StatusDotPage"),
		"StatusDotPage",
	),
	"segmented-bar": page(
		() => import("./pages/components/SegmentedBarPage"),
		"SegmentedBarPage",
	),
	"area-chart": page(() => import("./pages/components/AreaChartPage"), "AreaChartPage"),
	"bar-chart": page(() => import("./pages/components/BarChartPage"), "BarChartPage"),
	"line-chart": page(() => import("./pages/components/LineChartPage"), "LineChartPage"),
	"pie-chart": page(() => import("./pages/components/PieChartPage"), "PieChartPage"),
	"radar-chart": page(() => import("./pages/components/RadarChartPage"), "RadarChartPage"),
	"radial-chart": page(() => import("./pages/components/RadialChartPage"), "RadialChartPage"),
	sparkline: page(() => import("./pages/components/SparklinePage"), "SparklinePage"),
	"activity-heatmap": page(() => import("./pages/components/ActivityHeatmapPage"), "ActivityHeatmapPage"),
	"date-tile": page(
		() => import("./pages/components/DateTilePage"),
		"DateTilePage",
	),
	calendar: page(
		() => import("./pages/components/CalendarPage"),
		"CalendarPage",
	),
	"date-picker": page(
		() => import("./pages/components/DatePickerPage"),
		"DatePickerPage",
	),
	toast: page(() => import("./pages/components/ToastPage"), "ToastPage"),
	accordion: page(
		() => import("./pages/components/AccordionPage"),
		"AccordionPage",
	),
	collapsible: page(
		() => import("./pages/components/CollapsiblePage"),
		"CollapsiblePage",
	),
	"disclosure-picker": page(
		() => import("./pages/components/DisclosurePickerPage"),
		"DisclosurePickerPage",
	),
	"font-picker": page(
		() => import("./pages/components/FontPickerPage"),
		"FontPickerPage",
	),
	slider: page(() => import("./pages/components/SliderPage"), "SliderPage"),
	combobox: page(
		() => import("./pages/components/ComboboxPage"),
		"ComboboxPage",
	),
	"context-menu": page(
		() => import("./pages/components/ContextMenuPage"),
		"ContextMenuPage",
	),
	breadcrumbs: page(
		() => import("./pages/components/BreadcrumbsPage"),
		"BreadcrumbsPage",
	),
	pagination: page(
		() => import("./pages/components/PaginationPage"),
		"PaginationPage",
	),
	code: page(() => import("./pages/components/CodePage"), "CodePage"),
	"code-block": page(
		() => import("./pages/components/CodeBlockPage"),
		"CodeBlockPage",
	),
	kbd: page(() => import("./pages/components/KbdPage"), "KbdPage"),
	note: page(() => import("./pages/components/NotePage"), "NotePage"),
	banner: page(() => import("./pages/components/BannerPage"), "BannerPage"),
	"empty-state": page(
		() => import("./pages/components/EmptyStatePage"),
		"EmptyStatePage",
	),
	"search-input": page(
		() => import("./pages/components/SearchInputPage"),
		"SearchInputPage",
	),
	fieldset: page(
		() => import("./pages/components/FieldsetPage"),
		"FieldsetPage",
	),
	"radio-card": page(
		() => import("./pages/components/RadioCardPage"),
		"RadioCardPage",
	),
	entity: page(() => import("./pages/components/EntityPage"), "EntityPage"),
	"relative-time": page(
		() => import("./pages/components/RelativeTimePage"),
		"RelativeTimePage",
	),
	"theme-switcher": page(
		() => import("./pages/components/ThemeSwitcherPage"),
		"ThemeSwitcherPage",
	),
	"theme-selector": page(
		() => import("./pages/components/ThemeSelectorPage"),
		"ThemeSelectorPage",
	),
	"show-more": page(
		() => import("./pages/components/ShowMorePage"),
		"ShowMorePage",
	),
	"command-menu": page(
		() => import("./pages/components/CommandMenuPage"),
		"CommandMenuPage",
	),
	"overflow-menu": page(
		() => import("./pages/components/OverflowMenuPage"),
		"OverflowMenuPage",
	),
	"context-card": page(
		() => import("./pages/components/ContextCardPage"),
		"ContextCardPage",
	),
	feedback: page(
		() => import("./pages/components/FeedbackPage"),
		"FeedbackPage",
	),
	"middle-truncate": page(
		() => import("./pages/components/MiddleTruncatePage"),
		"MiddleTruncatePage",
	),
	scroller: page(
		() => import("./pages/components/ScrollerPage"),
		"ScrollerPage",
	),
	"page-loader": page(
		() => import("./pages/components/PageLoaderPage"),
		"PageLoaderPage",
	),
	"destructive-action-modal": page(
		() => import("./pages/components/DestructiveActionModalPage"),
		"DestructiveActionModalPage",
	),
	browser: page(() => import("./pages/components/BrowserPage"), "BrowserPage"),
	phone: page(() => import("./pages/components/PhonePage"), "PhonePage"),
	video: page(() => import("./pages/components/VideoPage"), "VideoPage"),
	sidebar: page(() => import("./pages/components/SidebarPage"), "SidebarPage"),
	"side-nav": page(
		() => import("./pages/components/SideNavPage"),
		"SideNavPage",
	),
	"section-rail": page(
		() => import("./pages/components/SectionRailPage"),
		"SectionRailPage",
	),
	workspace: page(
		() => import("./pages/components/WorkspacePage"),
		"WorkspacePage",
	),
	tree: page(() => import("./pages/components/TreePage"), "TreePage"),
	"color-field": page(
		() => import("./pages/components/ColorFieldPage"),
		"ColorFieldPage",
	),
	"panel-group": page(
		() => import("./pages/components/PanelGroupPage"),
		"PanelGroupPage",
	),
	"panel-section": page(
		() => import("./pages/components/PanelSectionPage"),
		"PanelSectionPage",
	),
	"scrub-field": page(
		() => import("./pages/components/ScrubFieldPage"),
		"ScrubFieldPage",
	),
	"status-bar": page(
		() => import("./pages/components/StatusBarPage"),
		"StatusBarPage",
	),
	"app-shell": page(
		() => import("./pages/components/AppShellPage"),
		"AppShellPage",
	),
	"app-header": page(
		() => import("./pages/components/AppHeaderPage"),
		"AppHeaderPage",
	),
	"bottom-nav": page(
		() => import("./pages/components/BottomNavPage"),
		"BottomNavPage",
	),
	"navigation-menu": page(
		() => import("./pages/components/NavigationMenuPage"),
		"NavigationMenuPage",
	),
	"page-header": page(
		() => import("./pages/components/PageHeaderPage"),
		"PageHeaderPage",
	),
	"section-header": page(
		() => import("./pages/components/SectionHeaderPage"),
		"SectionHeaderPage",
	),
	form: page(() => import("./pages/components/FormPage"), "FormPage"),
	"number-field": page(
		() => import("./pages/components/NumberFieldPage"),
		"NumberFieldPage",
	),
	"otp-field": page(
		() => import("./pages/components/OtpFieldPage"),
		"OtpFieldPage",
	),
	"file-dropzone": page(
		() => import("./pages/components/FileDropzonePage"),
		"FileDropzonePage",
	),
	stepper: page(
		() => import("./pages/components/StepperPage"),
		"StepperPage",
	),
	meter: page(() => import("./pages/components/MeterPage"), "MeterPage"),
	"checkbox-card": page(
		() => import("./pages/components/CheckboxCardPage"),
		"CheckboxCardPage",
	),
	"inline-status": page(
		() => import("./pages/components/InlineStatusPage"),
		"InlineStatusPage",
	),
	"data-table": page(
		() => import("./pages/components/DataTablePage"),
		"DataTablePage",
	),
}

/** Replace the current URL after render — redirecting during render would
 * update the router's state mid-render. */
function Redirect({ to }: { to: string }) {
	useEffect(() => redirect(to), [to])
	return null
}

export function App() {
	const slug = useRoute()
	const previousSlug = useRef(slug)
	useEffect(() => {
		const changed = previousSlug.current !== slug
		previousSlug.current = slug
		if (!changed) return
		// The home and canvas have their own shells. Announce navigation across
		// shell boundaries too, after a lazy route's heading becomes available.
		const focusHeading = () => {
			const heading = document.querySelector<HTMLElement>("main h1")
			if (!heading) return false
			heading.tabIndex = -1
			heading.focus({ preventScroll: true })
			return true
		}
		if (focusHeading()) return
		const observer = new MutationObserver(() => { if (focusHeading()) observer.disconnect() })
		observer.observe(document.getElementById("root")!, { childList: true, subtree: true })
		return () => observer.disconnect()
	}, [slug])
	// Layout width is fluid within the available pane; prose caps itself.
	const width = "var(--docs-column)"
	if (slug === "introduction") {
		const Home = pages.introduction
		// The same shell as every docs page, so the header never jumps. While
		// the homepage code loads, the intro's opening frame (the S on a blank
		// page) stands in for the skeleton, so the intro starts from first paint.
		return (
			<DocsShell areas={areas} current={slug} bare title={site.homeTitle}>
				<RouteBoundary slug={slug} fallback={introPending() ? <IntroCurtain /> : <HomeSkeleton />}>
					<Home />
				</RouteBoundary>
			</DocsShell>
		)
	}
	// The customize canvas: the same header as every page, the full width
	// below it, and the Customize panel open beside it.
	if (slug === "customize") {
		return (
			<DocsShell areas={areas} current={slug} max="full" title="Canvas — Sable">
				<RouteBoundary slug={slug} fallback={<CanvasSkeleton />}>
					<CustomizeRoute />
				</RouteBoundary>
			</DocsShell>
		)
	}
	// Bare full-page pattern previews — no DocsShell, so shell patterns
	// (AppShell, skip links, #main-content) never nest inside the docs' own.
	if (slug.startsWith("preview/")) {
		return (
			<RouteBoundary slug={slug} fallback={<PreviewSkeleton />}>
				<PatternPreviewRoute slug={slug.slice("preview/".length)} />
			</RouteBoundary>
		)
	}
	// The retired Full builds page and its routes: builds are local now.
	if (slug === "references" || slug.startsWith("reference/")) {
		return <Redirect to="patterns" />
	}
	// `/playground/<component>` picks which playground is showing. It stays
	// inside the shell (unlike the bare preview routes above) — it is a docs page
	// with a parameter, not a full-page build.
	// The guide shelf moved to the package (agents read it there). Guidelines
	// is the one page that stayed; every other old guide link lands home.
	if (slug.startsWith("guide/")) {
		return <Redirect to={slug === "guide/guidelines" ? "guidelines" : "introduction"} />
	}
	if (slug === "guidelines") {
		return (
			<DocsShell areas={areas} current={slug} max={width}>
				<RouteBoundary slug={slug} fallback={<DocPageSkeleton />}>
					<GuidelinesRoute />
				</RouteBoundary>
			</DocsShell>
		)
	}
	// Playground is no longer its own area: every component page embeds its
	// playground, and system-wide play lives in Customize. Old links land on
	// the component page (or the catalog) instead of a dead end.
	if (slug === "playground" || slug.startsWith("playground/")) {
		const target = slug.slice("playground/".length)
		return <Redirect to={target && pages[target] ? target : "button"} />
	}
	// Relative CSS folded into Surfaces (and Shape for concentric corners).
	if (slug === "relative-css") {
		return <Redirect to="elevation" />
	}
	// The retired catalog index: old links land on the first component.
	if (slug === "components") {
		return <Redirect to="button" />
	}
	const Page = pages[slug]
	// Unknown paths say so. In production the host has already answered 404
	// with dist/404.html (scripts/prerender-routes.mjs); this is what it shows.
	if (!Page) {
		return (
			<DocsShell areas={areas} current={slug} max={width} title="Page not found — Sable">
				<RouteBoundary slug={slug} fallback={<DocPageSkeleton />}>
					<NotFoundRoute />
				</RouteBoundary>
			</DocsShell>
		)
	}
	return (
		<DocsShell areas={areas} current={slug} max={width}>
			<RouteBoundary slug={slug} fallback={<DocPageSkeleton />}>
				<Page />
			</RouteBoundary>
		</DocsShell>
	)
}
