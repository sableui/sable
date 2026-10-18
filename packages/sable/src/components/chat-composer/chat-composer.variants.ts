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
 * The corner. Standalone, it is concentric with the send button it holds: the
 * button's radius (a pill, capped at half its height) plus the p-2 inset and
 * the 1px border — so a theme with square buttons gets a squarer composer for
 * free. Inside a Card it takes the card's published inner radius instead
 * (`--card-inner-radius`), so it nests in the card rather than repeating its
 * corner. `--chat-composer-radius` overrides both. The resolved value is kept
 * in `--chat-composer-r` so the attachment chips can nest inside it in turn.
 *
 * `busy` is a state, not a variant of appearance — the surface stays put while
 * a reply streams, because a composer that restyles itself mid-generation
 * draws the eye away from the answer arriving above it.
 */
export const chatComposerVariants = cva(
	"flex w-full flex-col gap-2 border border-field-border bg-field p-2 motion-interactive focus-within:ring-2 focus-within:ring-ring [--chat-composer-r:var(--chat-composer-radius,var(--card-inner-radius,calc(min(var(--button-radius,9999px),var(--control-sm)/2)+(--spacing(2))+1px)))] rounded-[var(--chat-composer-r)]",
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
