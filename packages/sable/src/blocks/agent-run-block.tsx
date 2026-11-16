"use client"

import { useEffect, useState } from "react"
import { AgentAvatar } from "../components/agent-avatar"
import { Bubble } from "../components/bubble"
import { Card, CardContent, CardFooter } from "../components/card"
import { ChatComposer } from "../components/chat-composer"
import { InlineStatus } from "../components/inline-status"
import { Message } from "../components/message"
import { StreamingText } from "../components/streaming-text"
import { ThinkingOrb } from "../components/thinking-orb"
import { ToolCall } from "../components/tool-call"
import { cn } from "../lib/cn"

// ---block-code---
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
					<Bubble variant="primary" align="end">
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
