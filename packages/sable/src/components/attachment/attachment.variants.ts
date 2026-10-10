import { cva } from "class-variance-authority"

/**
 * Attachment card. Two shapes for two jobs:
 *
 * - `card` — a horizontal row: lead glyph or thumbnail, name, metadata. The
 *   right shape for documents, where the filename IS the content.
 * - `media` — a square tile that is mostly image. The right shape for photos,
 *   where a filename tells you nothing and the pixels tell you everything.
 *
 * The corner reads `--attachment-radius` (default `--radius-md`) and the inset
 * and lead tile derive from it, so a container that holds attachments near its
 * own corner (ChatComposer) can set one var and keep everything concentric.
 *
 * `error` is a state, not a variant, so it composes with both: a failed upload
 * has to stay recognisable as the thing it was.
 */
export const attachmentVariants = cva(
	"group/attachment relative isolate overflow-hidden rounded-[var(--attachment-radius,var(--radius-md))] border text-start motion-interactive",
	{
		variants: {
			variant: {
				// The inset grows with the corner radius (half of it, never under 8px), so a
				// rounder card does not crowd its tile and progress bar into the curve.
				card: "flex w-full max-w-xs items-center gap-3 p-[max(--spacing(2),calc(var(--attachment-radius,var(--radius-md))/2))]",
				media: "block size-28",
			},
			status: {
				idle: "border-border bg-card",
				uploading: "border-border bg-card",
				error: "border-destructive/40 bg-destructive/5",
			},
			interactive: {
				true: "hover:border-border-strong",
				false: "",
			},
		},
		defaultVariants: {
			variant: "card",
			status: "idle",
			interactive: false,
		},
	},
)

/** The lead square in `card` — a thumbnail crop or a glyph on a muted tile. */
export const attachmentMediaVariants = cva(
	"flex shrink-0 items-center justify-center overflow-hidden bg-muted text-muted-foreground",
	{
		variants: {
			variant: {
				// Concentric with the card: its radius less the inset. The tile sits right
				// at the edge, so it follows the curve rather than a floor (4px minimum).
				card: "size-10 rounded-[max(--spacing(1),calc(var(--attachment-radius,var(--radius-md))-max(--spacing(2),calc(var(--attachment-radius,var(--radius-md))/2))))]",
				media: "size-full rounded-none",
			},
		},
		defaultVariants: { variant: "card" },
	},
)
