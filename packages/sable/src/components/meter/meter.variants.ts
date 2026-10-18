import { cva } from "class-variance-authority"

/** The tone fills, shared by the continuous indicator and the segmented ticks. */
const meterToneFill = {
	primary: "bg-primary",
	"3": "bg-tone-3-mark",
	success: "bg-success-mark",
	warning: "bg-tone-warning-mark",
	destructive: "bg-destructive-mark",
} as const

/**
 * The meter's fill colour. A meter measures something that can be good or bad
 * (storage, quota, signal strength), so — unlike Progress, which is always
 * "on its way" — its colour is allowed to carry judgement. Pick the tone at
 * the call site from thresholds you own; the component does not guess them.
 */
export const meterIndicatorVariants = cva(
	"h-full rounded-full transition-[width,background-color] duration-(--motion-duration-slow) ease-decelerate",
	{
		variants: {
			tone: meterToneFill,
		},
		defaultVariants: {
			tone: "primary",
		},
	},
)

/**
 * Bar thickness, per size. Shared with Progress (`progressTrackVariants`): a
 * meter and a progress bar on one page sit on the same three rails, so neither
 * reaches for a className height override to match the other.
 */
export const meterTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-secondary", {
	variants: {
		size: {
			sm: "h-1.5",
			md: "h-2",
			lg: "h-3",
		},
	},
	defaultVariants: {
		size: "md",
	},
})

/**
 * The segmented (tick-bar) track: a row of separate marks instead of one rail.
 * Taller than the continuous rails on purpose — a tick bar reads as a row of
 * marks, and at rail height the gaps close up into a dotted line.
 */
export const meterSegmentedTrackVariants = cva("flex w-full gap-0.5", {
	variants: {
		size: {
			sm: "h-3",
			md: "h-4",
			lg: "h-5",
		},
	},
	defaultVariants: {
		size: "md",
	},
})

/**
 * One tick. Filled ticks take the Meter's tone (the same fills as
 * `meterIndicatorVariants`); empty ticks sit on `bg-secondary`, like the rail.
 * The colour eases on the fast token; the per-tick stagger is set inline.
 */
export const meterTickVariants = cva(
	// The corner follows the theme's smallest radius but stops at half a spacing
	// step: a tick is a few px wide, and at the full radius-xs (4px in most
	// themes) it rounded into a pill and the row read as a string of beads.
	"h-full min-w-0 flex-1 rounded-[min(var(--radius-xs),--spacing(0.5))] transition-[background-color] duration-(--motion-duration-fast) ease-standard",
	{
		variants: {
			tone: { primary: "", "3": "", success: "", warning: "", destructive: "" },
			filled: { true: "", false: "bg-secondary" },
		},
		compoundVariants: (Object.keys(meterToneFill) as (keyof typeof meterToneFill)[]).map((tone) => ({
			tone,
			filled: true,
			class: meterToneFill[tone],
		})),
		defaultVariants: {
			tone: "primary",
			filled: false,
		},
	},
)

/** The ring's centre reading, stepped with the ring so it fills each hole evenly. */
export const meterRingValueVariants = cva("absolute inset-0 flex items-center justify-center text-foreground", {
	variants: {
		size: {
			sm: "text-label-xs",
			md: "text-label-md",
			lg: "text-title-sm",
		},
	},
	defaultVariants: {
		size: "md",
	},
})

/** The ring's diameter, per size (what Gauge was). */
export const meterRingVariants = cva("relative inline-flex shrink-0", {
	variants: {
		size: {
			sm: "size-10",
			md: "size-16",
			lg: "size-24",
		},
	},
	defaultVariants: {
		size: "md",
	},
})
