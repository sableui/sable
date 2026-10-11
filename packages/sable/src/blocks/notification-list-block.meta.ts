import type { BlockMeta } from "../lib/meta"

export const notificationListBlockMeta: BlockMeta = {
	name: "NotificationListBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "An activity list: Entity rows with the actor's Avatar, who did what, and a compact time with an unread StatusDot.",
	intent:
		"Reach for this for a notifications popover, a recent-activity card or an inbox preview. A full inbox with selection and bulk actions is a ListDetailPage.",
	notes: [
		"Rows are Card + CardList + Entity, inset from the card's padding at any density.",
		"Unread is a quiet info dot after the time — the list stays calm when most items are unread.",
		"framed={false} drops the surface for a Popover, which already is one.",
	],
	a11y: [
		"The unread dot is decorative; each unread row also carries a screen-reader-only \"(unread)\" after the name.",
		"Each Avatar's alt is the actor's name.",
	],
}
