import { cva } from "class-variance-authority"

/**
 * A small colored status indicator. Tones map to semantic tone tokens
 * (theme-safe in light and dark); sizes scale the dot diameter. Always
 * rounded-full and shrink-0 so it holds its shape inline next to text.
 */
export const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
	variants: {
		tone: {
			neutral: "bg-muted-foreground",
			standard: "bg-tone-standard",
			success: "bg-success",
			warning: "bg-tone-warning",
			info: "bg-tone-info",
			edition: "bg-tone-edition",
			collectible: "bg-tone-collectible",
			destructive: "bg-destructive",
		},
		size: {
			sm: "size-1.5",
			md: "size-2",
			lg: "size-2.5",
		},
	},
	defaultVariants: {
		tone: "neutral",
		size: "md",
	},
})
