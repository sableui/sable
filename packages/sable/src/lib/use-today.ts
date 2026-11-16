"use client"

import { useMemo, useSyncExternalStore } from "react"

const DEFAULT_FALLBACK = "2026-01-05"
const pad = (n: number) => String(n).padStart(2, "0")
const localDay = () => {
	const now = new Date()
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Wake at the next local midnight, so a page left open overnight moves on with the day. */
function subscribe(onChange: () => void) {
	let timer: ReturnType<typeof setTimeout>
	const arm = () => {
		const now = new Date()
		const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
		// A second past midnight: a timer that fires a few ms early would read the old day.
		timer = setTimeout(() => {
			onChange()
			arm()
		}, next.getTime() - now.getTime() + 1000)
	}
	arm()
	return () => clearTimeout(timer)
}

/**
 * Today on the reader's clock, at local midnight, safe to render from.
 *
 * `new Date()` read during render gives the server one day and the reader
 * another whenever their time zones straddle midnight, and React reports the
 * text that differs as a hydration mismatch. This returns `fallback` on the
 * server and while hydrating, so both renders agree, then the reader's own
 * date straight after, and the next day's once midnight passes. A
 * server-rendered page therefore shows the fallback day until it hydrates:
 * pass the request's date as `fallback` to make that first paint right.
 * For content dated "from today": a demo agenda, the last 30 days of a chart.
 * For "3 minutes ago", use RelativeTime.
 *
 *   const today = useToday()
 *   const label = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(today)
 *
 * @param fallback The day the server renders, as YYYY-MM-DD. Anything else is ignored.
 */
export function useToday(fallback: string = DEFAULT_FALLBACK): Date {
	const server = /^\d{4}-\d{2}-\d{2}$/.test(fallback) ? fallback : DEFAULT_FALLBACK
	const day = useSyncExternalStore(subscribe, localDay, () => server)
	return useMemo(() => new Date(`${day}T00:00:00`), [day])
}
