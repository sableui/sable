import type { BlockMeta } from "../lib/meta"

export const apiKeysBlockMeta: BlockMeta = {
	name: "ApiKeysBlock",
	family: "Settings & team",
	kind: "card",
	width: { min: "20rem", max: "42rem" },
	summary: "An API keys card: each key's name with its masked hint in Code, when it was created and last used, and an OverflowMenu to rename, roll or revoke.",
	intent:
		"Reach for this for developer settings — API keys, access tokens, webhook secrets. Show a newly created key once, in a Dialog with a copy button; this list only ever shows the masked hint.",
	notes: [
		"Only the last four characters are shown. A full key never appears in a list, so there is no copy action here.",
		"\"Last used\" sits in the detail line: it is what tells someone a key is safe to revoke.",
		"Revoke is the destructive item, last and after a separator; confirm it in your handler with DestructiveActionModal.",
	],
	a11y: [
		"Each OverflowMenu is labelled with the key's name, so the triggers are distinguishable.",
		"The masked hint is a Code element inside the title, read after the key's name.",
	],
}
