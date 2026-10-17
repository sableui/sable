import { cva } from "class-variance-authority"

/**
 * One tool call, as a quiet bordered row inside an assistant turn. It sits on
 * the card surface so it reads as a record of something the agent did, not as
 * a second message: no tone fill, no shadow. A failure is said by the glyph and
 * the error line, and the border warms a step so a failed call is findable when
 * scanning back up a long thread.
 */
export const toolCallVariants = cva(
	"w-full overflow-hidden rounded-md border bg-card text-start",
	{
		variants: {
			status: {
				running: "border-border",
				awaiting: "border-border",
				complete: "border-border",
				error: "border-destructive/40",
				denied: "border-border",
			},
		},
		defaultVariants: { status: "running" },
	},
)

/** The header row. When the call has details to show it is the disclosure trigger. */
export const toolCallHeaderVariants = cva(
	"flex w-full min-w-0 items-center gap-2 px-3 py-2 text-start",
	{
		variants: {
			interactive: {
				true: "cursor-pointer motion-interactive sable-surface-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
				false: "",
			},
		},
		defaultVariants: { interactive: false },
	},
)
