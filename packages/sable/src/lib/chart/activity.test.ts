import { describe, expect, it } from "vitest"
import { fromGitHubContributionsApi, fromGitHubGraphQL } from "../../adapters/github"
import { mergeActivity, normalizeActivity } from "./activity"
import { activityGrid, dayNumber, isoDay, weekday } from "./calendar"
import { HEAT_EMPTY, activityLevels, heatColor } from "./heat"

describe("calendar days", () => {
	it("round-trips ISO dates through day numbers without touching local time", () => {
		for (const iso of ["1970-01-01", "2026-03-08", "2026-11-01", "2028-02-29", "2026-12-31"]) {
			expect(isoDay(dayNumber(iso))).toBe(iso)
		}
	})

	it("knows the weekday of a date", () => {
		expect(weekday(dayNumber("2026-10-14"))).toBe(3) // a Wednesday
		expect(weekday(dayNumber("2026-01-01"))).toBe(4) // a Thursday
		expect(weekday(dayNumber("1969-12-28"))).toBe(0) // before the epoch, a Sunday
	})

	it("rejects anything that is not a calendar date", () => {
		expect(() => dayNumber("2026-10-14T00:00:00Z")).toThrow()
		expect(() => dayNumber("10/14/2026")).toThrow()
	})
})

describe("activityGrid", () => {
	it("pads a partial first and last week and keeps seven rows", () => {
		const grid = activityGrid({ start: dayNumber("2026-01-01"), end: dayNumber("2026-12-31"), weekStart: 0 })
		expect(grid.weeks).toHaveLength(53)
		expect(grid.weeks.every((w) => w.days.length === 7)).toBe(true)
		// Jan 1 2026 is a Thursday: Sunday–Wednesday of the first week are outside.
		expect(grid.weeks[0].days.slice(0, 4)).toEqual([null, null, null, null])
		expect(isoDay(grid.weeks[0].days[4] as number)).toBe("2026-01-01")
		// Dec 31 is a Thursday: Friday and Saturday of the last week are outside.
		expect(grid.weeks.at(-1)?.days.slice(5)).toEqual([null, null])
	})

	it("puts Monday on top when the week starts Monday", () => {
		const grid = activityGrid({ start: dayNumber("2026-01-05"), end: dayNumber("2026-01-11"), weekStart: 1 })
		expect(grid.weeks).toHaveLength(1)
		expect(isoDay(grid.weeks[0].days[0] as number)).toBe("2026-01-05") // a Monday
	})

	it("has a month segment per month, spanning every week between them", () => {
		const grid = activityGrid({ start: dayNumber("2026-01-01"), end: dayNumber("2026-12-31"), weekStart: 0 })
		expect(grid.months.map((m) => isoDay(m.day).slice(5, 7))).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"])
		expect(grid.months.reduce((sum, m) => sum + m.span, 0)).toBe(grid.weeks.length)
	})

	it("drops an opening month that would span no weeks", () => {
		// Jan 30 2026 is a Friday; with Monday-first weeks Feb 1 shares that first week.
		const grid = activityGrid({ start: dayNumber("2026-01-30"), end: dayNumber("2026-03-31"), weekStart: 1 })
		expect(isoDay(grid.months[0].day)).toBe("2026-02-01")
		expect(grid.months.every((m) => m.span > 0)).toBe(true)
	})

	it("handles a leap day", () => {
		const grid = activityGrid({ start: dayNumber("2028-02-27"), end: dayNumber("2028-03-02"), weekStart: 0 })
		const days = grid.weeks.flatMap((w) => w.days).filter((n): n is number => n != null).map(isoDay)
		expect(days).toEqual(["2028-02-27", "2028-02-28", "2028-02-29", "2028-03-01", "2028-03-02"])
	})
})

describe("activityLevels", () => {
	it("keeps zero at level 0 and any positive value at level 1 or above", () => {
		const { level } = activityLevels([0, 1, 2, 3, 100])
		expect(level(0)).toBe(0)
		expect(level(-5)).toBe(0)
		expect(level(0.01)).toBeGreaterThanOrEqual(1)
	})

	it("splits by quartile so one outlier does not wash the rest out", () => {
		const values = [1, 2, 3, 4, 5, 6, 7, 8, 1000]
		const { level } = activityLevels(values)
		expect(level(1)).toBe(1)
		expect(level(4)).toBe(2)
		expect(level(6)).toBe(3)
		expect(level(8)).toBe(4)
		// Linear would put almost everything at level 1.
		expect(activityLevels(values, { scale: "linear" }).level(8)).toBe(1)
	})

	it("survives all-equal and all-zero data", () => {
		expect(activityLevels([5, 5, 5]).level(5)).toBe(4)
		expect(activityLevels([0, 0]).level(0)).toBe(0)
	})

	it("takes explicit thresholds and scale functions", () => {
		const t = activityLevels([], { scale: [1, 10, 20, 40] })
		expect([3, 12, 25, 99].map(t.level)).toEqual([1, 2, 3, 4])
		const f = activityLevels([1, 2], { levels: 3, scale: (v) => (v > 1 ? 2 : 1) })
		expect([1, 2, 0].map(f.level)).toEqual([1, 2, 0])
	})
})

describe("heatColor", () => {
	it("runs from the empty wash to the base colour", () => {
		expect(heatColor("red", 0, 5)).toBe(HEAT_EMPTY)
		expect(heatColor("red", 4, 5)).toBe("red")
		const shares = [1, 2, 3].map((l) => Number(/red (\d+)%/.exec(heatColor("red", l, 5))?.[1]))
		expect(shares).toEqual([35, 57, 78])
	})
})

describe("activity data", () => {
	it("accepts a list or a date map, summing duplicates", () => {
		const fromList = normalizeActivity([
			{ date: "2026-10-14", value: 2 },
			{ date: "2026-10-14", value: 3, level: 2 },
		])
		expect(fromList.get(dayNumber("2026-10-14"))).toEqual({ value: 5, level: 2, category: undefined })
		expect(normalizeActivity({ "2026-10-14": 7 }).get(dayNumber("2026-10-14"))?.value).toBe(7)
	})

	it("merges sources into categories", () => {
		const merged = mergeActivity({
			github: [{ date: "2026-10-13", value: 6 }, { date: "2026-10-14", value: 0 }],
			codex: { "2026-10-13": 1, "2026-10-15": 3 },
		})
		expect(merged).toEqual([
			{ date: "2026-10-13", value: 7, category: "both" },
			{ date: "2026-10-15", value: 3, category: "codex" },
		])
	})

	it("converts GitHub's GraphQL calendar and the contributions API", () => {
		const gql = fromGitHubGraphQL({
			weeks: [{ contributionDays: [{ date: "2026-10-13", contributionCount: 9, contributionLevel: "THIRD_QUARTILE" }] }],
		})
		expect(gql).toEqual([{ date: "2026-10-13", value: 9, level: 3 }])
		expect(fromGitHubContributionsApi({ contributions: [{ date: "2026-10-13", count: 2, level: 1 }] })).toEqual([
			{ date: "2026-10-13", value: 2, level: 1 },
		])
	})
})
