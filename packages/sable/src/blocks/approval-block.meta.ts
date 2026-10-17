import type { BlockMeta } from "../lib/meta"

export const approvalBlockMeta: BlockMeta = {
	name: "ApprovalBlock",
	family: "AI & agents",
	kind: "card",
	width: { min: "18rem", max: "28rem" },
	summary: "An agent asking permission for one tool call: the question, what will happen and what can't be undone, the call's details, an \"allow for the rest of this chat\" Checkbox, and Deny / Allow.",
	intent:
		"Reach for this in a chat or agent run when a tool call waits on the person — sending, paying, deleting, publishing. The call itself, before and after the decision, is a ToolCall with status=\"awaiting\", then \"complete\" or \"denied\". A destructive action outside an agent is DestructiveActionModal.",
	notes: [
		"The title is the question in plain words (\"Send the invoice to Ada?\"), not the tool's name; the tool's name is one row of the details, for the person who wants to know exactly what runs.",
		"The description says what can't be undone. That sentence is what the person is deciding on.",
		"Deny comes first and Allow is the primary on the end, the same order as every Sable confirmation. Neither is focused on arrival: an approval that a stray Enter can grant is not an approval.",
		"After a decision the buttons give way to one InlineStatus line saying what happened, so the thread keeps a record of the answer.",
	],
	a11y: [
		"Focus moves to the outcome line when the buttons leave, instead of dropping to the page; the line is a role=status region, so the decision is announced.",
		"The details are a dl, so each value is read with its label.",
		"The remember Checkbox has its own Label, so the tool name inside it is part of its accessible name.",
	],
}
