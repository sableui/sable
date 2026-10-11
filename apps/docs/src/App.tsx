import {
	COMPONENT_GROUPS,
	Spinner,
	componentLabel,
	componentSlug,
	componentsInGroup,
} from "@sableui/react"
import { type ComponentType, lazy, Suspense, useEffect, useRef } from "react"
import {
	DocsShell,
	type NavArea,
	type NavSection,
} from "./components/DocsShell"
import { IntroCurtain, introPending } from "./components/IntroCurtain"
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
	return lazy(() =>
		loader().then((m) => ({ default: m[name] as ComponentType })),
	)
}

const PatternPreviewRoute = lazy(() =>
	import("./pages/PatternPreview").then((m) => ({ default: m.PatternPreview })),
)

const CustomizeRoute = lazy(() =>
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
					},
					{
						slug: "build-with-sable",
						label: "Build with Sable",
						keywords: ["agent", "build", "inspire", "audit", "polish", "preset", "workflow"],
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
				// The shipped page shells: full layouts composed from these components.
				title: "Pages",
				items: [
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
	themes: page(() => import("./pages/Themes"), "ThemesPage"),
	colors: page(() => import("./pages/Colors"), "ColorsPage"),
	typography: page(() => import("./pages/Typography"), "TypographyPage"),
	motion: page(() => import("./pages/Motion"), "MotionPage"),
	grid: page(() => import("./pages/GridLayout"), "GridLayoutPage"),
	icons: page(() => import("./pages/Icons"), "IconsPage"),
	dimensions: page(() => import("./pages/Dimensions"), "DimensionsPage"),
	elevation: page(() => import("./pages/Elevation"), "ElevationPage"),
	shape: page(() => import("./pages/FoundationPages"), "ShapePage"),
	scrolling: page(() => import("./pages/FoundationPages"), "ScrollingPage"),
	accessibility: page(() => import("./pages/FoundationPages"), "AccessibilityPage"),
	button: page(() => import("./pages/components/ButtonPage"), "ButtonPage"),
	badge: page(() => import("./pages/components/BadgePage"), "BadgePage"),
	card: page(() => import("./pages/components/CardPage"), "CardPage"),
	carousel: page(
		() => import("./pages/components/CarouselPage"),
		"CarouselPage",
	),
	marquee: page(() => import("./pages/components/MarqueePage"), "MarqueePage"),
	"message-scroller": page(
		() => import("./pages/components/MessageScrollerPage"),
		"MessageScrollerPage",
	),
	message: page(() => import("./pages/components/MessagePage"), "MessagePage"),
	bubble: page(() => import("./pages/components/BubblePage"), "BubblePage"),
	attachment: page(
		() => import("./pages/components/AttachmentPage"),
		"AttachmentPage",
	),
	marker: page(() => import("./pages/components/MarkerPage"), "MarkerPage"),
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
	table: page(() => import("./pages/components/TablePage"), "TablePage"),
	pill: page(() => import("./pages/components/PillPage"), "PillPage"),
	"notification-badge": page(
		() => import("./pages/components/NotificationBadgePage"),
		"NotificationBadgePage",
	),
	"status-dot": page(
		() => import("./pages/components/StatusDotPage"),
		"StatusDotPage",
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
	"dots-menu": page(
		() => import("./pages/components/DotsMenuPage"),
		"DotsMenuPage",
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
	"page-header": page(
		() => import("./pages/components/PageHeaderPage"),
		"PageHeaderPage",
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

function RouteFallback() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Spinner />
		</div>
	)
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
		// page) stands in for the spinner, so the intro starts from first paint.
		return (
			<DocsShell areas={areas} current={slug} bare title={site.homeTitle}>
				<Suspense fallback={introPending() ? <IntroCurtain /> : <RouteFallback />}>
					<Home />
				</Suspense>
			</DocsShell>
		)
	}
	// The customize canvas: the same header as every page, the full width
	// below it, and the Customize panel open beside it.
	if (slug === "customize") {
		return (
			<DocsShell areas={areas} current={slug} max="full" title="Canvas — Sable">
				<Suspense fallback={<RouteFallback />}>
					<CustomizeRoute />
				</Suspense>
			</DocsShell>
		)
	}
	// Bare full-page pattern previews — no DocsShell, so shell patterns
	// (AppShell, skip links, #main-content) never nest inside the docs' own.
	if (slug.startsWith("preview/")) {
		return (
			<Suspense fallback={<RouteFallback />}>
				<PatternPreviewRoute slug={slug.slice("preview/".length)} />
			</Suspense>
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
				<Suspense fallback={<RouteFallback />}>
					<GuidelinesRoute />
				</Suspense>
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
				<Suspense fallback={<RouteFallback />}>
					<NotFoundRoute />
				</Suspense>
			</DocsShell>
		)
	}
	return (
		<DocsShell areas={areas} current={slug} max={width}>
			<Suspense fallback={<RouteFallback />}>
				<Page />
			</Suspense>
		</DocsShell>
	)
}
