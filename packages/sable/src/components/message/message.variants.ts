import { cva } from "class-variance-authority"

/**
 * Message row. One horizontal band: an avatar gutter, then a column holding
 * header / content / footer.
 *
 * `align="end"` reverses the row rather than justifying it, so the gutter, the
 * header and the footer all move together and the outgoing side is a mirror of
 * the incoming one instead of a second layout to maintain.
 *
 * `grouped` closes the gap the scroller put between rows — a run of messages
 * from one author should read as one block, not as a list. It reaches for
 * `--message-gap`, which `<MessageScroller gap>` publishes, so the collapse
 * stays correct at every rhythm; the fallback matches the default step for a
 * `<Message>` used outside a scroller. Both the gap and the one step left
 * between grouped rows are on the spacing scale, so density moves them together.
 */
export const messageVariants = cva("group/message flex w-full", {
	variants: {
		align: {
			start: "flex-row",
			end: "flex-row-reverse",
		},
		grouped: {
			true: "-mt-[calc(var(--message-gap,calc(var(--spacing)*4))-var(--spacing))]",
			false: "",
		},
	},
	defaultVariants: {
		align: "start",
		grouped: false,
	},
})

/**
 * The avatar gutter. It keeps its width when `grouped` hides the avatar — that
 * reserved column is what makes a run of messages line up instead of stepping
 * left, and it is the single most common thing hand-built chat UIs get wrong.
 */
export const messageAvatarVariants = cva("shrink-0", {
	variants: {
		align: {
			start: "mr-3",
			end: "ml-3",
		},
	},
	defaultVariants: { align: "start" },
})

/**
 * The stacked column: header, content, footer.
 *
 * `items-*` only — deliberately NOT `text-end` for the outgoing side. Aligning
 * the column's items pushes the bubble, the header and the footer to the
 * speaker's edge, which is what "my messages are on the right" means. Aligning
 * the *text* would also right-rag the prose inside a multi-line bubble, and a
 * paragraph ragged on the left is measurably harder to read — the eye loses the
 * start of each line. No chat client does it; it only looks plausible until a
 * message runs past one line.
 */
export const messageBodyVariants = cva("flex min-w-0 flex-col gap-1", {
	variants: {
		align: {
			start: "items-start",
			end: "items-end",
		},
	},
	defaultVariants: { align: "start" },
})
