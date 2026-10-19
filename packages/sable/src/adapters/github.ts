import type { ActivityDay } from "../lib/chart/activity"

/**
 * GitHub contribution data → ActivityHeatmap days. Pure transforms: Sable never
 * fetches. GitHub's GraphQL API needs a token, so call it from your server and
 * pass the result through; the docs page shows a route handler that does.
 */

/** The `contributionLevel` enum GitHub's GraphQL API returns per day. */
export type GitHubContributionLevel = "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE"

/** The slice of `user.contributionsCollection.contributionCalendar` the transform reads. */
export interface GitHubContributionCalendar {
	weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel?: GitHubContributionLevel }[] }[]
}

const LEVEL: Record<GitHubContributionLevel, number> = {
	NONE: 0,
	FIRST_QUARTILE: 1,
	SECOND_QUARTILE: 2,
	THIRD_QUARTILE: 3,
	FOURTH_QUARTILE: 4,
}

/**
 * From GraphQL `contributionsCollection { contributionCalendar { weeks { contributionDays
 * { date contributionCount contributionLevel } } } }`. GitHub's own quartile levels pass
 * through as 0–4, so the grid matches the profile page exactly (use the default 5 levels).
 */
export function fromGitHubGraphQL(calendar: GitHubContributionCalendar): ActivityDay[] {
	return calendar.weeks.flatMap((w) =>
		w.contributionDays.map((d) => ({
			date: d.date,
			value: d.contributionCount,
			...(d.contributionLevel ? { level: LEVEL[d.contributionLevel] } : {}),
		})),
	)
}

/** The response of the community github-contributions-api (`/v4/{user}`). */
export interface GitHubContributionsApiResponse {
	contributions: { date: string; count: number; level?: number }[]
}

/**
 * From the community github-contributions-api (`https://github-contributions-api.jogruber.de/v4/{user}`).
 * It is a third-party scraper of the profile page — cached for an hour and rate
 * limited — so treat it as a convenience for demos, not a dependency.
 */
export function fromGitHubContributionsApi(json: GitHubContributionsApiResponse): ActivityDay[] {
	return json.contributions.map((d) => ({ date: d.date, value: d.count, ...(d.level != null ? { level: d.level } : {}) }))
}
