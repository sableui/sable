import {
	AgentAvatar,
	type AgentAvatarState,
	agentAvatarMeta,
	Bubble,
	Button,
	Message,
	StreamingText,
} from "@sableui/react"
import { useEffect, useRef, useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const ANSWER =
	"Anchor on the oldest rendered message instead, and add back however far it moved. Appends leave it alone, so the same rule covers both."

/** One turn, played out: thinking before the first token, speaking while it streams. */
function LiveTurn() {
	const [state, setState] = useState<AgentAvatarState>("idle")
	const [text, setText] = useState(ANSWER)
	const timers = useRef<ReturnType<typeof setTimeout>[]>([])
	useEffect(() => () => timers.current.forEach(clearTimeout), [])

	const ask = () => {
		timers.current.forEach(clearTimeout)
		timers.current = []
		setText("")
		setState("thinking")
		const words = ANSWER.split(" ")
		timers.current.push(
			setTimeout(() => {
				setState("speaking")
				words.forEach((_, i) => {
					timers.current.push(
						setTimeout(() => {
							setText(words.slice(0, i + 1).join(" "))
							if (i === words.length - 1) setState("idle")
						}, i * 70),
					)
				})
			}, 1600),
		)
	}

	return (
		<div className="flex w-full max-w-md flex-col gap-4">
			<p role="status" aria-atomic="true" className="sr-only">
				{state === "thinking" ? "Thinking" : state === "speaking" ? "Writing reply" : "Reply complete"}
			</p>
			<Message messageId="live-1" avatar={<AgentAvatar size="sm" state={state} />}>
				{text ? (
					<Bubble>
						<StreamingText text={text} streaming={state === "speaking"} caret={false} />
					</Bubble>
				) : <Bubble>Thinking…</Bubble>}
			</Message>
			<Button variant="outline" size="sm" className="self-start" onClick={ask} disabled={state !== "idle"}>
				Ask again
			</Button>
		</div>
	)
}

export function AgentAvatarPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Agent Avatar"
				lede={ledeFor(agentAvatarMeta)}
			/>

			<ComponentPlayground meta={agentAvatarMeta} />

			<Section
				title="Basic"
				description="A sable peeking out of its den. Bring your pointer close and it climbs out to look; hover it and it smiles."
			>
				<Example motionControl>
					<AgentAvatar size="xl" />
				</Example>
			</Section>

			<Section
				title="States"
				description="Idle peeks. Thinking sinks low and scans upward. Speaking comes up to talk."
			>
				<Example
					code={`<AgentAvatar size="lg" />
<AgentAvatar size="lg" state="thinking" />
<AgentAvatar size="lg" state="speaking" />`}
				>
					{(["idle", "thinking", "speaking"] as const).map((state) => (
						<figure key={state} className="flex flex-col items-center gap-3">
							<AgentAvatar size="lg" state={state} aria-hidden="true" />
							<figcaption className="text-body-sm text-muted-foreground">
								{state === "idle" ? "Idle" : state === "thinking" ? "Thinking" : "Speaking"}
							</figcaption>
						</figure>
					))}
				</Example>
			</Section>

			<Section
				title="In a turn"
				description="Drive the state from the turn's pending flag. Pair it with a text status for the wait; a second animated indicator is unnecessary."
			>
				<Example
					code={`<p role="status" aria-atomic="true" className="sr-only">
	{pending ? (text ? "Writing reply" : "Thinking") : "Reply complete"}
</p>
<Message
	messageId="a2"
	avatar={<AgentAvatar size="sm" state={pending ? (text ? "speaking" : "thinking") : "idle"} />}
>
	<Bubble>
		{text ? <StreamingText text={text} streaming={pending} caret={false} /> : "Thinking…"}
	</Bubble>
</Message>`}
				>
					<LiveTurn />
				</Example>
			</Section>

			<Section
				title="Only the newest turn is live"
				description="Earlier turns pass live={false} and rest, so the transcript is not a column of eyes."
			>
				<Example
					code={`<Message messageId="a1" avatar={<AgentAvatar size="sm" live={false} />}>
	<Bubble>Almost always the anchor.</Bubble>
</Message>
<Message messageId="u1" align="end">
	<Bubble variant="primary" align="end">Does that cover new messages too?</Bubble>
</Message>
<Message messageId="a2" avatar={<AgentAvatar size="sm" />}>
	<Bubble>Yes. Appends leave the anchor alone.</Bubble>
</Message>`}
				>
					<div className="flex w-full max-w-md flex-col gap-4">
						<Message messageId="a1" avatar={<AgentAvatar size="sm" live={false} />}>
							<Bubble>Almost always the anchor.</Bubble>
						</Message>
						<Message messageId="u1" align="end">
							<Bubble variant="primary" align="end">
								Does that cover new messages too?
							</Bubble>
						</Message>
						<Message messageId="a2" avatar={<AgentAvatar size="sm" />}>
							<Bubble>Yes. Appends leave the anchor alone.</Bubble>
						</Message>
					</div>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="The Avatar ladder, from a dense row to a portrait."
			>
				<Example
					code={`<AgentAvatar size="2xs" />
<AgentAvatar size="xs" />
<AgentAvatar size="sm" />
<AgentAvatar size="md" />
<AgentAvatar size="lg" />
<AgentAvatar size="xl" />`}
				>
					<AgentAvatar size="2xs" />
					<AgentAvatar size="xs" />
					<AgentAvatar size="sm" />
					<AgentAvatar size="md" />
					<AgentAvatar size="lg" />
					<AgentAvatar size="xl" />
				</Example>
			</Section>

			<Section
				title="Motion"
				description="Subtle keeps the states and drops the tracking, blinks and twitches. Off draws each state still."
			>
				<Example
					motionControl={false}
					code={`<AgentAvatar size="lg" state="thinking" motion="subtle" />
<AgentAvatar size="lg" state="thinking" motion="off" />`}
				>
					<AgentAvatar size="lg" state="thinking" motion="subtle" />
					<AgentAvatar size="lg" state="thinking" motion="off" />
				</Example>
			</Section>

			<MetaFooter meta={agentAvatarMeta} />
		</>
	)
}
