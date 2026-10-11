import type { ChartValueFormatter } from "./types"

/**
 * The two readings of a number a chart needs: compact on an axis, where space
 * is tight ("12K"), and full in the tooltip and data table ("12,480"). A
 * caller's `valueFormatter` replaces both, so units ("$12,480") stay consistent.
 */
export function chartFormatters(locale: string | undefined, valueFormatter?: ChartValueFormatter) {
	if (valueFormatter) return { axis: valueFormatter, full: valueFormatter }
	const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 })
	const full = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })
	return { axis: (v: number) => compact.format(v), full: (v: number) => full.format(v) }
}

/** A category value as text — dates read as a short day, everything else as-is. */
export function categoryText(v: unknown, locale?: string): string {
	if (v instanceof Date) return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(v)
	return v == null ? "" : String(v)
}

/** Rough width of a caption-sized label, for thinning ticks without measuring the DOM. */
export function approxTextWidth(text: string): number {
	return text.length * 6.6 + 4
}
