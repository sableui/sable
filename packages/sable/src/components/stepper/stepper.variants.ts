import { cva } from "class-variance-authority"

/**
 * The numbered disc. Status is the only axis: the disc carries the step's
 * state in fill and border, so it reads correctly even when the title is
 * truncated or the stepper is collapsed to discs only.
 *
 *   complete   filled primary — done, and the commonest state in a long flow
 *   current    primary outline — "you are here"
 *   upcoming   quiet outline — not yet reachable
 *   error      filled destructive — something on that step needs attention
 *
 * The hollow states fill with the surface they sit on (`--sable-surface-bg`,
 * which Card and the sable-surface utilities declare; the page background
 * otherwise), so the disc never shows a card-coloured hole on a page.
 */
export const stepperIndicatorVariants = cva(
	"relative z-10 flex size-(--control-xs) shrink-0 items-center justify-center rounded-full border text-label-sm motion-interactive",
	{
		variants: {
			status: {
				complete: "border-primary bg-primary text-primary-foreground",
				current: "border-2 border-primary bg-[var(--sable-surface-bg,var(--background))] text-primary",
				upcoming: "border-border-strong bg-[var(--sable-surface-bg,var(--background))] text-muted-foreground",
				error: "border-destructive bg-destructive text-destructive-foreground",
			},
		},
		defaultVariants: {
			status: "upcoming",
		},
	},
)

/**
 * The dot — `indicator="dot"`, for a timeline (an order's delivery, a
 * document's history) where the position number adds nothing. Sized in `em` of
 * the title's type, so it tracks the title at every density instead of the
 * spacing scale, which density stretches separately. Same four states as the
 * disc: filled, ringed, quiet, destructive.
 */
export const stepperDotVariants = cva(
	"size-[0.75em] shrink-0 rounded-full motion-interactive",
	{
		variants: {
			status: {
				complete: "bg-primary",
				current: "bg-[var(--sable-surface-bg,var(--background))] ring-[0.1875em] ring-primary ring-inset",
				upcoming: "bg-border-strong",
				error: "bg-destructive",
			},
		},
		defaultVariants: {
			status: "upcoming",
		},
	},
)

/**
 * The line from one dot to the next. The step carries its title's type, so
 * `lh` is one title line: the line runs from this dot's centre (half a line
 * down) to the next dot's centre (half a line into the next step), and sits
 * at half the dot's width.
 */
export const stepperDotConnectorVariants = cva("shrink-0 rounded-full motion-interactive", {
	variants: {
		orientation: {
			horizontal: "mt-[calc(0.5lh_-_1px)] h-0.5 min-w-4 flex-1",
			vertical:
				"absolute start-[0.375em] top-[0.5lh] -bottom-[0.5lh] w-0.5 -translate-x-1/2 rtl:translate-x-1/2",
		},
		filled: {
			true: "bg-primary",
			false: "bg-border-strong",
		},
	},
	defaultVariants: {
		orientation: "horizontal",
		filled: false,
	},
})

/**
 * The line from one disc to the next, filled once the step it leaves is
 * complete. Horizontal it is a flex sibling after the step's text; vertical it
 * hangs absolutely under the disc, so an interactive step can wrap disc and
 * text in one button without the line becoming part of the hit area.
 */
export const stepperConnectorVariants = cva("shrink-0 rounded-full motion-interactive", {
	variants: {
		orientation: {
			horizontal: "mt-[calc(var(--control-xs)/2)] h-px min-w-4 flex-1",
			vertical:
				"absolute start-[calc(var(--control-xs)/2_-_0.5px)] top-[calc(var(--control-xs)_+_--spacing(1))] bottom-1 w-px",
		},
		filled: {
			true: "bg-primary",
			false: "bg-border-strong",
		},
	},
	defaultVariants: {
		orientation: "horizontal",
		filled: false,
	},
})
