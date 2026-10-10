import { cva } from "class-variance-authority"

/**
 * Callout / admonition box. Each variant pairs a low-alpha tone fill with a
 * matching tone-colored border — theme-safe in light and dark (no palette
 * reference). The leading icon color is driven separately (see `note.tsx`).
 *
 * Variants follow the canonical status-tone vocabulary
 * (neutral/info/success/warning/destructive).
 */

export const noteVariants = cva(
	"flex gap-3 rounded-md border p-4 text-body-sm text-foreground",
	{
		variants: {
			tone: {
				info: "border-tone-info/30 bg-tone-info/10",
				warning: "border-tone-warning/30 bg-tone-warning/10",
				success: "border-success/30 bg-success/10",
				destructive: "border-destructive/30 bg-destructive/10",
				neutral: "border-border bg-muted/40",
			},
		},
		defaultVariants: {
			tone: "info",
		},
	},
)
