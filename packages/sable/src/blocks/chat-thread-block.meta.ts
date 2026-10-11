import type { BlockMeta } from "../lib/meta"

export const chatThreadBlockMeta: BlockMeta = {
	name: "ChatThreadBlock",
	family: "Social & messaging",
	kind: "card",
	width: { min: "16rem", max: "20rem" },
	summary: "A short message thread on a card: Message rows with incoming muted Bubbles on the start side and your own primary Bubbles on the end.",
	intent:
		"Reach for this to show a conversation excerpt — a support preview, a comment thread on a dashboard, a recent-DM card. A working chat with a composer, streaming and history is the ChatPanel page shell.",
	notes: [
		"Sit it on a card, not straight on a muted page: incoming bubbles are the muted surface, and would vanish into it.",
		"Your own messages align to the end with the primary Bubble; everyone else's align to the start.",
	],
	a11y: [
		"Each Message carries a messageId, so a thread can be addressed and announced item by item.",
		"Direction is shown by alignment and colour; when senders matter, add the sender's name to each Message.",
	],
}
