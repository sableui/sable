import { cva } from "class-variance-authority"

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
			tone: {
				primary: "bg-primary",
				"3": "bg-tone-3",
				success: "bg-success",
				warning: "bg-tone-warning",
				destructive: "bg-destructive",
			},
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
