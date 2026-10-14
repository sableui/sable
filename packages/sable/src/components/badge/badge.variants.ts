import { cva } from "class-variance-authority"
import { PALETTE_COLORS, type PaletteColor } from "../../lib/palette"

/**
 * A badge is two independent choices: how it is DRAWN (`appearance`) and what
 * it MEANS (`tone`). They used to be one flat list of eleven variants that mixed
 * the two, plus MediaPill (a badge on artwork) and StatusBadge (a dot and a
 * label) as separate components. Every combination is spelled out below as
 * literal classes so Tailwind can see it.
 *
 * - `soft`    a low-alpha fill of the tone with tone-coloured text — the default,
 *             theme-safe in both modes. Neutral is the secondary surface.
 * - `outline` a hairline in the tone, no fill.
 * - `solid`   the tone at full strength with its paired foreground; neutral is
 *             the inverted chip (foreground fill) for emphasis labels.
 * - `overlay` for a badge that sits ON media: a dark scrim (neutral) or the
 *             solid tone, both legible over any image.
 * - `plain`   no fill and no padding: a status line, usually with `dot`
 *             ("● Ready"). Neutral and the calm tones keep the body ink;
 *             destructive turns the label itself.
 */
export const BADGE_TONES = ["neutral", "1", "2", "3", "info", "success", "warning", "destructive", ...PALETTE_COLORS] as const
export type BadgeTone = (typeof BADGE_TONES)[number]
export const BADGE_APPEARANCES = ["soft", "outline", "solid", "overlay", "plain"] as const
export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number]

/**
 * A palette family (`tone="blue"`) is a category with no meaning attached: a
 * tag, a label, a project colour. Badge sets `data-palette` to the family, and
 * these paint from the slots that fills (palette.css), so the classes are the
 * same for every family and no step is named here. Soft is a wash with deep
 * ink, outline an edge with the same ink, solid the deep step with page-side
 * ink; each pair is held to 4.5:1 in every theme and mode (palette.test.ts).
 */
const FAMILY: Record<BadgeAppearance, string> = {
	soft: "bg-palette-wash text-palette-text",
	outline: "border border-palette-edge text-palette-text",
	solid: "bg-palette-solid text-palette-solid-ink",
	overlay: "bg-palette-solid text-palette-solid-ink",
	plain: "text-foreground",
}
const families = (appearance: BadgeAppearance) => Object.fromEntries(PALETTE_COLORS.map((color) => [color, FAMILY[appearance]])) as Record<PaletteColor, string>

const MATRIX: Record<BadgeAppearance, Record<BadgeTone, string>> = {
	// The ink is the tone pulled a quarter of the way to the page's own ink. The
	// raw tone clears 4.5:1 on the page, but on its own 15% wash it did not
	// (light info 4.2:1, dark tone 1 3.6:1, most of Verdant's tones ~4.1:1).
	// Mixing toward --foreground moves it AWAY from the wash in both modes and
	// every theme, and keeps the hue. Status tones mix from their -text token,
	// not the fill: dark fills now sit low enough for a white label, and ink
	// mixed from them fell under 4.5:1 (Meridian dark destructive, 3.8:1).
	soft: {
		neutral: "bg-secondary text-secondary-foreground",
		"3": "bg-tone-3/15 text-[color-mix(in_oklch,var(--tone-3)_75%,var(--foreground))]",
		"2": "bg-tone-2/15 text-[color-mix(in_oklch,var(--tone-2)_75%,var(--foreground))]",
		"1": "bg-tone-1/15 text-[color-mix(in_oklch,var(--tone-1)_75%,var(--foreground))]",
		info: "bg-tone-info/15 text-[color-mix(in_oklch,var(--tone-info-text)_75%,var(--foreground))]",
		success: "bg-success/15 text-[color-mix(in_oklch,var(--success-text)_75%,var(--foreground))]",
		warning: "bg-tone-warning/15 text-[color-mix(in_oklch,var(--tone-warning-text)_75%,var(--foreground))]",
		destructive: "bg-destructive/15 text-[color-mix(in_oklch,var(--destructive-text)_75%,var(--foreground))]",
		...families("soft"),
	},
	outline: {
		neutral: "border border-border text-foreground",
		"3": "border border-tone-3/50 text-tone-3",
		"2": "border border-tone-2/50 text-tone-2",
		"1": "border border-tone-1/50 text-tone-1",
		info: "border border-tone-info/50 text-tone-info",
		success: "border border-success/50 text-success",
		warning: "border border-tone-warning/50 text-tone-warning",
		destructive: "border border-destructive/50 text-destructive",
		...families("outline"),
	},
	solid: {
		neutral: "bg-foreground text-background",
		"3": "bg-tone-3 text-tone-3-foreground",
		"2": "bg-tone-2 text-tone-2-foreground",
		"1": "bg-tone-1 text-tone-1-foreground",
		info: "bg-tone-info text-tone-info-foreground",
		success: "bg-success text-success-foreground",
		warning: "bg-tone-warning text-tone-warning-foreground",
		destructive: "bg-destructive text-destructive-foreground",
		...families("solid"),
	},
	overlay: {
		neutral: "bg-overlay/85 text-overlay-foreground",
		"3": "bg-tone-3 text-tone-3-foreground",
		"2": "bg-tone-2 text-tone-2-foreground",
		"1": "bg-tone-1 text-tone-1-foreground",
		info: "bg-tone-info text-tone-info-foreground",
		success: "bg-success text-success-foreground",
		warning: "bg-tone-warning text-tone-warning-foreground",
		destructive: "bg-destructive text-destructive-foreground",
		...families("overlay"),
	},
	plain: {
		neutral: "text-muted-foreground",
		"3": "text-foreground",
		"2": "text-foreground",
		"1": "text-foreground",
		info: "text-foreground",
		success: "text-foreground",
		warning: "text-foreground",
		destructive: "text-destructive",
		...families("plain"),
	},
}

export const badgeVariants = cva(
	"sable-optical-pad [--sable-optical-pad:0.6em] inline-flex w-fit items-center whitespace-nowrap rounded-full",
	{
		variants: {
			// Every drawn appearance carries a 1px border — transparent unless it is
			// the outline — so soft, solid and outline badges are one height in a
			// mixed row (outline alone was a pixel taller).
			appearance: {
				soft: "gap-1 border border-transparent",
				outline: "gap-1",
				solid: "gap-1 border border-transparent",
				overlay: "gap-1 border border-transparent",
				plain: "gap-1.5",
			},
			tone: { neutral: "", "1": "", "2": "", "3": "", info: "", success: "", warning: "", destructive: "", red: "", orange: "", yellow: "", green: "", teal: "", blue: "", purple: "", pink: "" },
			size: {
				sm: "text-label-sm",
				md: "text-label-md",
			},
		},
		compoundVariants: [
			...BADGE_APPEARANCES.flatMap((appearance) =>
				BADGE_TONES.map((tone) => ({ appearance, tone, className: MATRIX[appearance][tone] })),
			),
			// Padding belongs to the drawn appearances; a plain status line has none.
			{ appearance: ["soft", "outline", "solid", "overlay"], size: "sm", className: "px-2 pt-[0.2em] pb-[0.08em]" },
			{ appearance: ["soft", "outline", "solid", "overlay"], size: "md", className: "px-2.5 pt-[0.23em] pb-[0.1em]" },
		],
		defaultVariants: {
			appearance: "soft",
			tone: "neutral",
			size: "md",
		},
	},
)
