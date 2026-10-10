import { cva } from "class-variance-authority"

/**
 * Entity row layout. `density` trades vertical rhythm: `compact` (the default,
 * byte-identical to the historical px-3 py-2.5) for dense lists, `comfortable`
 * for roomier rows. The hover highlight, motion, and radius live on the
 * `interactive` branch in entity.tsx — a presentational row must not advertise
 * clickability, and a radius on a static row bends `divide-y` hairlines.
 *
 * The insets read `--entity-px` / `--entity-py` first. CardList sets them from
 * the card's own padding, so rows in a card line up with its header instead of
 * sitting at their list inset; everywhere else the density values apply.
 * An interactive row's hover/focus corner reads `--entity-radius` the same way,
 * so a container whose rows are full-bleed (CardList) can square it.
 */
export const entityVariants = cva("flex items-center gap-3", {
		variants: {
			density: {
				compact: "px-[var(--entity-px,--spacing(3))] py-[var(--entity-py,--spacing(2.5))]",
				comfortable: "px-[var(--entity-px,--spacing(4))] py-[var(--entity-py,--spacing(3))]",
			},
		},
	defaultVariants: {
		density: "compact",
	},
})
