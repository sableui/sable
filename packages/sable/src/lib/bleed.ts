/*
 * Optical alignment for the actions a container lays out — internal, shared by
 * the containers whose actions sit on a content edge (HeadingRow → PageHeader
 * and SectionHeader; CardAction).
 *
 * A borderless Button (ghost, link, on-color-ghost) with no `bleed` prop renders
 * `data-bleed="auto"`: "pull me onto the edge if my container asks". These
 * classes are the asking. They pull the outermost such child outward by exactly
 * its padding on that side — the same `--button-ps` / `--button-pe` /
 * `--button-px` margin Button's own `bleed` prop writes — so its label lands on
 * the content edge while its hover fill runs past it. A filled button never
 * renders `data-bleed`, so its edge stays on the line; an explicit `bleed` on
 * the Button (including `none`) wins over the container, because it is no
 * longer `auto`.
 *
 * Direct children only. Wrap the actions in your own element and the container
 * can no longer see them — set `bleed` on the Button there instead.
 *
 * Kept as literal class strings in a scanned file so Tailwind generates them;
 * Button reads nothing from here, so it depends on no container.
 */

/** The last direct child, when it is a borderless Button: bleed at the end. */
export const BLEED_LAST_END = "*:last:data-[bleed=auto]:-me-(--button-pe,var(--button-px))"

/** The first direct child, when it is a borderless Button: bleed at the start. */
export const BLEED_FIRST_START = "*:first:data-[bleed=auto]:-ms-(--button-ps,var(--button-px))"
