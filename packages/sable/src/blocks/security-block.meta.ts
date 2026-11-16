import type { BlockMeta } from "../lib/meta"

export const securityBlockMeta: BlockMeta = {
	name: "SecurityBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "20rem", max: "28rem" },
	summary: "Account security in one card: a Switch for two-factor authentication, passkeys with Manage, and the signed-in devices as Entity rows with RelativeTime and Sign out, plus a two-press Sign out of other devices.",
	intent:
		"Reach for this in account settings, beside ProfileFormBlock and NotificationSettingsBlock. Keys for programmatic access are ApiKeysBlock; deleting the account is DangerZoneBlock.",
	notes: [
		"Two-factor is a Switch because it applies the moment it changes, with no Save; its subtitle says what it is set to.",
		"The device rows share one CardList with the protection rows, set off by a quiet group label (\"Signed-in devices\") rather than a second card.",
		"The current device has no Sign out button; a Badge says \"This device\" in its place, so the one session that cannot be ended here is never offered.",
		"Last seen is a RelativeTime, and the sample sessions are timed from the page load.",
		"Sign out of other devices is a ConfirmButton naming how many it will end, and it disables itself when there are none.",
	],
	a11y: [
		"Each Sign out button is named for its device (\"Sign out of Windows desktop\").",
		"Signing a device out moves focus to the group label, since its row is gone, and a status region mounted from the start says what happened.",
		"The Switch is named \"Two-factor authentication\", the row's title.",
	],
}
