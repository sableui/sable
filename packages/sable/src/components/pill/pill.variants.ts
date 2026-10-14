import { cva } from "class-variance-authority"
import { PALETTE_COLORS } from "../../lib/palette"

/**
 * A chip someone clicks. Two appearances, two sizes, one `selected` state each:
 *
 * - `solid` (default): the filter-row chip. Rests on the secondary surface;
 *   `selected` lifts it onto the primary surface so the active filter reads at
 *   a glance.
 * - `outline`: the quiet chip, for choices that annotate other content — a
 *   reaction under a message, a tag on a card — where a filled chip would
 *   compete with what it annotates. Rests as a hairline on its surface;
 *   `selected` (the reader's own choice) takes a primary tint and a soft
 *   primary edge — distinct from rest without a heavy dark outline.
 *
 * Both sizes are fixed heights, md the larger: md sits on the density ladder's
 * xs control height (28px), sm is 24px — the touch-target floor. md used to be
 * padding-sized (~18px) while sm was 28px, so the "small" chip was the taller
 * one. A fixed-height chip centred with `items-center` needs no optical nudge,
 * so both drop it. Semantic tokens only — theme-safe in light and dark.
 */
export const pillVariants = cva(
	/*
	 * The asymmetric `pt-[0.23em] pb-[0.1em]` is the LEGACY optical correction: a
	 * hand-tuned em nudge compensating for the fact that centring a line box does
	 * not centre the glyphs. It stays as the fallback, and `sable-label-trim`
	 * (applied to the label in pill.tsx) supersedes it wherever `text-box-trim`
	 * exists — `styles.css` neutralises this padding back to symmetric inside the
	 * same `@supports` block that turns the trim on.
	 *
	 * Why not simply delete it: a hardcoded nudge is wrong per font, but deleting
	 * it outright would regress every browser without `text-box` to an uncorrected
	 * label. Progressive enhancement keeps the tuned value where it is still the
	 * only thing available and drops it where the metric-derived fix applies.
	 *
	 * `whitespace-nowrap`: a chip's label is one line; in a scrolling or
	 * wrapping strip it must not break inside itself.
	 */
	"sable-optical-pad inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2 pt-[0.23em] pb-[0.1em] text-label-md cursor-pointer motion-interactive motion-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:shrink-0",
	{
		variants: {
			appearance: {
				solid: "",
				outline: "border",
			},
			size: {
				md: "h-(--control-xs) px-3 py-0 [--sable-optical-pad:0px]",
				sm: "h-6 py-0 text-label-sm [--sable-optical-pad:0px]",
			},
			selected: {
				true: "",
				false: "",
			},
			// `neutral` is the chip as described above. A palette family is a
			// category colour (a tag someone picks): the chip paints from the slots
			// its data-palette scope fills, so no step is named here.
			tone: {
				neutral: "",
				red: "",
				orange: "",
				yellow: "",
				green: "",
				teal: "",
				blue: "",
				purple: "",
				pink: "",
			},
		},
		compoundVariants: [
			{ appearance: "solid", selected: true, class: "bg-primary text-primary-foreground hover:bg-primary" },
			{
				appearance: "solid",
				selected: false,
				class: "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
			},
			{
				appearance: "outline",
				selected: true,
				class: "border-primary/40 bg-primary/10 text-foreground hover:bg-primary/15",
			},
			{
				appearance: "outline",
				selected: false,
				// Transparent on whatever it sits on; the hover is derived from that
				// surface (sable-surface-interactive), not a fixed accent fill.
				class: "border-border text-muted-foreground sable-surface-interactive",
			},
			// After the neutral looks, so cn's merge lets these win.
			{ appearance: "solid", selected: false, tone: [...PALETTE_COLORS], class: "bg-palette-wash text-palette-text hover:bg-palette-wash-strong hover:text-palette-text" },
			{ appearance: "solid", selected: true, tone: [...PALETTE_COLORS], class: "bg-palette-solid text-palette-solid-ink hover:bg-palette-solid" },
			{ appearance: "outline", selected: false, tone: [...PALETTE_COLORS], class: "border-palette-edge text-palette-text" },
			{ appearance: "outline", selected: true, tone: [...PALETTE_COLORS], class: "border-palette-edge bg-palette-wash text-palette-text hover:bg-palette-wash-strong" },
		],
		defaultVariants: {
			appearance: "solid",
			size: "md",
			selected: false,
			tone: "neutral",
		},
	},
)
