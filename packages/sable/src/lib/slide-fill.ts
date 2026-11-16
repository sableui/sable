import type { CSSProperties } from "react"

/**
 * The classes that draw a bar's fill as a full-width element slid in from the
 * start edge. Paired with `slideFillStyle`. Used by Progress and Meter.
 *
 * Base UI sizes those fills with an inline `width`, and a transition on width
 * re-runs layout every frame of the ease. Sliding a full-width fill moves the
 * same visible edge with `translate`, which the compositor animates. It looks
 * the same: the track clips the hidden part with its own rounded end, and the
 * fill keeps its rounded leading end — which a `scaleX` would have squashed.
 */
export const SLIDE_FILL = "-translate-x-(--sable-fill-offset) rtl:translate-x-(--sable-fill-offset)"

/** The inline style for a fill at `value` of `min`–`max`, or undefined with no value (indeterminate). */
export function slideFillStyle(value: number | null | undefined, min = 0, max = 100): CSSProperties | undefined {
	if (value == null || !Number.isFinite(value)) return undefined
	const pct = max === min ? 100 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
	return { width: "100%", "--sable-fill-offset": `${Number((100 - pct).toFixed(4))}%` } as CSSProperties
}
