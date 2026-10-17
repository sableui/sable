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

/**
 * A donut or radial chart's centre number. In full up to 9,999, which still fits
 * the hole; compact from 10,000 on ("10.2K", "102.1K", "1.2M"), since a sixth
 * digit and a comma would crowd the ring. A string passes through as written,
 * so a value with units ("7.2 GB", "72%") is the caller's to word.
 */
export function centerValueText(value: string | number, locale?: string): string {
	if (typeof value === "string") return value
	return new Intl.NumberFormat(locale, centerValueFormat(value)).format(value)
}

/** The Intl options behind centerValueText — what the centre's NumberTicker formats with. */
export function centerValueFormat(value: number): Intl.NumberFormatOptions {
	return Math.abs(value) < 10_000 ? FULL_CENTER : COMPACT_CENTER
}
const FULL_CENTER: Intl.NumberFormatOptions = { maximumFractionDigits: 1 }
const COMPACT_CENTER: Intl.NumberFormatOptions = { notation: "compact", maximumFractionDigits: 1 }
