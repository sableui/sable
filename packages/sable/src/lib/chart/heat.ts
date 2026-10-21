/**
 * Levels and colour for a heatmap: how a value becomes one of a few steps, and
 * what each step looks like on the active theme.
 */

/** What a scale function is told about the data it is scaling. */
export interface ActivityStats {
	/** The smallest positive value. */
	min: number
	/** The largest value. */
	max: number
	/** How many levels there are, including the empty level 0. */
	levels: number
}

/**
 * How a value becomes a level. `"quantile"` splits the positive values evenly
 * between the levels above 0, as GitHub does, so one outlier does not wash the
 * rest out. `"linear"` divides 0…max evenly. An array gives the lower bound of
 * each level from 1 up; a function decides for itself.
 */
export type ActivityScale = "quantile" | "linear" | number[] | ((value: number, stats: ActivityStats) => number)

export interface ActivityLevels {
	/** The lower bound of each level from 1 up (`thresholds[0]` is level 1). Empty for a scale function. */
	thresholds: number[]
	/** The level of a value: 0 for nothing, up to `levels - 1`. */
	level: (value: number) => number
}

/** The p-quantile (0–1) of sorted values, interpolated. */
function quantile(sorted: number[], p: number): number {
	if (!sorted.length) return 0
	const i = (sorted.length - 1) * p
	const lo = Math.floor(i)
	const hi = Math.ceil(i)
	return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo)
}

/**
 * The levels for a set of values. Zero and negative values are always level 0;
 * any positive value is at least level 1, so a day with activity never reads as
 * a day without it.
 */
export function activityLevels(values: number[], { levels = 5, scale = "quantile" }: { levels?: number; scale?: ActivityScale } = {}): ActivityLevels {
	const steps = Math.max(2, Math.round(levels))
	const top = steps - 1
	const positive = values.filter((v) => v > 0).sort((a, b) => a - b)
	const stats: ActivityStats = { min: positive[0] ?? 0, max: positive.at(-1) ?? 0, levels: steps }
	const clamp = (l: number) => Math.min(top, Math.max(0, Math.round(l)))

	if (typeof scale === "function") {
		return { thresholds: [], level: (v) => (v > 0 ? Math.max(1, clamp(scale(v, stats))) : 0) }
	}

	let thresholds: number[]
	if (Array.isArray(scale)) {
		thresholds = scale.slice(0, top)
	} else if (scale === "linear") {
		thresholds = Array.from({ length: top }, (_, k) => (k === 0 ? Number.MIN_VALUE : (stats.max * k) / top))
	} else {
		thresholds = Array.from({ length: top }, (_, k) => quantile(positive, k / top))
	}

	return {
		thresholds,
		level: (v) => {
			if (!(v > 0)) return 0
			let l = 1
			for (let k = 1; k < thresholds.length; k++) if (v >= thresholds[k]) l = k + 1
			return l
		},
	}
}

/** The empty cell: a faint wash of the ink, so it reads on any surface (page, card, popover). */
export const HEAT_EMPTY = "color-mix(in oklab, var(--foreground) 8%, transparent)"

/**
 * The fill for a level, from a base colour (a tone's mark, a category colour).
 * Level 0 is the empty wash; each level above mixes more of the base over it,
 * starting at a visible 35% so level 1 never disappears into level 0, and
 * ending at the base itself.
 */
export function heatColor(base: string, level: number, levels: number): string {
	if (level <= 0) return HEAT_EMPTY
	const top = Math.max(1, levels - 1)
	if (level >= top) return base
	const share = Math.round(35 + (65 * (level - 1)) / (top - 1))
	return `color-mix(in oklch, ${base} ${share}%, ${HEAT_EMPTY})`
}

/** Words for each level, read through a cell's description and the legend. */
export function levelNames(levels: number): string[] {
	if (levels === 5) return ["None", "Low", "Medium-low", "Medium-high", "High"]
	if (levels === 2) return ["None", "Some"]
	if (levels === 3) return ["None", "Low", "High"]
	return Array.from({ length: levels }, (_, k) => (k === 0 ? "None" : `Level ${k} of ${levels - 1}`))
}
