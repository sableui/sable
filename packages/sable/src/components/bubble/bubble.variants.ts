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
 * The tail is a small ear drawn off the speaker-side top corner, which goes
 * square to meet it; the other three corners keep the theme's radius. The ear
 * is the same 5px in every radius language, flat through fully pilled, so a
 * bubble always says "this side is the speaker". In a rounded theme its tip and
 * the inner corner where it meets the bubble are rounded too; square, both stay
 * sharp. See BubbleTail in bubble.tsx.
 */
// --bubble-ear is the tail's width. Every surfaced bubble reserves it as a margin
// on the speaker side, tailed or not, so a grouped run's continuations line up with
// the tailed bubble above them and a bubble flush with a scroller's edge (own
// messages usually are) doesn't have its tail clipped. The tail itself is BubbleTail
// in bubble.tsx: an SVG, so its tip and its inner corner can be rounded.
const EAR_SPACE = "[--bubble-ear:5px]"
/** The tail's placement and mirroring, per side and surface. */
export const bubbleTailVariants = cva(
	"pointer-events-none absolute h-[9.5px] w-[6px] overflow-visible",
	{
		variants: {
			// Its x = 1 is the bubble's outer edge: on a solid bubble that is the
			// padding edge, so the box tucks 1px under it; outline's 1px border puts
			// the outer edge 1px further out, and its top 1px higher.
			surface: {
				solid: "top-0",
				outline: "-top-px",
			},
			// Drawn pointing to the end side; the start tail is its mirror image,
			// and in a right-to-left layout each swaps.
			align: {
				start: "-scale-x-100 rtl:scale-x-100",
				end: "rtl:-scale-x-100",
			},
		},
		compoundVariants: [
			{ surface: "solid", align: "start", className: "end-[calc(100%-1px)]" },
			{ surface: "solid", align: "end", className: "start-[calc(100%-1px)]" },
			{ surface: "outline", align: "start", className: "end-full" },
			{ surface: "outline", align: "end", className: "start-full" },
		],
	},
)

// The focus ring is for a bubble that is a trigger: the right-click / long-press
// target of a message's menu, made focusable so Shift+F10 opens it too.
export const bubbleVariants = cva(
	"relative w-fit max-w-[42rem] whitespace-pre-wrap break-words rounded-lg px-3.5 py-2.5 text-body-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
			{ variant: ["muted", "primary", "outline"], className: EAR_SPACE },
			{ align: "start", variant: ["muted", "primary", "outline"], className: "ms-(--bubble-ear)" },
			{ align: "end", variant: ["muted", "primary", "outline"], className: "me-(--bubble-ear)" },
			// The speaker-side top corner goes square to meet the tail.
			{ tail: true, align: "start", variant: ["muted", "primary", "outline"], className: "rounded-ss-none" },
			{ tail: true, align: "end", variant: ["muted", "primary", "outline"], className: "rounded-se-none" },
			// A surfaceless bubble has no surface to hang a tail from.
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
