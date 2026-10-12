import { cva } from "class-variance-authority"

/**
 * MediaTile — one `size` axis that moves the type tier, the cover-to-text gap,
 * the cover's corner and how far the overlay slots sit in from it, together.
 * Every step is on the spacing scale and every corner is a theme radius, so a
 * preset that rounds or squares its shapes retunes the tiles with it.
 *
 * The root is the reveal host (`group`) and the stretched link's positioning
 * context (`relative isolate`), and it publishes the cover's corner as
 * `--stretched-link-radius`, so the focus ring the title link draws around the
 * whole tile wears the same curve as the cover.
 */
export const mediaTileVariants = cva("group relative isolate flex min-w-0 flex-col", {
	variants: {
		size: {
			sm: "gap-2 [--media-tile-radius:var(--radius-sm)]",
			md: "gap-3 [--media-tile-radius:var(--radius-md)]",
			lg: "gap-3 [--media-tile-radius:var(--radius-lg)]",
		},
	},
	defaultVariants: { size: "md" },
})

/** Where the action and badge sit in from the cover's edge — clear of its curve. */
export const mediaTileInsetVariants = cva("", {
	variants: {
		size: {
			sm: "[--media-tile-inset:calc(var(--spacing)*1.5)]",
			md: "[--media-tile-inset:calc(var(--spacing)*2)]",
			lg: "[--media-tile-inset:calc(var(--spacing)*3)]",
		},
	},
	defaultVariants: { size: "md" },
})

export const mediaTileTitleVariants = cva("min-w-0 truncate text-foreground", {
	variants: {
		size: {
			sm: "text-label-md",
			md: "text-label-lg",
			lg: "text-title-lg",
		},
	},
	defaultVariants: { size: "md" },
})

export const mediaTileSubtitleVariants = cva("min-w-0 truncate text-muted-foreground", {
	variants: {
		size: {
			sm: "text-caption",
			md: "text-body-sm",
			lg: "text-body-md",
		},
	},
	defaultVariants: { size: "md" },
})
