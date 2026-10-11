/** Sample data shared by the chart pages and the chart blocks' docs. */

export const VISITORS = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
]

export const DEVICES = [
	{ key: "desktop", label: "Desktop" },
	{ key: "mobile", label: "Mobile" },
]

export const DEVICES_WITH_ICONS = [
	{ key: "desktop", label: "Desktop", icon: "desktop" },
	{ key: "mobile", label: "Mobile", icon: "user" },
]

export const BROWSERS = [
	{ browser: "Chrome", visitors: 275 },
	{ browser: "Safari", visitors: 200 },
	{ browser: "Firefox", visitors: 187 },
	{ browser: "Edge", visitors: 173 },
	{ browser: "Other", visitors: 90 },
]

export const NET = [
	{ month: "January", net: 186 },
	{ month: "February", net: -95 },
	{ month: "March", net: 137 },
	{ month: "April", net: -60 },
	{ month: "May", net: 209 },
	{ month: "June", net: 114 },
]

export const SCORES = [
	{ skill: "Speed", atlas: 86, beacon: 65 },
	{ skill: "Quality", atlas: 72, beacon: 90 },
	{ skill: "Support", atlas: 64, beacon: 80 },
	{ skill: "Price", atlas: 90, beacon: 55 },
	{ skill: "Docs", atlas: 70, beacon: 85 },
	{ skill: "Ecosystem", atlas: 60, beacon: 75 },
]

export const GOALS = [
	{ goal: "Move", progress: 82 },
	{ goal: "Exercise", progress: 64 },
	{ goal: "Stand", progress: 91 },
]

/** 90 days of visitors, deterministic so the page renders the same everywhere. */
export const DAILY = Array.from({ length: 90 }, (_, i) => {
	const date = new Date(2026, 6, 1 + i)
	const wave = Math.sin(i / 6) * 60 + Math.sin(i / 2.3) * 25
	return {
		date: date.toISOString().slice(0, 10),
		desktop: Math.round(240 + wave + (i % 7) * 9),
		mobile: Math.round(160 + wave * 0.7 + ((i * 3) % 11) * 6),
	}
})

export const shortMonth = (m: string) => m.slice(0, 3)

export const shortDate = (iso: string) =>
	new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })
