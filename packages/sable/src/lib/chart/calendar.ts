/**
 * Calendar arithmetic for ActivityHeatmap, on whole days.
 *
 * A day is an ISO date string ("2026-10-14") or its day number: whole days
 * since 1970-01-01, computed in UTC. Nothing here parses a date into an instant
 * and reads it back in local time — `new Date("2026-10-14").getDate()` prints
 * the 13th west of Greenwich, the off-by-one every calendar heatmap library has
 * shipped at some point. Formatting goes through Intl with `timeZone: "UTC"`
 * for the same reason.
 */

const DAY_MS = 86_400_000
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** "2026-10-14" → its day number. Throws on anything that is not a calendar date. */
export function dayNumber(iso: string): number {
	const m = ISO.exec(iso)
	if (!m) throw new Error(`Expected a YYYY-MM-DD date, got "${iso}"`)
	return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / DAY_MS
}

/** A day number → "2026-10-14". */
export function isoDay(n: number): string {
	return new Date(n * DAY_MS).toISOString().slice(0, 10)
}

/** 0 = Sunday … 6 = Saturday. 1970-01-01 was a Thursday. */
export function weekday(n: number): number {
	return (((n + 4) % 7) + 7) % 7
}

/** The day of the month, 1–31. */
export function dayOfMonth(n: number): number {
	return new Date(n * DAY_MS).getUTCDate()
}

/** The day as a UTC Date, for Intl formatting with `timeZone: "UTC"`. */
export function utcDate(n: number): Date {
	return new Date(n * DAY_MS)
}

/**
 * Today in the reader's own calendar. The one place local time is right: "today"
 * is the viewer's day, not Greenwich's.
 */
export function today(): number {
	const d = new Date()
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS
}

/**
 * The locale's first day of the week, 0 (Sunday) or 1 (Monday), from
 * `Intl.Locale` week info where the runtime has it (`getWeekInfo()` in current
 * engines, the older `weekInfo` getter elsewhere). Saturday-first locales fall
 * back to Sunday: the grid only offers the two layouts people recognise.
 */
export function localeWeekStart(locale?: string): 0 | 1 {
	try {
		const tag = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
			getWeekInfo?: () => { firstDay: number }
			weekInfo?: { firstDay: number }
		}
		const first = tag.getWeekInfo?.().firstDay ?? tag.weekInfo?.firstDay
		return first === 1 ? 1 : 0
	} catch {
		return 0
	}
}

export interface ActivityWeek {
	/** Day numbers for each row, top to bottom; null where the day falls outside the range. */
	days: (number | null)[]
}

export interface ActivityMonth {
	/** The first day of the month (or of the range, for a partial first month). */
	day: number
	/** The week column the month's header starts at. */
	week: number
	/** How many week columns it spans. */
	span: number
}

export interface ActivityGrid {
	start: number
	end: number
	weekStart: 0 | 1
	/** The day number in the top-left slot, which may sit before `start`. */
	origin: number
	weeks: ActivityWeek[]
	/** Month header segments, left to right, spanning every week column between them. */
	months: ActivityMonth[]
}

/**
 * The weeks-by-weekdays grid for a range: one column per week, one row per
 * weekday starting at `weekStart`, with partial first and last weeks padded by
 * nulls. Month segments start at the week holding each month's 1st; the weeks
 * before the first 1st belong to the range's opening month.
 */
export function activityGrid({ start, end, weekStart }: { start: number; end: number; weekStart: 0 | 1 }): ActivityGrid {
	const origin = start - ((weekday(start) - weekStart + 7) % 7)
	const weeks: ActivityWeek[] = []
	for (let col = origin; col <= end; col += 7) {
		const days: (number | null)[] = []
		for (let r = 0; r < 7; r++) {
			const n = col + r
			days.push(n >= start && n <= end ? n : null)
		}
		weeks.push({ days })
	}

	const starts: { day: number; week: number }[] = [{ day: start, week: 0 }]
	weeks.forEach((w, i) => {
		const first = w.days.find((n) => n != null && dayOfMonth(n) === 1)
		if (first != null && first !== start) starts.push({ day: first, week: i })
	})
	const months = starts.map((s, i) => ({ ...s, span: (starts[i + 1]?.week ?? weeks.length) - s.week }))
	// A month's 1st landing in the range's first week leaves its opening month a
	// zero-width segment: fold it away.
	return { start, end, weekStart, origin, weeks, months: months.filter((m) => m.span > 0) }
}

/** The week column and row of a day in a grid. */
export function gridPosition(grid: ActivityGrid, n: number): { week: number; row: number } {
	const offset = n - grid.origin
	return { week: Math.floor(offset / 7), row: offset % 7 }
}
