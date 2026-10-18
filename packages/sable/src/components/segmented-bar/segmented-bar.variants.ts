import { cva } from "class-variance-authority"

/**
 * One segment's fill. The decorative tones lead, because a breakdown names
 * categories (kinds of sale, file types, teams), not good and bad; the status
 * tones are there for the breakdown that is a judgement (passed / flaky /
 * failed).
 */
export const segmentedBarSegmentVariants = cva(
	"h-full min-w-0.5 basis-0 transition-[flex-grow,background-color] duration-(--motion-duration-slow) ease-decelerate",
	{
		variants: {
			tone: {
				"1": "bg-tone-1-mark",
				"2": "bg-tone-2-mark",
				"3": "bg-tone-3-mark",
				info: "bg-tone-info-mark",
				primary: "bg-primary",
				neutral: "bg-muted-foreground",
				success: "bg-success-mark",
				warning: "bg-tone-warning-mark",
				destructive: "bg-destructive-mark",
			},
		},
		defaultVariants: {
			tone: "3",
		},
	},
)

/** Bar thickness — the same three rails as Meter and Progress. */
export const segmentedBarVariants = cva("flex w-full gap-0.5 overflow-hidden rounded-full", {
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
