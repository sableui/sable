import type { ComponentMeta } from "../../lib/meta"

export const dateTileMeta: ComponentMeta = {
	name: "DateTile",
	summary:
		"A calendar-page date: the short month on a primary band over the day number, in a <time> element. The leading visual of an event, booking or deadline row.",
	keywords: ["date", "calendar", "event", "day", "month", "schedule", "booking", "tile"],
	usage: {
		description:
			"Use DateTile as the leading visual when the date is what a reader scans a list or card by — events, bookings, deadlines, releases. It sits beside a title and a time line, usually in an Entity's `leading` slot or a flex row in a CardContent. For a date inside a sentence or a row's metadata, use text or RelativeTime instead.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Pair the tile with a title and the full time or range in text beside it; the tile only names the day.",
			},
			{
				guidance: "do",
				description: "Keep every row of a list on DateTile so the dates line up as one column.",
			},
			{
				guidance: "dont",
				description:
					"Use it for timestamps (\"2 hours ago\", \"Oct 14, 10:02\") — that is RelativeTime or plain metadata text.",
			},
			{
				guidance: "dont",
				description:
					"Stretch it to its neighbour's height or restyle the band per row; the tile is a fixed shape so a column of them reads as one calendar.",
			},
		],
		anatomy: [
			{ name: "Band", required: true, description: "The short month name on the primary colour." },
			{ name: "Day", required: true, description: "The day of the month, on the muted surface." },
		],
	},
	related: {
		components: ["Entity", "Card", "RelativeTime", "Calendar"],
	},
	status: "stable",
	props: [
		{
			name: "date",
			type: "Date",
			description: "The day to show, read in local time. Rendered as `<time dateTime=\"YYYY-MM-DD\">`.",
		},
		{
			name: "locale",
			type: "string",
			default: "runtime locale",
			description: "BCP 47 locale for the month name.",
		},
	],
	tokensUsed: ["muted", "primary", "primary-foreground", "foreground"],
	motion: [
		{ slot: "arrival", part: "Tile", recipe: "none", why: "A static label; it appears with whatever row or card holds it." },
		{ slot: "response", part: "Tile", recipe: "none", why: "Not interactive." },
		{ slot: "transition", part: "Tile", recipe: "none", why: "It has no states to move between." },
		{ slot: "activity", part: "Tile", recipe: "none", why: "Nothing runs in the background." },
	],
	a11y: [
		"Renders a <time> with a machine-readable `dateTime`, so the day is announced as text (\"Oct 14\") and parsable as a date.",
		"The tile names only the day — state the weekday, time or range in the text beside it, where it is read in order.",
	],
	examples: [
		{
			label: "Event row",
			code: '<Row gap={4} align="start">\n\t<DateTile date={new Date(2026, 9, 14)} />\n\t<Stack gap={1}>\n\t\t<span className="text-title-lg">Design review</span>\n\t\t<span className="text-body-sm text-muted-foreground">Tuesday, 2:00 – 2:45 PM</span>\n\t</Stack>\n</Row>',
		},
		{
			label: "In an Entity list",
			code: '<CardList>\n\t<Entity leading={<DateTile date={new Date(2026, 9, 14)} />} title="Design review" subtitle="Tuesday, 2:00 PM" />\n\t<Entity leading={<DateTile date={new Date(2026, 9, 21)} />} title="Launch" subtitle="Tuesday, all day" />\n</CardList>',
		},
	],
}
