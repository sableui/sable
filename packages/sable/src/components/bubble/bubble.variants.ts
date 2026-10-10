import { cva } from "class-variance-authority"

/**
 * The message surface.
 *
 * `max-w-[42rem]` is a measure, not a decoration: a bubble that spans a wide
 * viewport is a paragraph at 140 characters per line, which is unreadable in
 * exactly the place people read most. Callers who need the full width — a
 * rendered table, a code block — reach for `variant="plain"`, which drops the
 * surface and the cap together.
 *
 * The tail is a flattened corner rather than a drawn arrow: it survives every
 * theme's radius language (including the flat and the fully-pilled ones) with no
 * per-theme geometry, and it reads as "this side is the speaker" at a glance
 * without adding a shape the palette has to support.
 */
export const bubbleVariants = cva(
	"relative w-fit max-w-[42rem] whitespace-pre-wrap break-words rounded-lg px-3.5 py-2.5 text-body-md",
	{
		variants: {
			variant: {
				/** The other party. The resting conversational surface. */
				muted: "bg-muted text-foreground",
				/** The reader's own messages. */
				primary: "bg-primary text-primary-foreground",
				/** A quieter own-side or a secondary channel. */
				outline: "border border-border bg-card text-card-foreground",
				/**
				 * No surface at all — for long-form assistant output (markdown,
				 * code, tables) where a tinted box around three paragraphs reads as
				 * a quote block rather than as a turn.
				 */
				plain: "max-w-none bg-transparent px-0 py-0 text-foreground",
			},
			align: {
				start: "",
				end: "",
			},
			tail: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			{ tail: true, align: "start", className: "rounded-tl-sm" },
			{ tail: true, align: "end", className: "rounded-tr-sm" },
			// A surfaceless bubble has no corner to flatten; flattening one anyway
			// would round the *text*'s invisible box and show nothing.
			{ variant: "plain", className: "rounded-none" },
		],
		defaultVariants: {
			variant: "muted",
			align: "start",
			tail: true,
		},
	},
)

/**
 * Reaction row. Sits under the bubble at the message column's own small gap —
 * that nearness, against the much larger gap between messages, is what says
 * "these belong to this message". It used to be pulled up (-mt-1.5) to overlap
 * the bubble's edge, but the column's gap is smaller than the pull, so the
 * pills collided with the bubble by ~2px: too little to read as a deliberate
 * tuck, enough to read as broken.
 */
export const bubbleReactionsVariants = cva(
	"flex flex-wrap items-center gap-1",
	{
		variants: {
			align: {
				start: "justify-start",
				end: "justify-end",
			},
		},
		defaultVariants: { align: "start" },
	},
)
