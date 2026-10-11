import type { BlockMeta } from "../lib/meta"

export const eventCardBlockMeta: BlockMeta = {
	name: "EventCardBlock",
	family: "Dashboard",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "An upcoming-event card: a DateTile beside the title and time, a \"starts in\" Badge, attendees as an AvatarGroup, and Decline / Join.",
	intent:
		"Reach for this for the next meeting, booking or live session on a dashboard or home screen. For a list of many upcoming events, use Entity rows with a DateTile as `leading`.",
	notes: [
		"The DateTile names the day; the full weekday and time range sit in text beside it.",
		"The Badge is one title line tall and wraps under the title rather than squeezing it onto two lines.",
		"AvatarGroup `fit` trades avatars for the +N count before it pushes the actions to their own line.",
	],
	a11y: [
		"DateTile is a <time> with a machine-readable date; the time range is plain text read in order after the title.",
		"The AvatarGroup's aria-label states the total attendee count.",
	],
}
