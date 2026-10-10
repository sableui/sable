import { cva } from "class-variance-authority"

/**
 * The composer surface — one box holding the field and its controls, rather
 * than an input with buttons parked beside it.
 *
 * It carries the focus ring instead of the textarea, because the thing the
 * reader perceives as "the input" is the whole box: a ring drawn around the
 * text area alone, with the send button sitting outside it, reads as two
 * controls that happen to be adjacent. `focus-within` is what makes the box
 * behave like the single control it looks like.
 *
 * `busy` is a state, not a variant of appearance — the surface stays put while
 * a reply streams, because a composer that restyles itself mid-generation
 * draws the eye away from the answer arriving above it.
 */
export const chatComposerVariants = cva(
	"flex w-full flex-col gap-2 rounded-lg border border-input bg-card p-2 motion-interactive focus-within:ring-2 focus-within:ring-ring",
	{
		variants: {
			invalid: {
				true: "border-destructive",
				false: "",
			},
		},
		defaultVariants: { invalid: false },
	},
)
