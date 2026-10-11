import type { BlockMeta } from "../lib/meta"

export const notificationSettingsBlockMeta: BlockMeta = {
	name: "NotificationSettingsBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "18rem", max: "20rem" },
	summary: "A preferences card: Entity rows in a CardList, each with a title, a one-line detail and a Switch that applies instantly.",
	intent:
		"Reach for this for any short list of on/off preferences — notifications, privacy, feature flags in a settings section. For a full settings route with a section rail, start from the SettingsPage page shell.",
	notes: [
		"Switches apply the moment they change; never pair them with a Save button. `onChange` receives the row id and the new state.",
		"Rows are Card + CardList + Entity, so they inset with the card's padding at any density.",
	],
	a11y: [
		"Each Switch takes its row title as aria-label, since the Entity title is not a <label>.",
		"Keep details to one line — Entity truncates its subtitle.",
	],
}
