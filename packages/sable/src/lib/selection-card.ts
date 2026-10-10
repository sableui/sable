/**
 * The shared shell of the selection cards — CheckboxCard and RadioCard. They
 * are two components only because Base UI's Checkbox and Radio are two roots
 * (exactly as Checkbox and Radio are); the card, its states and its tone ring
 * are one design, so they live here once. The two used to carry identical
 * copies of every string below, already drifting apart (an icon laid out in 2D
 * in one and inline in the other).
 */
export const SELECTION_CARD_SHELL = [
	"group relative flex cursor-pointer border border-input bg-card p-4 text-start motion-interactive motion-press",
	"hover:border-ring",
	// Focus is an OUTLINE, not a ring: the checked state is an inset ring in the
	// tone colour, and both rings write box-shadow, so a focused checked card
	// used to lose its tone ring to the focus ring.
	"focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-2 focus-within:outline-ring",
	"data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:border-input",
].join(" ")

export const SELECTION_CARD_TONES = ["neutral", "standard", "collectible", "edition", "info", "warning"] as const
export type SelectionCardTone = (typeof SELECTION_CARD_TONES)[number]

/** The checked ring per tone (neutral also takes a muted wash). */
export const SELECTION_CARD_CHECKED: Record<SelectionCardTone, string> = {
	neutral: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-primary data-[checked]:bg-muted",
	standard: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-tone-standard",
	collectible: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-tone-collectible",
	edition: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-tone-edition",
	info: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-tone-info",
	warning: "data-[checked]:border-transparent data-[checked]:ring-[1.5px] data-[checked]:ring-inset data-[checked]:ring-tone-warning",
}

/**
 * The checkbox box — the 18px square that Checkbox IS and that CheckboxCard
 * draws beside its title. One string, so the two cannot drift (they had: the
 * card's copy never learned the indeterminate dash). Sized on the spacing scale
 * (`size-4.5` = 18px at rest) so density moves it with the rows it sits in;
 * the mark inside is sized to the box, not to a fixed 11px.
 *
 * State colour is the caller's: Checkbox keys it off its own `data-[checked]`,
 * CheckboxCard off the card's (`group-data-[checked]`), each with its tone.
 */
export const CHECK_BOX =
	"flex size-4.5 shrink-0 items-center justify-center rounded-xs border border-input bg-card motion-interactive"

/** The check / dash glyph size inside CHECK_BOX: 11px of an 18px box, on the same scale. */
export const CHECK_MARK_SIZE = "text-[length:--spacing(2.75)]"
