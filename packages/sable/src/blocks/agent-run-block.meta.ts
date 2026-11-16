import type { BlockMeta } from "../lib/meta"

export const agentRunBlockMeta: BlockMeta = {
	name: "AgentRunBlock",
	family: "AI & agents",
	kind: "card",
	width: { min: "18rem", max: "24rem" },
	summary: "One agent turn from question to answer: the person's Bubble, an AgentAvatar that thinks and speaks, a ToolCall, the reply as StreamingText, and a ChatComposer whose send becomes stop while the turn runs.",
	intent:
		"Reach for this to show an assistant at work in a card — a help widget, a copilot preview, a dashboard's ask-anything tile. Send a follow-up and the turn plays through thinking, a tool call and a streamed answer. A full conversation with history and scrolling is the ChatPanel page shell; a call that waits on the person is ApprovalBlock.",
	notes: [
		"One phase value drives the avatar's state, the status line and the composer's busy state, so the three never disagree about whether the agent is still working.",
		"The agent's reply is prose on the surface, not a Bubble: a bubble is a person's message, and a long answer with tool calls in it does not fit one.",
		"The wait is named in words (\"Thinking…\", the ToolCall's own status), with the ThinkingOrb and the avatar as the motion beside them. Neither animation is the only signal.",
		"Stop keeps what has arrived and says \"Stopped.\"; a tool that was still running is marked stopped, not complete.",
		"The stages advance on timers here. Replace the effect with your model's events: first token, tool start, tool result, end of stream.",
	],
	a11y: [
		"One role=status region is mounted from the start and only its text changes (\"Thinking…\", then \"Stopped.\" if the turn is stopped); the visible lines are hidden from assistive technology so nothing is read twice. ToolCall announces its own status change.",
		"StreamingText sets aria-busy while the answer arrives, so a screen reader reads the settled reply once.",
		"The composer's send button becomes a labelled stop button while the turn runs.",
	],
}
