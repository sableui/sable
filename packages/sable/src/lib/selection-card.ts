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

/**
 * The two card layouts, keyed by whether an icon is present. With an icon the
 * card becomes a tile — glyph top-left, indicator top-right, copy below — and
 * takes the larger radius a 2D tile wants; without one it is a row. Both cards
 * read this, so a CheckboxCard and a RadioCard with icons in one form share a
 * shape and a glyph size (they had drifted: one tile at 16px with a 24px glyph,
 * one row at 12px with a 20px glyph).
 */
export const SELECTION_CARD_LAYOUT = {
	row: "items-start gap-3 rounded-md",
	tile: "flex-col gap-3 rounded-lg",
} as const

/** The tile's top line: the glyph at the start, the indicator at the end. */
export const SELECTION_CARD_TILE_HEAD = "flex w-full items-start justify-between gap-3"

/** The icon glyph in a tile. */
export const SELECTION_CARD_GLYPH = "shrink-0 text-2xl leading-none motion-interactive"

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
	"flex size-4.5 shrink-0 items-center justify-center rounded-xs border border-control-border bg-card motion-interactive"

/**
 * The radio ring — CHECK_BOX's round sibling, shared by Radio and RadioCard's
 * marker for the same reason. They had drifted to two sizes: Radio a fixed
 * 18px that ignored density with a fractional 8.33px dot, RadioCard on the
 * spacing scale. Same footprint as CHECK_BOX, so a checkbox and a radio in one
 * form are the same size. The dot is RADIO_DOT, on the same scale.
 *
 * Its resting edge is `control-border` (3:1), like CHECK_BOX: an unselected
 * radio has no fill, so the ring is the whole control.
 */
export const RADIO_RING =
	"relative inline-flex size-4.5 shrink-0 rounded-full border border-control-border bg-card motion-interactive"

/** The selected dot inside RADIO_RING: 8px of an 18px ring, absolutely centred. */
export const RADIO_DOT =
	"absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full motion-interactive ease-spring data-[starting-style]:scale-0 data-[ending-style]:scale-0"

/** The check / dash glyph size inside CHECK_BOX: 11px of an 18px box, on the same scale. */
export const CHECK_MARK_SIZE = "text-[length:--spacing(2.75)]"
