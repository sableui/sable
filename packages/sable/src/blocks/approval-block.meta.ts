import type { BlockMeta } from "../lib/meta"

export const approvalBlockMeta: BlockMeta = {
	name: "ApprovalBlock",
	family: "AI & agents",
	kind: "card",
	width: { min: "18rem", max: "28rem" },
	summary: "An agent asking permission for one tool call: the question, what is at stake, the call itself as a ToolCall with its exact input, and Deny / Always allow / Allow once.",
	intent:
		"Reach for this in a chat or agent run when a tool call waits on the person — running a command, sending, paying, deleting, publishing. It wraps the call's own ToolCall, which shows status=\"awaiting\" until the person answers and then \"complete\" or \"denied\". A destructive action outside an agent is DestructiveActionModal.",
	notes: [
		"The title is the question in plain words (\"Run this command?\"); the description says what is at stake. That sentence is what the person is deciding on.",
		"The call is shown as the agent made it — tool name and raw input, open on arrival — because the exact arguments are what a careful person checks. Do not paraphrase them into a form.",
		"Three answers, as agent products settle on: Deny on the start edge, then Always allow and Allow once, the primary on the end. Neither is focused on arrival: an approval that a stray Enter can grant is not an approval.",
		"After a decision the buttons give way to one InlineStatus line saying what happened, and the ToolCall shows the outcome, so the thread keeps a record of the answer.",
	],
	a11y: [
		"Focus moves to the outcome line when the buttons leave, instead of dropping to the page; the line is a role=status region, so the decision is announced.",
		"The ToolCall announces its own status change, and its input is a labelled code view.",
	],
}
