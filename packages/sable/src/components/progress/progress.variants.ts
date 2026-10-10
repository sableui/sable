import { cva } from "class-variance-authority"

/**
 * Bar thickness, per size. The same three rails as Meter's track
 * (`meterTrackVariants`), so a progress bar and a meter on one page match
 * without a className height override.
 */
export const progressTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-secondary", {
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
