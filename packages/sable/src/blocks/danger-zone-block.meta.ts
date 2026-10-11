import type { BlockMeta } from "../lib/meta"

export const dangerZoneBlockMeta: BlockMeta = {
	name: "DangerZoneBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "20rem", max: "42rem" },
	summary: "A delete-account card: what deleting removes and what survives, one destructive Button, and a DestructiveActionModal that asks for the handle to be typed before it acts.",
	intent:
		"Reach for this as the last section of account, workspace or project settings. Deleting a single record from a list is an OverflowMenu item that opens DestructiveActionModal directly, not a card.",
	notes: [
		"Copied from the SettingsPage page shell's Delete account section.",
		"The button never acts directly: it opens the modal, whose confirm stays disabled until the handle is typed.",
		"The description says what is lost AND what is kept (\"Collectors keep the editions they own\"), which is what people want to know before they decide.",
	],
	a11y: [
		"DestructiveActionModal is an alertdialog: focus opens on Cancel and the backdrop does not dismiss it.",
		"The CardTitle is an h2, so the section is reachable by heading.",
	],
}
