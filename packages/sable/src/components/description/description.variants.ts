import { cva } from "class-variance-authority"

/**
 * The definition-list container. A single-column grid by default; `cols="2"`
 * lays term/detail pairs two-wide when the list is at least @md wide (a container query) for compact metadata blocks.
 * Semantic tokens only — no palette references.
 */
export const descriptionVariants = cva("grid items-baseline gap-x-6 gap-y-3", {
	variants: {
		cols: {
			"1": "grid-cols-[max-content_minmax(0,1fr)]",
			// Two pairs a row once the LIST's container is wide enough — not the
				// viewport: a two-column list in a narrow card on a wide screen
				// used to get four columns and overflow. Description wraps the
				// list in an `@container` for this.
				"2": "grid-cols-[max-content_minmax(0,1fr)] @md:grid-cols-[max-content_minmax(0,1fr)_max-content_minmax(0,1fr)]",
		},
	},
	defaultVariants: {
		cols: "1",
	},
})

/**
 * The detail (value) tone. `default` is the plain foreground value; the semantic
 * tones color a status value (e.g. "Ended" muted, "Active" success) without an
 * inline conditional palette class. Semantic tokens only.
 */
// min-w-0 + break-words: a long unbroken value (a wallet address, a hash, a
// URL) wraps inside its column instead of blowing the grid out.
export const detailToneVariants = cva("min-w-0 break-words text-body-md", {
	variants: {
		tone: {
			default: "text-foreground",
			muted: "text-muted-foreground",
			success: "text-success",
			warning: "text-tone-warning",
			destructive: "text-destructive",
		},
	},
	defaultVariants: {
		tone: "default",
	},
})
