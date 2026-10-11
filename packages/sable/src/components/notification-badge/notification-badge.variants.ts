import { cva } from "class-variance-authority"

/**
 * Notification indicators — a bare `dot` or a `count` pill. `tone` selects the
 * fill (destructive by default; primary/neutral for non-alarming counts) and
 * `size` scales the indicator on the spacing scale, so density moves it.
 * `overlay` pins it to the top-end corner of a `relative` host (an icon
 * button), so every caller lands on the same corner instead of hand-tuning
 * offsets. Semantic tokens only — theme-safe in light + dark.
 */
export const notificationDotVariants = cva("inline-block rounded-full", {
	variants: {
		tone: {
			destructive: "bg-destructive",
			primary: "bg-primary",
			neutral: "bg-muted-foreground", // StatusDot's neutral, so the two dots are one grey
		},
		size: {
			sm: "size-1.5",
			md: "size-2",
			lg: "size-2.5",
		},
		// A dot is small enough to sit inside the corner; a count straddles it.
		overlay: {
			true: "absolute end-1 top-1",
			false: "",
		},
	},
	defaultVariants: {
		tone: "destructive",
		size: "md",
		overlay: false,
	},
})

export const notificationCountVariants = cva(
	"inline-flex items-center justify-center rounded-full px-1 text-label-xs",
	{
		variants: {
			tone: {
				destructive: "bg-destructive text-destructive-foreground",
				primary: "bg-primary text-primary-foreground",
				neutral: "bg-secondary text-secondary-foreground",
			},
			size: {
				sm: "h-4 min-w-4",
				md: "h-4.5 min-w-4.5",
				lg: "h-5 min-w-5",
			},
			overlay: {
				true: "absolute -end-0.5 -top-0.5",
				false: "",
			},
		},
		defaultVariants: {
			tone: "destructive",
			size: "md",
			overlay: false,
		},
	},
)
