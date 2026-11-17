# AgentRunBlock

One agent turn from question to answer: the person's Bubble, an AgentAvatar that thinks and speaks, a ToolCall, the reply as StreamingText, and a ChatComposer whose send becomes stop while the turn runs.

**Intent:** Reach for this to show an assistant at work in a card — a help widget, a copilot preview, a dashboard's ask-anything tile. Send a follow-up and the turn plays through thinking, a tool call and a streamed answer. A full conversation with history and scrolling is the ChatPanel page shell; a call that waits on the person is ApprovalBlock.

**Block:** AI & agents · card · designed for 18rem–24rem wide (fills its container up to the max)

## Notes

- One phase value drives the avatar's state, the status line and the composer's busy state, so the three never disagree about whether the agent is still working.
- The agent's reply is prose on the surface, not a Bubble: a bubble is a person's message, and a long answer with tool calls in it does not fit one.
- The wait is named in words ("Thinking…", the ToolCall's own status), with the ThinkingOrb and the avatar as the motion beside them. Neither animation is the only signal.
- Stop keeps what has arrived and says "Stopped."; a tool that was still running is marked stopped, not complete.
- The stages advance on timers here. Replace the effect with your model's events: first token, tool start, tool result, end of stream.

## Accessibility

- One role=status region is mounted from the start and only its text changes ("Thinking…", then "Stopped." if the turn is stopped); the visible lines are hidden from assistive technology so nothing is read twice. ToolCall announces its own status change.
- StreamingText sets aria-busy while the answer arrives, so a screen reader reads the settled reply once.
- The composer's send button becomes a labelled stop button while the turn runs.

## Source

```tsx
"use client"

import { useState, useEffect } from "react"
import { AgentAvatar, Bubble, Card, CardContent, CardFooter, ChatComposer, cn, InlineStatus, Message, StreamingText, ThinkingOrb, ToolCall } from "@sableui/react"

const run = {
	question: "Why did checkout fail last night?",
	tool: { name: "search_logs", running: "Searching the logs", done: "Searched the logs" },
	answer: "The payment webhook timed out 14 times between 02:10 and 02:40. Retries are on now, and all 14 orders went through.",
}
const words = run.answer.split(" ")

// The turn's stages, in order. Here they advance on timers, as a stand-in for
// your model's events: first token, tool start, tool result, end of stream.
type Phase = "thinking" | "tool" | "writing" | "done"

export interface AgentRunBlockProps {
	className?: string
	/** false drops the card's surface and border — for a chat column that already frames it. */
	framed?: boolean
	/** Called with the follow-up the person sent. */
	onSend?: (text: string) => void
}

export function AgentRunBlock({ className, framed = true, onSend }: AgentRunBlockProps) {
	const [question, setQuestion] = useState(run.question)
	const [phase, setPhase] = useState<Phase>("done")
	// How many words of the answer have arrived.
	const [shown, setShown] = useState(words.length)
	// The stage the person stopped the turn at, if they did.
	const [halted, setHalted] = useState<Phase | null>(null)

	useEffect(() => {
		if (phase === "done") return
		const timer =
			phase === "thinking"
				? setTimeout(() => setPhase("tool"), 1200)
				: phase === "tool"
					? setTimeout(() => setPhase("writing"), 1600)
					: setTimeout(() => {
							setShown(shown + 1)
							if (shown + 1 >= words.length) setPhase("done")
						}, 70)
		return () => clearTimeout(timer)
	}, [phase, shown])

	const send = (text: string) => {
		setQuestion(text)
		setShown(0)
		setHalted(null)
		setPhase("thinking")
		onSend?.(text)
	}
	const stop = () => {
		setHalted(phase)
		setPhase("done")
	}

	const working = phase !== "done"
	const called = phase === "tool" || phase === "writing" || (phase === "done" && halted !== "thinking")

	return (
		<Card variant={framed ? "default" : "flat"} className={cn("w-full max-w-sm", className)}>
			<CardContent className="flex flex-col gap-3">
				<Message messageId="question" align="end">
					<Bubble variant="tint" align="end">
						{question}
					</Bubble>
				</Message>
				{/* One flag drives the avatar, the status line and the composer, so
				    they never disagree about whether the agent is still working. */}
				<Message
					messageId="answer"
					avatar={<AgentAvatar size="sm" state={phase === "writing" ? "speaking" : working ? "thinking" : "idle"} />}
				>
					<div className="flex flex-col gap-2">
						{called ? (
							<ToolCall
								name={run.tool.name}
								title={phase === "tool" ? run.tool.running : run.tool.done}
								status={phase === "tool" ? "running" : halted === "tool" ? "denied" : "complete"}
								statusLabel={halted === "tool" ? "Stopped" : undefined}
							/>
						) : null}
						{/* The lines a reader sees. They come and go with the phase, so they
						    are not the live region: the one below is. */}
						{phase === "thinking" ? (
							<InlineStatus aria-hidden icon={<ThinkingOrb size="sm" />}>
								Thinking…
							</InlineStatus>
						) : null}
						{shown > 0 ? (
							<StreamingText className="text-body-md" text={words.slice(0, shown).join(" ")} streaming={phase === "writing"} />
						) : null}
						{!working && halted ? <InlineStatus aria-hidden>Stopped.</InlineStatus> : null}
					</div>
				</Message>
				{/* One live region, there from the first render and only its text
				    changing: a status inserted together with its words is announced
				    unreliably, or not at all. */}
				<p role="status" className="sr-only">
					{phase === "thinking" ? "Thinking…" : !working && halted ? "Stopped." : ""}
				</p>
			</CardContent>
			<CardFooter>
				<ChatComposer className="w-full" placeholder="Ask a follow-up…" busy={working} onStop={stop} onSend={send} />
			</CardFooter>
		</Card>
	)
}
```
