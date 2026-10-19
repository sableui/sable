import { dayNumber } from "./calendar"

/** One day of activity. Only `date` and `value` are required. */
export interface ActivityDay {
	/** The calendar day, "YYYY-MM-DD". Read as a day, never as an instant. */
	date: string
	/** The measure for that day. A day missing from the data counts as 0. */
	value: number
	/** 0…levels-1. Overrides the computed level — GitHub's API sends its own. */
	level?: number
	/** A key into the heatmap's `categories`, for multi-source cells. */
	category?: string
}

/** Days as a list, or as a map of date to value (GitLab's and Mantine's shape). */
export type ActivityData = ActivityDay[] | Record<string, number>

export interface NormalizedDay {
	value: number
	level?: number
	category?: string
}

/**
 * Days keyed by day number. Duplicates sum their values, keep the highest
 * explicit level, and take the last category given.
 */
export function normalizeActivity(data: ActivityData): Map<number, NormalizedDay> {
	const days = new Map<number, NormalizedDay>()
	const list: ActivityDay[] = Array.isArray(data) ? data : Object.entries(data).map(([date, value]) => ({ date, value }))
	for (const d of list) {
		const n = dayNumber(d.date)
		const prev = days.get(n)
		const value = (prev?.value ?? 0) + (Number.isFinite(d.value) ? d.value : 0)
		const level = d.level == null ? prev?.level : Math.max(d.level, prev?.level ?? 0)
		days.set(n, { value, level, category: d.category ?? prev?.category })
	}
	return days
}

/**
 * Several sources' days merged into one list with categories: a day active in
 * one source takes that source's key, a day active in more than one takes
 * `both`. Values sum. For "GitHub, Codex, or both on that day".
 *
 * @example mergeActivity({ github: githubDays, codex: codexDays })
 */
export function mergeActivity(sources: Record<string, ActivityData>, { both = "both" }: { both?: string } = {}): ActivityDay[] {
	const merged = new Map<string, { value: number; keys: Set<string> }>()
	for (const [key, data] of Object.entries(sources)) {
		const list: ActivityDay[] = Array.isArray(data) ? data : Object.entries(data).map(([date, value]) => ({ date, value }))
		for (const d of list) {
			if (!(d.value > 0)) continue
			const entry = merged.get(d.date) ?? { value: 0, keys: new Set<string>() }
			entry.value += d.value
			entry.keys.add(key)
			merged.set(d.date, entry)
		}
	}
	return [...merged.entries()]
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([date, { value, keys }]) => ({ date, value, category: keys.size > 1 ? both : [...keys][0] }))
}
