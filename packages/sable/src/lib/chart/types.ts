import type { ReactNode } from "react"

/**
 * A series colour by role. The decorative tones lead — a chart names
 * categories (desktop / mobile, editions / collectibles), not good and bad —
 * and they follow the active theme and Customize → Color → Palette. The
 * status tones are for a series that IS a judgement (errors, warnings).
 */
export type ChartTone =
	| "edition"
	| "collectible"
	| "standard"
	| "info"
	| "warning"
	| "primary"
	| "neutral"
	| "success"
	| "destructive"

/** How many series colours the palette holds (--chart-1 … --chart-8). */
export const CHART_SERIES_COUNT = 8

/**
 * The colour of series `index` when it names none: the theme's chart palette,
 * in order. The palette (`--chart-1` … `--chart-8`, defined by the Base theme
 * and inherited by every other) is validated for colour-blind separation of
 * neighbours, a normal-vision floor, a lightness band and a chroma floor, in
 * light and dark. Past eight series, fold the rest into "Other".
 *
 * Also the bridge for a charting library: pass `chartColor(0)` and on to
 * Recharts or visx and their marks follow the theme too.
 */
export function chartColor(index: number): string {
	return `var(--chart-${(index % CHART_SERIES_COUNT) + 1})`
}

const TONE_VAR: Record<ChartTone, string> = {
	edition: "var(--tone-edition)",
	collectible: "var(--tone-collectible)",
	standard: "var(--tone-standard)",
	info: "var(--tone-info)",
	warning: "var(--tone-warning)",
	primary: "var(--primary)",
	neutral: "var(--muted-foreground)",
	success: "var(--success)",
	destructive: "var(--destructive)",
}

/**
 * The CSS colour for a tone as a chart fill — for a series that names its role
 * (`tone: "success"`), not for default series (see chartColor). Tones are
 * tuned to be legible as TEXT (dark, restrained); a plotted mark keeps the hue
 * but is lifted into the chart lightness band with a chroma floor, so a quiet
 * tone (a slate "standard") still reads as colour rather than grey.
 */
export function toneColor(tone: ChartTone): string {
	// design-lint-disable-next-line inline-color -- relative colour derived from the theme's own token, so it follows every look
	return `oklch(from ${TONE_VAR[tone]} clamp(0.5, calc(l + 0.1), 0.72) max(calc(c * 1.1), 0.1) h)`
}

/** One plotted measure: which field of each datum, what to call it, how to colour it. */
export interface ChartSeries {
	/** The datum field holding this series' numbers. */
	key: string
	/** Its name in the legend, tooltip and data table. */
	label: string
	/** Colour by role (a status series: `success`, `destructive`). Omitted, series take the chart palette in order. */
	tone?: ChartTone
	/** A CSS colour that overrides `tone` — a token reference keeps it themeable. */
	color?: string
	/** A Sable icon name shown in the legend and tooltip instead of the swatch. */
	icon?: string
}

/** One row of chart data: the category under `index`, numbers under each series key. */
export type ChartDatum = Record<string, unknown>

/** A series with its colour resolved. */
export interface ResolvedSeries extends ChartSeries {
	colorValue: string
}

export function resolveSeries(series: ChartSeries[]): ResolvedSeries[] {
	return series.map((s, i) => ({
		...s,
		colorValue: s.color ?? (s.tone ? toneColor(s.tone) : chartColor(i)),
	}))
}

/**
 * Per-category styling for charts whose marks ARE categories (pie slices,
 * radial rings): keyed by the category's value in the data.
 */
export type ChartCategories = Record<string, { label?: string; tone?: ChartTone; color?: string; icon?: string }>

/** Colour and label for the category at `i` — its config, or the next tone in sequence. */
export function categoryStyle(categories: ChartCategories | undefined, name: string, i: number) {
	const c = categories?.[name]
	return {
		label: c?.label ?? name,
		color: c?.color ?? (c?.tone ? toneColor(c.tone) : chartColor(i)),
		icon: c?.icon,
	}
}

/** A big number with a caption in the middle of a donut or radial chart. */
export interface ChartCenterLabel {
	value: string
	label?: string
}

/** How the tooltip marks each row. */
export type ChartTooltipIndicator = "dot" | "line" | "dashed" | "none"

export interface ChartTooltipOptions {
	/** Each row's marker. @default "dot" */
	indicator?: ChartTooltipIndicator
	/** Drop the category heading — for a single series, where the value says enough. */
	hideLabel?: boolean
	/** Rewrite the heading, e.g. a date key into "Tuesday, Oct 14". */
	labelFormatter?: (label: string, datum: ChartDatum) => ReactNode
	/** Add a Total row summing every series at that category. */
	showTotal?: boolean
}

/** A number as it should read on the axis (compact) and in the tooltip (full). */
export type ChartValueFormatter = (value: number) => string

export function numberValue(v: unknown): number {
	const n = typeof v === "number" ? v : Number(v)
	return Number.isFinite(n) ? n : 0
}
