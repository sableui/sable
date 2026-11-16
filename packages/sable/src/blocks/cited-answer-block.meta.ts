import type { BlockMeta } from "../lib/meta"

export const citedAnswerBlockMeta: BlockMeta = {
	name: "CitedAnswerBlock",
	family: "AI & agents",
	kind: "card",
	width: { min: "20rem", max: "28rem" },
	summary: "An assistant's answer with its sources: the question as the title, the answer with numbered citations where each claim is made (a ContextCard previews the passage), and the sources as a list below.",
	intent:
		"Reach for this when an answer is grounded in documents: help-centre search, a research assistant, an internal knowledge tool. An agent turn with tool calls and a composer is AgentRunBlock; a full conversation is the ChatPanel page shell.",
	notes: [
		"Citations sit where the claim is made, not only in a list at the end, so the reader checks the sentence they doubt.",
		"A citation is a link to its source; hovering or focusing it opens a ContextCard with the title, the site and the passage, so checking does not cost a page load.",
		"The sources list repeats the numbers as square Avatars, so a citation and its row match at a glance.",
		"A citation and a source row both report through `onOpen(sourceId)`, and both are real links (`href`), so they still work without it.",
		"The answer is runs of text, each with the sources it rests on: replace them with your model's output and its source ids.",
	],
	a11y: [
		"Each citation is named \"Source 1: Refund policy\", not a bare \"[1]\".",
		"The preview opens on focus as well as hover, and the source row says the same, so nothing lives only in the popup.",
		"The number marks in the list are decorative; the row's title names the source.",
	],
}
