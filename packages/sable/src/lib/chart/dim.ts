import { HOVER } from "./motion"

/**
 * The hover dim — the marks that are NOT under the pointer step back so the
 * one that is reads forward.
 *
 * Mixed toward the surface rather than faded with opacity. A faded bar lets
 * whatever is behind it show through: gridlines strike through the column, a
 * radial ring turns the muddy colour of its track, and the 2px surface gap
 * between stacked segments stops reading as a gap. A colour mixed with the
 * surface is solid, so the mark keeps its shape and only loses emphasis.
 *
 * The surface is the one the chart sits on (`--sable-surface-bg`, published by
 * Card, popovers and the sidebar), so the dim is right on a card, a muted panel
 * or the page alike.
 */
const SURFACE = "var(--sable-surface-bg, var(--background))"

/** `color` stepped back toward the surface, keeping `keep`% of it. */
export function dimmed(color: string, keep: number): string {
	return `color-mix(in oklab, ${color} ${keep}%, ${SURFACE})`
}

/**
 * The dim's timing: HOVER from ./motion. ESSENTIAL hover feedback, so not
 * multiplied by --motion-expressive — a lagging dim reads as a slow chart.
 */
export const FILL_HOVER = `fill ${HOVER}`
export const STROKE_HOVER = `stroke ${HOVER}`
