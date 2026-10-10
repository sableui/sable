import { cva } from "class-variance-authority"

/**
 * A non-boxed status line — a leading semantic icon + one line of text over a
 * tone scale. The inline counterpart to the boxed `Note`, reusing Note's
 * tone→icon mapping so the two read as siblings. Semantic tokens only.
 */
export const inlineStatusVariants = cva("inline-flex items-start gap-1.5", {
	variants: {
		size: {
			sm: "text-body-sm",
			md: "text-body-md",
		},
	},
	defaultVariants: {
		size: "sm",
	},
})

/**
 * The canonical status-tone vocabulary (neutral/info/success/warning/
 * destructive), shared with Note, Banner and EmptyState. There is no `error`.
 */
export { STATUS_TONE_ICON as inlineToneIcon, type StatusTone as InlineTone } from "../../lib/status-tone"
