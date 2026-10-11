import {
	Attachment,
	Avatar,
	Bubble,
	Button,
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	ChatComposer,
	chatComposerMeta,
	Density,
	EmptyState,
	Icon,
	Marker,
	Message,
	MessageScroller,
} from "@sableui/react"
import { useEffect, useRef, useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

interface Turn {
	id: string
	mine: boolean
	body: string
}

const CANNED = [
	"Anchor on the oldest rendered message, not on the container.",
	"Prepends move that anchor; appends leave it alone. One rule covers both.",
	"Cap the composer's height or a pasted essay eats the transcript.",
]

/** The whole thing, working — type and send. */
function LiveChat() {
	const [turns, setTurns] = useState<Turn[]>([])
	const [busy, setBusy] = useState(false)
	// The pending reply, so Stop (and New chat) actually cancel it instead of
	// letting it land after the reader asked it not to.
	const pending = useRef<number | undefined>(undefined)
	useEffect(() => () => window.clearTimeout(pending.current), [])

	function stop() {
		window.clearTimeout(pending.current)
		setBusy(false)
	}

	function send(text: string) {
		const id = `t${turns.length + 1}`
		setTurns((prev) => [...prev, { id, mine: true, body: text }])
		setBusy(true)
		pending.current = window.setTimeout(() => {
			setTurns((prev) => [
				...prev,
				{
					id: `${id}r`,
					mine: false,
					body: CANNED[prev.length % CANNED.length],
				},
			])
			setBusy(false)
		}, 1400)
	}

	return (
		<Card density="compact" className="flex h-104 w-full flex-col">
			<CardHeader>
				<CardTitle>New chat</CardTitle>
				<CardDescription>How can I help you today?</CardDescription>
				<CardAction>
					<Button
						variant="outline"
						size="icon-sm"
						aria-label="Start a new chat"
						onClick={() => {
							stop()
							setTurns([])
						}}
					>
						<Icon name="plus" />
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent className="flex min-h-0 flex-1 flex-col">
				<MessageScroller className="min-h-0 flex-1">
					{turns.length === 0 ? (
						<EmptyState
							icon={<Icon name="comment" />}
							title="Welcome back!"
							description="What are we working on today? Send a message to start."
						/>
					) : null}
					{turns.map((turn, i) => (
						<Message
							key={turn.id}
							messageId={turn.id}
							align={turn.mine ? "end" : "start"}
							grouped={i > 0 && turns[i - 1].mine === turn.mine}
							avatar={turn.mine ? undefined : <Avatar size="sm" fallback="AI" />}
						>
							<Bubble
								variant={turn.mine ? "primary" : "muted"}
								align={turn.mine ? "end" : "start"}
								tail={i === 0 || turns[i - 1].mine !== turn.mine}
							>
								{turn.body}
							</Bubble>
						</Message>
					))}
					{busy ? (
						<Marker icon="spinner" spin shimmer>
							Thinking…
						</Marker>
					) : null}
				</MessageScroller>
			</CardContent>

			{/* Inside a Card the composer takes the card's inner radius on its own. */}
			<CardFooter>
				<ChatComposer
					placeholder="Ask anything…"
					onSend={send}
					busy={busy}
					onStop={stop}
					onAttach={() => undefined}
				/>
			</CardFooter>
		</Card>
	)
}

/** Attachments live inside the composer, above the field. */
function AttachmentsDemo() {
	const [files, setFiles] = useState([
		{ id: "f1", name: "scroller.tsx", meta: "4.2 KB · TSX" },
		{ id: "f2", name: "trace.json", meta: "88 KB · JSON" },
	])

	return (
		<ChatComposer
			className="max-w-lg"
			placeholder="Describe what you're seeing…"
			onAttach={() => undefined}
			attachments={files.map((f) => (
				<Attachment
					key={f.id}
					name={f.name}
					meta={f.meta}
					className="max-w-[14rem]"
					actions={
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label={`Remove ${f.name}`}
							onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
						>
							<Icon name="xmark" />
						</Button>
					}
				/>
			))}
		/>
	)
}

/** Controlled, with a counter and a limit. */
function ControlledDemo() {
	const [draft, setDraft] = useState("")
	const limit = 180
	const over = draft.length > limit

	return (
		<ChatComposer
			className="max-w-lg"
			value={draft}
			onValueChange={setDraft}
			onSend={() => setDraft("")}
			invalid={over}
			placeholder="Write a short note…"
			footer={`${draft.length} / ${limit}`}
		/>
	)
}

/** One small chat, rendered twice — once per register. */
function CompactSample() {
	return (
		<Card density="compact" className="flex h-96 flex-col">
			<MessageScroller className="min-h-0 flex-1 p-(--card-p)">
				<Marker variant="separator">Today</Marker>
				<Message
					messageId="d1"
					avatar={<Avatar size="sm" fallback="AI" />}
					header={<strong className="text-foreground">Agent</strong>}
				>
					<Bubble>Which layer should the grain sit on?</Bubble>
				</Message>
				<Message messageId="d2" align="end">
					<Bubble variant="primary" align="end">
						Above the tone pass, below the rgb-shift.
					</Bubble>
				</Message>
			</MessageScroller>
			<CardFooter>
				<ChatComposer
					placeholder="Refine it…"
					onAttach={() => undefined}
				/>
			</CardFooter>
		</Card>
	)
}

export function ChatComposerPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Chat Composer"
				lede={ledeFor(chatComposerMeta)}
			/>

			<Section
				title="A working chat"
				description="Type and send. While a reply streams, send becomes stop."
			>
				<Example>
					<LiveChat />
				</Example>
			</Section>

			<Section
				title="Attachments"
				description="Files sit above the text, in the same box as the message."
			>
				<Example>
					<AttachmentsDemo />
				</Example>
			</Section>

			<Section
				title="With a character limit"
				description="A counter sits below. Past the limit, the border turns red."
			>
				<Example>
					<ControlledDemo />
				</Example>
			</Section>

			<Section
				title="In a tool panel"
				description="The same chat in a compact tool panel. Text, spacing and controls all tighten together."
			>
				<Example>
					<div className="flex w-full flex-col gap-4 sm:flex-row">
						<div className="min-w-0 flex-1">
							<p className="mb-2 text-label-md text-muted-foreground">
								Default
							</p>
							<CompactSample />
						</div>
						<div className="min-w-0 flex-1">
							<p className="mb-2 text-label-md text-muted-foreground">
								Compact
							</p>
							<Density value="compact">
								<CompactSample />
							</Density>
						</div>
					</div>
				</Example>
			</Section>

			<Section
				title="Blocked"
				description="For a read-only thread or a lost connection."
			>
				<Example>
					<ChatComposer
						className="max-w-lg"
						disabled
						defaultValue="This thread is archived."
						placeholder="Read-only"
					/>
				</Example>
			</Section>

			<MetaFooter meta={chatComposerMeta} />
		</>
	)
}
