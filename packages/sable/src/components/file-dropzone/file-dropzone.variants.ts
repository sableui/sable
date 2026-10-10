import { cva } from "class-variance-authority"

/**
 * The drop target. One shape, three states read from data attributes rather
 * than variants, because they change during a single gesture and a variant
 * would re-render the class string on every dragenter:
 *
 *   data-dragging   a file is over the zone — the border turns primary
 *   data-invalid    the last selection had a rejected file
 *   disabled        the native button state
 *
 * `size` is the only axis a caller chooses: `md` is the empty-state target that
 * owns its section, `sm` is the compact strip that sits above a file list that
 * already has files in it.
 */
export const fileDropzoneVariants = cva(
	[
		"group flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-card text-center text-foreground motion-interactive",
		"hover:border-primary hover:bg-muted",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		"data-[dragging]:border-primary data-[dragging]:bg-accent data-[dragging]:text-accent-foreground",
		"data-[invalid]:border-destructive",
		"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:bg-card",
	],
	{
		variants: {
			size: {
				md: "px-6 py-8",
				sm: "flex-row justify-start gap-3 px-4 py-3 text-start",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
)
