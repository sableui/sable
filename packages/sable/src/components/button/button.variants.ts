import { cva } from "class-variance-authority"

/**
 * Pill-shaped by default, label-lg typography. Neutral tiers only here — primary is
 * the inverted neutral (one per screen), secondary the default workhorse, ghost for
 * tertiary actions. Tone-filled action buttons (buy/upgrade) land in a later pass.
 *
 * Corner radius reads `--button-radius` (a dedicated, OPTIONAL, mode-independent CSS
 * var — not part of the `RADIUS_TOKENS` contract in `themes/_contract.ts`), falling
 * back to `9999px` (full pill) when a theme doesn't set it. This is deliberate: unlike
 * `--theme-radius-full` (which every theme MUST define and which other rounded-full
 * components render from a Tailwind static utility that never actually reads a CSS
 * var), a theme wanting square/flat buttons needs a way to say so WITHOUT changing
 * what "full" means everywhere else `rounded-full` is used (avatars, pills, badges,
 * dots, …). Meridian uses square buttons. Themes can set `--theme-button-radius`
 * plus `--button-radius` to preserve their shape across nested density scopes
 * (mode-independent — same rule as `--theme-radius-*`).
 */
/** Focus for the on-colour tiers: an ink ring past a transparent gap (see below). */
const ON_COLOR_FOCUS =
	"focus-visible:ring-current focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"

/*
 * No type utility here — `button.tsx` appends `useTypeTier().action`, so a
 * button's label follows the register exactly as its height already does. Baked
 * in, a 32px compact button carried 15px page-register text.
 */
export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-(--control-gap) whitespace-nowrap rounded-[var(--button-radius,9999px)] motion-interactive motion-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:size-(--button-icon)",
	{
		variants: {
			variant: {
				/*
				 * Primary's hover reads `--primary-hover` — another OPTIONAL,
				 * mode-dependent var outside the `_contract.ts` token set, with the
				 * previous expression as its fallback. `hover:bg-primary/90` compiles
				 * to exactly the `color-mix(in oklab, …, transparent)` written below,
				 * so a theme that says nothing renders byte-identical to before.
				 *
				 * Why a hook rather than a constant: darkening on hover is a house
				 * convention, not a law. A dark-first reference commonly does the
				 * opposite — its brand fill BRIGHTENS under the pointer,
				 * because on a near-black ground a darker fill reads as disabled
				 * rather than as pressed. A theme sets `--primary-hover: <colour>` once
				 * (both modes if they differ) and the whole primary tier follows.
				 */
				primary:
					"bg-primary text-primary-foreground hover:bg-[var(--primary-hover,color-mix(in_oklab,var(--primary)_90%,transparent))]",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				outline:
					"border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				link: "bg-transparent text-foreground underline-offset-4 hover:underline",
				/*
				 * A control that floats OVER content — a carousel's arrows over its
				 * slides, a marquee's pause over its strip, a scroller's "jump to
				 * latest" over the conversation. It needs its own edge and lift
				 * because the content under it is arbitrary; the page tiers assume
				 * the page behind them. One look for all of them: three components
				 * restyling secondary/ghost three different ways was the alternative.
				 */
				floating:
					"border border-border-floating bg-popover/90 text-popover-foreground shadow-md backdrop-blur hover:bg-popover",
				/*
				 * A button docked in a panel among compact fields — a picker that
				 * opens a popover, "Add fill", a swatch's trigger. It wears the xs
				 * field rung's shell (lib/field-shell → FIELD_SHELL_XS): the inset
				 * `panel-field` fill, no border, the field's corner rather than the
				 * button's pill, so it reads as one of the row's controls. Secondary
				 * or ghost there read as page buttons dropped into tool chrome.
				 */
				field:
					"rounded-[var(--panel-field-radius,var(--radius-xs))] bg-panel-field text-panel-foreground hover:bg-panel-field-hover",
				/*
				 * On-colour tiers — for a button sitting ON a coloured fill (a tone
				 * band, a solid Banner, a brand panel, a dark section in a light
				 * page). Every tier above paints fixed page tokens, so on a fill
				 * they read as holes (secondary), vanish (ghost/outline ink is
				 * `foreground`, not the band's ink) or clash (primary).
				 *
				 * These derive everything from the SURFACE'S INK instead: the
				 * button keeps the colour it inherits (`currentColor` = the band's
				 * `text-*-foreground`) and paints with it, so one variant works on
				 * any fill, in any theme and mode, with no per-theme token.
				 *
				 * - `on-color`: solid. Background = the ink; label = the fill.
				 *   The button cannot see its parent's background, so the fill is
				 *   read from `--on-color-fill` when the surface names it (then
				 *   label/background contrast is exactly the theme's own tested
				 *   ink-on-fill pair, inverted). Unnamed, the label falls back to
				 *   black or white derived from the ink's OKLCH lightness — the
				 *   0.565 split is where both sides clear 4.5:1 against the ink.
				 *   Hover pushes the ink a quarter-step further from the fill (toward
				 *   white if the ink is light, black if dark) — never toward the
				 *   fill, because the themes' tone pairs sit close to 4.5:1 and any
				 *   fade toward the fill (the `/90` other tiers use) drops below it.
				 *   The label colour is set on the CHILDREN (`*:`), never on the
				 *   button: `bg-current` must keep reading the inherited ink, and
				 *   `trimLabel` wraps every text child in a span, so text, icons
				 *   and the loading spinner are all direct children.
				 * - `on-color-outline`: transparent, ink label, ink hairline.
				 * - `on-color-ghost`: transparent, ink label.
				 *   Both hover by washing the fill 12% toward the ink's OPPOSITE (a
				 *   shade under a light ink, a tint under a dark one). An ink-coloured
				 *   wash — the obvious `bg-current/10` — pulls the fill toward the
				 *   label and measured below 4.5:1 on twelve shipped pairs.
				 *
				 * Focus: `--ring` is tuned for page surfaces and can disappear on
				 * a fill, so these ring in the ink, offset by a transparent gap
				 * that shows the fill through — the ink-on-fill pair again.
				 */
				// design-lint-disable-next-line inline-color -- derives a contrast ink FROM currentColor (relative colour syntax); no literal colour is introduced
				"on-color": `${ON_COLOR_FOCUS} bg-current *:text-[color:var(--on-color-fill,oklch(from_currentColor_calc((0.565_-_l)*1000)_0_0))] hover:bg-[color:color-mix(in_oklab,currentColor_75%,oklch(from_currentColor_calc((l_-_0.565)*1000)_0_0))]`,
				// design-lint-disable-next-line inline-color -- the hover wash is derived FROM currentColor (relative colour syntax); no literal colour
				"on-color-outline": `${ON_COLOR_FOCUS} border border-current/50 bg-transparent hover:border-current hover:bg-[color:oklch(from_currentColor_calc((0.565_-_l)*1000)_0_0_/_0.12)]`,
				// design-lint-disable-next-line inline-color -- the hover wash is derived FROM currentColor (relative colour syntax); no literal colour
				"on-color-ghost": `${ON_COLOR_FOCUS} bg-transparent hover:bg-[color:oklch(from_currentColor_calc((0.565_-_l)*1000)_0_0_/_0.12)]`,
			},
			/**
			 * Heights read the density ladder (`--control-*`) rather than hardcoding
			 * px, which is what makes the two registers work: a
			 * `data-density="compact"` scope redefines the vars and every control
			 * follows, with no selector overriding a height after the fact. See
			 * styles.css → Density and themes/_contract.ts → DENSITY_TOKENS.
			 *
			 * Comfortable values are exactly the previous literals (sm 32, md 40,
			 * cta 44, icon 40, icon-sm 32), so the page register is unchanged.
			 * `xs` / `icon-xs` are new and exist for the workspace floor — 24px icon
			 * buttons in a 240px panel, which is what Paper and Figma both run.
			 */
			size: {
				/*
				 * --button-icon: icons render a step LARGER than the label. A
				 * 24-grid glyph shrunk to label size (14px) thins its 1.5px strokes
				 * to ~0.9px against a ~1.7px type stem — the icon reads faint and
				 * small beside its word. One size per step keeps glyph and label at
				 * matching weight; icon-only sizes run a step larger again.
				 */
				/*
				 * --button-px: the inline padding, named so `bleed` can pull the box
				 * outward by exactly this much and land the label on the edge. The
				 * padding READS it, so the two cannot drift; to retune a button's
				 * padding set the var (`[--button-px:--spacing(2)]`), not px-*.
				 * Icon-only sizes have no padding — the glyph is centred in a
				 * square — so theirs is the inset from the box edge to the glyph's.
				 */
				xs: "h-(--control-xs) px-(--button-px) [--button-px:--spacing(2)] [--button-icon:0.875rem]",
				sm: "h-(--control-sm) px-(--button-px) [--button-px:--spacing(3)] [--button-icon:1rem]",
				md: "h-(--control-md) px-(--button-px) [--button-px:--spacing(4)] [--button-icon:1.125rem]",
				cta: "h-(--control-cta) px-(--button-px) [--button-px:--spacing(5)] [--button-icon:1.25rem]",
				icon: "h-(--control-md) w-(--control-md) [--button-icon:1.25rem] [--button-px:calc((var(--control-md)-var(--button-icon))/2)]",
				"icon-sm":
					"h-(--control-sm) w-(--control-sm) [--button-icon:1.125rem] [--button-px:calc((var(--control-sm)-var(--button-icon))/2)]",
				"icon-xs":
					"h-(--control-xs) w-(--control-xs) p-0 [--button-icon:1rem] [--button-px:calc((var(--control-xs)-var(--button-icon))/2)]",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
)
