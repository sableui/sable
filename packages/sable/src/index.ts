// @sableui/react — public barrel.
// Components, primitives, layout, and icon adapter are re-exported here as they land.
// Keep this the single public entry; never deep-import internals from consumer apps.

export const SABLE_UI_VERSION = "0.6.2" as const

// Foundations
export * from "./lib/cn"
export type {
	AnatomyMeta,
	BestPracticeMeta,
	ComponentMeta,
	ExampleMeta,
	MotionMeta,
	MotionSlot,
	PropMeta,
	RelatedMeta,
	SubcomponentMeta,
	UsageMeta,
} from "./lib/meta"
export { componentGuidance } from "./lib/component-guidance"
export type { ComponentGuidance } from "./lib/component-guidance"
// The component taxonomy — role + register per component, and the ordered group
// list. Exported so the docs nav (and any consumer catalog) is GENERATED from the
// contract rather than hand-maintained alongside it; see lib/taxonomy.ts for why.
export {
	COMPONENT_GROUPS,
	COMPONENT_TAXONOMY,
	componentLabel,
	componentSlug,
	componentsInGroup,
} from "./lib/taxonomy"
export type { ComponentGroup, ComponentRegister } from "./lib/taxonomy"
// Token allowlist — the contract a consuming app's lint/codegen can import as the
// single source of truth (instead of re-parsing registry.json or _contract.ts).
export {
	SEMANTIC_TOKENS,
	MOTION_TOKENS,
	RADIUS_TOKENS,
	TYPE_SCALE_TOKENS,
	TYPE_REFINEMENT_TOKENS,
	TYPE_OVERLINE_TOKENS,
	DENSITY_TOKENS,
	WORKSPACE_SURFACE_TOKENS,
	ART_TOKENS,
	TYPE_UI_TOKENS,
} from "./themes/_contract"
export type {
	SemanticToken,
	MotionToken,
	RadiusToken,
	TypeScaleToken,
	TypeRefinementToken,
	TypeOverlineToken,
	DensityToken,
	WorkspaceSurfaceToken,
	TypeUiToken,
	ThemeManifest,
	ThemeMode as ThemeManifestMode,
} from "./themes/_contract"
// Explicit index avoids the sibling themes.css winning extension resolution
// during package bundling and silently dropping these runtime exports.
export {
	SABLE_COLOR_STORAGE_KEY,
	DEFAULT_THEME_ID,
	SABLE_THEME_ATTRIBUTE,
	SABLE_THEME_STORAGE_KEY,
	SableThemeProvider,
	applySableColorMode,
	applySableTheme,
	defaultThemeId,
	getThemeManifest,
	isThemeId,
	themeIds,
	themeManifestById,
	themeManifests,
	useSableTheme,
} from "./themes/index"
export type {
	SableColorMode,
	SableThemeContextValue,
	SableThemePreference,
	SableThemeProviderProps,
	ThemeId,
} from "./themes/index"
export * from "./layout"
export * from "./icon"
export * from "./motion"

// Components
export * from "./components/button"
export * from "./components/card"
export * from "./components/badge"
export * from "./components/dialog"
export * from "./components/separator"
export * from "./components/input"
export * from "./components/textarea"
export * from "./components/number-field"
export * from "./components/otp-field"
export * from "./components/file-dropzone"
export * from "./components/label"
export { Switch, switchMeta } from "./components/switch"
export * from "./components/checkbox"
export * from "./components/tabs"
export * from "./components/tooltip"
export * from "./components/avatar"
export * from "./components/skeleton"
export * from "./components/spinner"
export * from "./components/thinking-orb"
export * from "./components/streaming-text"
export * from "./components/gliding-highlight"
export * from "./components/progress"
export * from "./components/meter"
export * from "./components/segmented-bar"
export * from "./components/area-chart"
export * from "./components/bar-chart"
export * from "./components/line-chart"
export * from "./components/pie-chart"
export * from "./components/radar-chart"
export * from "./components/radial-chart"
export * from "./components/sparkline"
export {
	CHART_SERIES_COUNT,
	chartColor,
	toneColor as chartToneColor,
	type ChartCategories,
	type ChartCenterLabel,
	type ChartDatum,
	type ChartSeries,
	type ChartTone,
	type ChartTooltipIndicator,
	type ChartTooltipOptions,
	type ChartValueFormatter,
} from "./lib/chart/types"
export type { ChartCurve } from "./lib/chart/geometry"
export * from "./components/stepper"
export * from "./components/toggle"
export * from "./components/toolbar"
export * from "./components/radio"
export * from "./components/select"
export * from "./components/popover"
export * from "./components/menu"
export * from "./components/sheet"
export * from "./components/table"
export * from "./components/data-table"
export * from "./components/pill"
export * from "./components/notification-badge"
export * from "./components/status-dot"
export * from "./components/calendar"
export * from "./components/date-tile"
export * from "./components/date-picker"
export * from "./components/toast"
export * from "./components/accordion"
export * from "./components/collapsible"
export * from "./components/slider"
export * from "./components/combobox"
export * from "./components/context-menu"
export * from "./components/breadcrumbs"
export * from "./components/pagination"
export * from "./components/code"
export * from "./components/code-block"
export * from "./components/kbd"
export * from "./components/note"
export * from "./components/inline-status"
export * from "./components/banner"
export * from "./components/empty-state"
// Workspace register — tool chrome (see DESIGN.md → Registers). AppShell is the
// page register's frame; these are its counterparts for a fixed-viewport tool.
export * from "./components/workspace"
export * from "./components/panel-group"
export * from "./components/panel-section"
export * from "./components/scrub-field"
export * from "./components/status-bar"
export * from "./components/tree"
export * from "./components/color-field"
// App shell / navigation chrome
export * from "./components/app-shell"
export * from "./components/sidebar"
export * from "./components/side-nav"
export * from "./components/bottom-nav"
export * from "./components/app-header"
export * from "./components/page-header"
export * from "./components/search-input"
export * from "./components/fieldset"
export * from "./components/form"
export * from "./components/radio-card"
export * from "./components/checkbox-card"
export * from "./components/entity"
export * from "./components/relative-time"
export * from "./components/theme-selector"
export * from "./components/theme-switcher"
export * from "./components/show-more"
export * from "./components/command-menu"
export * from "./components/overflow-menu"
export * from "./components/context-card"
export * from "./components/feedback"
export * from "./components/middle-truncate"
export * from "./components/scroller"
export * from "./components/destructive-action-modal"
export * from "./components/browser"
export * from "./components/phone"
export * from "./components/video"
export * from "./components/page-loader"
export * from "./components/marquee"
export * from "./components/carousel"
export * from "./components/gradient-art"
// The conversation layer — AI chat, support inboxes, team threads. Filed apart
// in the taxonomy (by kind, per its own doctrine) but built as one set.
export * from "./components/message-scroller"
export * from "./components/chat-composer"
export * from "./components/settings-menu"
export * from "./components/message"
export * from "./components/bubble"
export * from "./components/attachment"
export * from "./components/marker"
// Density as context — the half of the density scope CSS cannot reach. A portaled
// popup is not a DOM descendant of its <Workspace>, so `data-density` never
// reaches it; anchored surfaces re-apply it from here. See lib/density.tsx.
export { Density, DensityProvider, useDensity, useAnchoredDensity, useTypeTier } from "./lib/density"
export type { Density as DensityValue } from "./lib/density"
// Presentation — what content is shown in (a page, or a sheet). A sheet provides
// "sheet" and an action row stacks for it. See lib/presentation.tsx.
export { PresentationProvider, usePresentation, type Presentation } from "./lib/presentation"
// The scroll-activity signal behind `scrollbar-quiet`'s reveal. Exported because
// a consumer building their own scroll container needs it to honour the policy
// the six hard rules require of ours. See DESIGN.md → Scrolling.
export { useScrollActivity } from "./lib/use-scroll-activity"
export { useCopy, type UseCopyOptions, type UseCopyResult } from "./lib/use-copy"
export { STATUS_TONES, STATUS_TONE_ICON, type StatusTone } from "./lib/status-tone"
