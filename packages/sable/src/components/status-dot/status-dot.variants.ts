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
			"3": "bg-tone-3",
			success: "bg-success",
			warning: "bg-tone-warning",
			info: "bg-tone-info",
			"1": "bg-tone-1",
			"2": "bg-tone-2",
			destructive: "bg-destructive",
			// A palette family paints from the slot its data-palette scope fills.
			red: "bg-palette-dot",
			orange: "bg-palette-dot",
			yellow: "bg-palette-dot",
			green: "bg-palette-dot",
			teal: "bg-palette-dot",
			blue: "bg-palette-dot",
			purple: "bg-palette-dot",
			pink: "bg-palette-dot",
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
