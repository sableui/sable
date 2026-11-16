import type { BlockMeta } from "../lib/meta"

export const streakBlockMeta: BlockMeta = {
	name: "StreakBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A habit's streak: the run of days still going, the longest one, and sixteen weeks on an ActivityHeatmap that Pills switch between two measures.",
	intent:
		"Reach for this to show whether something was kept up day by day — reading, workouts, commits, lessons. A year of activity on a wide page is ActivityHeatmap on its own; one month with its days marked is Calendar.",
	notes: [
		"The streak numbers are worked out from the same days the grid draws, so the two can never disagree.",
		"Sixteen weeks fit a 20rem card without scrolling. A longer range scrolls sideways and opens on the latest week.",
		"The Pills change what the grid measures, not which days it shows: each cell cross-fades to its new level.",
		"How a day counts is a hint, so it sits in a tooltip on an info button rather than taking a line of the card.",
		"Dates are built in UTC and passed as YYYY-MM-DD strings, so a time zone cannot shift a day.",
	],
	a11y: [
		"The grid is one tab stop with arrow-key movement; each day is named with its date and value.",
		"The info button has its own accessible name; the tooltip is only its description.",
		"The Pills are toggle buttons with aria-pressed.",
	],
}
