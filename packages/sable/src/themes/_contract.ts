/**
 * The theme contract. Every Sable theme MUST define a value (light + dark) for
 * each semantic token below. Components reference ONLY these semantic roles —
 * never a theme's internal palette steps — which is what makes the system
 * re-themeable without touching component code.
 *
 * To author a new theme: copy `themes/base/`, keep these token names, and
 * supply your own palette + values. See CONTRIBUTING.md → "Theme contract".
 */

export const SEMANTIC_TOKENS = [
	// Surfaces & text
	"background",
	"foreground",
	"card",
	"card-foreground",
	"popover",
	"popover-foreground",
	"muted",
	"muted-foreground",
	"border",
	// A visually-stronger structural divider — grid lines, table rules, section
	// separators — distinct from `border`, which is tuned for subtle chrome
	// (badge/input outlines). Same neutral ramp as `border`, pulled from a
	// higher-contrast step. See DESIGN.md / CONTRIBUTING.md → "Theme contract".
	"border-strong",
	"input",
	"ring",
	// Actions
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"accent",
	"accent-foreground",
	"destructive",
	"destructive-foreground",
	// Success — the positive-state counterpart to destructive (mirrors it 1:1).
	// Backed by caribbean-green; a SEPARATE token from the `tone-standard`
	// post-type so success-as-state can be retuned without moving the post tone.
	"success",
	"success-foreground",
	// Tones (semantic — carry meaning, not decoration)
	"tone-standard",
	"tone-collectible",
	"tone-edition",
	"tone-info",
	"tone-warning",
	"highlight",
	// Tone ink — the legible text/icon color ON a tone fill. Theme-adaptive:
	// because a tone fill flips lightness with the mode (dark 600/700 in light
	// mode, lighter dark-tuned values in dark mode), its ink must flip too. These
	// let a component write `text-tone-edition-foreground` — an intent token with
	// no palette name and no `dark:` variant — instead of naming palette steps.
	"tone-standard-foreground",
	"tone-collectible-foreground",
	"tone-edition-foreground",
	"tone-info-foreground",
	"tone-warning-foreground",
	"highlight-foreground",
	// Overlay — a fixed, theme-independent dark surface for things that sit OVER
	// content rather than on a theme surface: modal/sheet scrims, media letterbox,
	// pills on imagery. `overlay-foreground` is its always-legible light ink.
	// Replaces ad-hoc `bg-black/50` + `text-white`.
	"overlay",
	"overlay-foreground",
	// Sidebar set
	"sidebar",
	"sidebar-foreground",
	"sidebar-primary",
	"sidebar-primary-foreground",
	"sidebar-accent",
	"sidebar-accent-foreground",
	"sidebar-border",
	"sidebar-ring",
] as const

export type SemanticToken = (typeof SEMANTIC_TOKENS)[number]

/**
 * Motion tokens (mode-independent). A theme MAY override these to retune its
 * motion feel; if omitted, the Base defaults apply. Components reference
 * them via `duration-(--motion-duration-*)` + the `ease-*` utilities, or — far
 * more often — via the named motion recipes (`motion-pop`, `motion-press`, …)
 * defined in styles.css. Every duration is multiplied by `--motion-scale`, the
 * single lever the reduced-motion policy and <MotionProvider> collapse to 0.
 * See DESIGN.md → Motion.
 */
export const MOTION_TOKENS = [
	"motion-scale",
	// Duration ladder (75/150/200/300/500) + semantic enter/exit
	"motion-duration-instant",
	"motion-duration-fast",
	"motion-duration-base",
	"motion-duration-slow",
	"motion-duration-slower",
	"motion-duration-enter",
	"motion-duration-exit",
	// Easings — standard/decelerate/emphasized are overshoot-free; spring/bounce
	// add a tasteful single overshoot (enter only).
	"motion-ease-standard",
	"motion-ease-decelerate",
	"motion-ease-emphasized",
	"motion-ease-spring",
	"motion-ease-bounce",
	"motion-ease-linear",
] as const

export type MotionToken = (typeof MOTION_TOKENS)[number]

/**
 * Radius tokens (mode-independent). A theme MAY override these to retune its
 * shape language (soft-square, rectilinear, full-pill, …); if omitted, the
 * Base defaults apply (see styles.css → `@theme inline`, which bridges
 * each `--theme-radius-*` var to the `radius-*` Tailwind scale). Components
 * never reference these directly — they use the derived `rounded-*`
 * utilities.
 */
export const RADIUS_TOKENS = [
	"theme-radius-none",
	"theme-radius-xs",
	"theme-radius-sm",
	"theme-radius-md",
	"theme-radius-lg",
	"theme-radius-xl",
	"theme-radius-full",
] as const

export type RadiusToken = (typeof RADIUS_TOKENS)[number]

/**
 * Type-scale tokens (mode-independent). A theme MAY override these to retune
 * its typographic voice (weight, leading, tracking, and — for heading/display
 * tiers — size); if omitted, the Base defaults baked into styles.css's
 * paired `text-*` utilities apply. Additional body/label/caption/mono and size
 * hooks are advertised separately in TYPE_REFINEMENT_TOKENS: they are optional,
 * so a theme can retune its reading voice without duplicating every default.
 */
export const TYPE_SCALE_TOKENS = [
	// Display — the optional 4xl size hook lives in TYPE_REFINEMENT_TOKENS.
	"type-display-4xl-weight",
	"type-display-4xl-leading",
	"type-display-4xl-tracking",
	"type-display-3xl-size",
	"type-display-3xl-weight",
	"type-display-3xl-leading",
	"type-display-3xl-tracking",
	"type-display-2xl-size",
	"type-display-2xl-weight",
	"type-display-2xl-leading",
	"type-display-2xl-tracking",
	"type-display-xl-size",
	"type-display-xl-weight",
	"type-display-xl-leading",
	"type-display-xl-tracking",
	"type-display-lg-size",
	"type-display-lg-weight",
	"type-display-lg-leading",
	"type-display-lg-tracking",
	// Heading — one shared weight; size/leading/tracking per tier.
	"type-heading-weight",
	"type-heading-1-size",
	"type-heading-1-leading",
	"type-heading-1-tracking",
	"type-heading-2-size",
	"type-heading-2-leading",
	"type-heading-2-tracking",
	"type-heading-3-size",
	"type-heading-3-leading",
	"type-heading-3-tracking",
	"type-heading-4-size",
	"type-heading-4-leading",
	"type-heading-4-tracking",
	// Title — shared weight/leading; tracking per tier (lg uses the base tracking).
	"type-title-weight",
	"type-title-leading",
	"type-title-tracking",
	"type-title-sm-tracking",
] as const

export type TypeScaleToken = (typeof TYPE_SCALE_TOKENS)[number]

/**
 * Optional art-direction overrides for the paired typography utilities.
 * Every hook has a CSS fallback; existing themes need not declare any of these.
 * Set them at a theme or region scope, then keep consuming whole `text-*` tiers.
 * Compact controls still follow TYPE_UI_TOKENS for the workspace register.
 */
export const TYPE_REFINEMENT_TOKENS = [
	"type-display-4xl-size",
	"type-title-lg-size",
	"type-title-sm-size",
	"type-body-lg-size",
	"type-body-lg-weight",
	"type-body-lg-leading",
	"type-body-lg-tracking",
	"type-body-md-size",
	"type-body-md-weight",
	"type-body-md-leading",
	"type-body-md-tracking",
	"type-body-sm-size",
	"type-body-sm-weight",
	"type-body-sm-leading",
	"type-body-sm-tracking",
	"type-body-xs-size",
	"type-body-xs-weight",
	"type-body-xs-leading",
	"type-body-xs-tracking",
	"type-label-lg-size",
	"type-label-lg-weight",
	"type-label-lg-leading",
	"type-label-lg-tracking",
	"type-label-md-size",
	"type-label-md-weight",
	"type-label-md-leading",
	"type-label-md-tracking",
	"type-label-sm-size",
	"type-label-sm-weight",
	"type-label-sm-leading",
	"type-label-sm-tracking",
	"type-label-xs-size",
	"type-label-xs-weight",
	"type-label-xs-leading",
	"type-label-xs-tracking",
	"type-label-xs-transform",
	"type-caption-size",
	"type-caption-weight",
	"type-caption-leading",
	"type-caption-tracking",
	"type-mono-xl-size",
	"type-mono-xl-weight",
	"type-mono-xl-leading",
	"type-mono-xl-tracking",
	"type-mono-lg-size",
	"type-mono-lg-weight",
	"type-mono-lg-leading",
	"type-mono-lg-tracking",
	"type-mono-md-size",
	"type-mono-md-weight",
	"type-mono-md-leading",
	"type-mono-md-tracking",
	"type-mono-caption-size",
	"type-mono-caption-weight",
	"type-mono-caption-leading",
	"type-mono-caption-tracking",
	"type-mono-sm-size",
	"type-mono-sm-weight",
	"type-mono-sm-leading",
	"type-mono-sm-tracking",
] as const

export type TypeRefinementToken = (typeof TYPE_REFINEMENT_TOKENS)[number]

/**
 * Overline/eyebrow/kicker type tokens (mode-independent). A theme MAY override
 * these to retune its annotation voice; if omitted, styles.css's fallback
 * defaults apply. Covers the small, uppercase, letter-spaced text role used
 * for badge labels, section eyebrows, and stat captions — a distinct
 * typographic tier from `TYPE_SCALE_TOKENS`'s display/heading/title ramp.
 * `type-overline-transform` is themeable (not hardcoded `uppercase`) so a
 * theme can opt a reference's quieter eyebrow style out of all-caps.
 */
export const TYPE_OVERLINE_TOKENS = [
	"type-overline-size",
	"type-overline-weight",
	"type-overline-leading",
	"type-overline-tracking",
	"type-overline-transform",
] as const

export type TypeOverlineToken = (typeof TYPE_OVERLINE_TOKENS)[number]

/**
 * Density tokens (mode-independent) — the control ladder every sized component
 * renders from.
 *
 * This is the mechanism behind the two REGISTERS (see DESIGN.md → Registers).
 * Components never hardcode a height; they read `--control-*`. A density scope
 * (`data-density="compact"`) redefines those vars, so the same `size="md"`
 * Button is 40px in the page register and 32px in a tool panel — without any
 * selector reaching into rendered output to override a height after the fact.
 *
 * Values are set by `styles.css`; a theme MAY override them to retune its own
 * control rhythm, the same as MOTION_TOKENS and RADIUS_TOKENS.
 *
 * The compact values are measured, not invented: the Figma and Paper editors
 * run their chrome at 24/28/32/36 with a ~40px numeric field. See DESIGN.md →
 * Registers for the full audit.
 */
export const DENSITY_TOKENS = [
	"control-xs",
	"control-sm",
	"control-md",
	"control-cta",
	"control-lg",
	/** Width of a numeric property field — a property grid is built from these. */
	"field-numeric-width",
	/** Docked panel chrome. */
	"panel-width",
	"panel-width-min",
	"panel-width-max",
	"chrome-bar-height",
	"status-bar-height",
	/**
	 * Button shape. A DENSITY token because the workspace register flattens it —
	 * neither Figma nor Paper has a pill in its chrome — and therefore something
	 * every density scope must be able to restore.
	 *
	 * It lived outside this list while compact overrode it, which is precisely why
	 * the "declares every density token in both densities" test passed against a
	 * real asymmetry: a comfortable subtree nested in a compact one recovered the
	 * whole control ladder and kept flat buttons forever. The contract had a hole
	 * exactly where the bug was.
	 */
	"button-radius",
	/**
	 * The spacing that travels WITH control height. Compact used to shrink the
	 * ladder and leave every gap and row inset at its comfortable 8px, so a
	 * 32px button kept a 40px button's icon gap and a dense menu kept a roomy
	 * menu's padding. Comfortable values equal what the components hardcoded,
	 * so the default register renders unchanged.
	 */
	"control-gap",
	"item-px",
	"item-gap",
	/**
	 * Tree geometry — a layer/object list is the other shape (with the property
	 * grid) that every tool has, and its left edges are the thing that most
	 * visibly goes wrong. Three tokens, one invariant:
	 *
	 *   --tree-indent MUST equal --tree-column.
	 *
	 * A row is [rail][column: disclosure][column: type][name …][actions]. If the
	 * indent step is smaller than the column, a child's content lands LEFT of
	 * where its parent's content starts and the nesting reads INVERTED — the
	 * defect this promotion exists to make unrepeatable. Enforced in themes.test.
	 */
	"tree-rail",
	"tree-column",
	"tree-indent",
] as const

export type DensityToken = (typeof DENSITY_TOKENS)[number]

/**
 * Layering (z-index) — one ordered scale, declared in `styles.css` at `:root`.
 *
 * Promoted into the contract in 0.44.0. It had lived in the original default theme's CSS, which
 * made the DEFAULT THEME the owner of a scale every component references —
 * `z-(--z-nav)` in AppHeader/BottomNav/AppShell, `z-(--z-sticky)` in Banner,
 * `z-(--z-toast)` in the toast viewport, `z-(--z-skip-link)` in AppShell and
 * Workspace. Nothing broke only because that theme's block happened to carry a
 * `:root` arm; a consumer shipping one of the other four themes on its own got
 * no scale at all and every one of those utilities resolved to `z-index: auto`,
 * silently. A theme may still override an individual step. It may not be the
 * only place a step exists — which is exactly what themes.test now enforces.
 *
 * The same pass found the other half of the gap: `--z-overlay` was declared and
 * used by NOTHING, while fourteen portaled surfaces hardcoded `z-50`. The rule
 * DESIGN.md → Layering states was broken in the components that state it.
 */
export const LAYERING_TOKENS = [
	"z-sticky",
	"z-nav",
	"z-overlay",
	"z-toast",
	"z-skip-link",
] as const

export type LayeringToken = (typeof LAYERING_TOKENS)[number]

/**
 * Workspace surface tokens (light + dark) — the surface roles a tool shell needs
 * that the page register has no use for.
 *
 * OPTIONAL: `styles.css` derives every one of these from the theme's existing
 * semantic tokens, so a theme inherits a sane workspace band for free and only
 * declares `--theme-*` overrides where it wants to tune. That's deliberate —
 * requiring five hand-authored values per mode per theme would have been ten
 * times the work for values that derive cleanly.
 *
 * Why these exist at all, rather than reusing `background`/`card`:
 * - `canvas` is the WORK surface (the artboard). It is not `background`, because
 *   the thing being edited is not the page behind the UI.
 * - `panel` / `panel-raised` are docked chrome, and they sit in a deliberately
 *   COMPRESSED tonal band — Paper's whole ladder spans 249→242→238, about 3-7
 *   RGB units, with a low-contrast hairline doing the structural work. `card` is
 *   tuned for the opposite job (lifting content off a page).
 * - `hairline` / `hairline-strong` are that structural edge. In this register
 *   hairlines carry structure INSTEAD of tonal steps — a deliberate reversal of
 *   the page register's "prefer a tonal step or space over a divider line".
 */
export const WORKSPACE_SURFACE_TOKENS = [
	"canvas",
	"canvas-foreground",
	"panel",
	"panel-foreground",
	"panel-raised",
	"hairline",
	"hairline-strong",
] as const

export type WorkspaceSurfaceToken = (typeof WORKSPACE_SURFACE_TOKENS)[number]

/**
 * Derived edges — like the workspace surfaces, every theme gets them from
 * styles.css with a `--theme-*` hook, so no theme has to author them.
 *
 * `border-floating` is the edge of a floating surface (popover, menu, dialog,
 * sheet, toast, a floating panel): fainter than `border`, because the shadow
 * carries the elevation. It was documented as a foundation but declared only in
 * the original default theme, so in five themes the floating edge resolved to nothing.
 */
export const DERIVED_EDGE_TOKENS = ["border-floating"] as const

/**
 * UI type tiers (mode-independent) — the chrome typography register.
 *
 * A separate ramp from TYPE_SCALE_TOKENS on purpose. Tool chrome runs 10-12px at
 * weight 450-550 (measured: Figma 11/400 and 11/550, Paper 12/500 and 12/465),
 * where the page register's 14-16px at 400/600 reads as shouting. `ui-num` is
 * tabular so a column of values doesn't dance while a slider drags.
 *
 * These back the paired `text-ui-*` utilities in styles.css. Like every other
 * paired tier they must be registered in `lib/cn.ts`'s `ds-typography` group —
 * an unrecognised `text-*` class falls into tailwind-merge's COLOUR group and
 * silently evicts the real colour class, which is a genuinely hard bug to see.
 */
export const TYPE_UI_TOKENS = [
	"type-ui-md-size",
	"type-ui-md-weight",
	"type-ui-sm-size",
	"type-ui-sm-weight",
	"type-ui-leading",
	"type-ui-section-weight",
	"type-ui-micro-size",
	"type-ui-micro-weight",
] as const

export type TypeUiToken = (typeof TYPE_UI_TOKENS)[number]

/** A theme's resolved CSS-variable values for one mode (light or dark). */
export type ThemeTokenValues = Record<SemanticToken, string>

export type ThemeMode = "light" | "dark"

/** Lightweight, typed description of a theme (the TS manifest each theme ships). */
export interface ThemeManifest {
	/** Retained for existing imports; omitted from the featured preset picker. */
	deprecated?: { replacement: string }
	/** Stable id, e.g. "verdant". */
	id: string
	/** Human label, e.g. "Verdant". */
	label: string
	/** Modes this theme supports. */
	modes: ThemeMode[]
	/** Mode used when none is specified. */
	defaultMode: ThemeMode
	/**
	 * Font stacks the theme expects the host app to provide.
	 * `display` is optional — a distinct display/heading typeface separate from
	 * `sans` (e.g. a reference that uses a headline face like "Chalet" for
	 * display/heading type but a different sans for body). When omitted, the
	 * `text-display-*`/`text-heading-*` utilities in styles.css fall back to
	 * `--font-sans` via `var(--font-display, var(--font-sans))` — a theme that
	 * doesn't set it renders identically to today.
	 */
	fonts: { sans: string; mono: string; display?: string }
}
