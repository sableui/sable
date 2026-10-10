import { cva } from "class-variance-authority"

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
export const BADGE_TONES = ["neutral", "standard", "collectible", "edition", "info", "success", "warning", "destructive"] as const
export type BadgeTone = (typeof BADGE_TONES)[number]
export const BADGE_APPEARANCES = ["soft", "outline", "solid", "overlay", "plain"] as const
export type BadgeAppearance = (typeof BADGE_APPEARANCES)[number]

const MATRIX: Record<BadgeAppearance, Record<BadgeTone, string>> = {
	soft: {
		neutral: "bg-secondary text-secondary-foreground",
		standard: "bg-tone-standard/15 text-tone-standard",
		collectible: "bg-tone-collectible/15 text-tone-collectible",
		edition: "bg-tone-edition/15 text-tone-edition",
		info: "bg-tone-info/15 text-tone-info",
		success: "bg-success/15 text-success",
		warning: "bg-tone-warning/15 text-tone-warning",
		destructive: "bg-destructive/15 text-destructive",
	},
	outline: {
		neutral: "border border-border text-foreground",
		standard: "border border-tone-standard/50 text-tone-standard",
		collectible: "border border-tone-collectible/50 text-tone-collectible",
		edition: "border border-tone-edition/50 text-tone-edition",
		info: "border border-tone-info/50 text-tone-info",
		success: "border border-success/50 text-success",
		warning: "border border-tone-warning/50 text-tone-warning",
		destructive: "border border-destructive/50 text-destructive",
	},
	solid: {
		neutral: "bg-foreground text-background",
		standard: "bg-tone-standard text-tone-standard-foreground",
		collectible: "bg-tone-collectible text-tone-collectible-foreground",
		edition: "bg-tone-edition text-tone-edition-foreground",
		info: "bg-tone-info text-tone-info-foreground",
		success: "bg-success text-success-foreground",
		warning: "bg-tone-warning text-tone-warning-foreground",
		destructive: "bg-destructive text-destructive-foreground",
	},
	overlay: {
		neutral: "bg-overlay/85 text-overlay-foreground",
		standard: "bg-tone-standard text-tone-standard-foreground",
		collectible: "bg-tone-collectible text-tone-collectible-foreground",
		edition: "bg-tone-edition text-tone-edition-foreground",
		info: "bg-tone-info text-tone-info-foreground",
		success: "bg-success text-success-foreground",
		warning: "bg-tone-warning text-tone-warning-foreground",
		destructive: "bg-destructive text-destructive-foreground",
	},
	plain: {
		neutral: "text-muted-foreground",
		standard: "text-foreground",
		collectible: "text-foreground",
		edition: "text-foreground",
		info: "text-foreground",
		success: "text-foreground",
		warning: "text-foreground",
		destructive: "text-destructive",
	},
}

export const badgeVariants = cva(
	"sable-optical-pad [--sable-optical-pad:0.6em] inline-flex w-fit items-center whitespace-nowrap rounded-full",
	{
		variants: {
			appearance: { soft: "gap-1", outline: "gap-1", solid: "gap-1", overlay: "gap-1", plain: "gap-1.5" },
			tone: { neutral: "", standard: "", collectible: "", edition: "", info: "", success: "", warning: "", destructive: "" },
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
