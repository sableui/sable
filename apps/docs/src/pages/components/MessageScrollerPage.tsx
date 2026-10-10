import {
	Avatar,
	Bubble,
	Button,
	Card,
	Marker,
	Message,
	MessageScroller,
	messageScrollerMeta,
} from "@sableui/react"
import { useState } from "react"
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

const SEED: Turn[] = [
	{ id: "t1", mine: false, body: "Morning — did the 0.44.2 deploy finish?" },
	{ id: "t2", mine: true, body: "It did. Green across all three regions." },
	{
		id: "t3",
		mine: false,
		body: "Any fallout from the density sweep?",
	},
	{
		id: "t4",
		mine: true,
		body: "One: the dismiss control was still 24px in two places. Fixed in the same release.",
	},
	{ id: "t5", mine: false, body: "Good. I'll close the ticket." },
	{
		id: "t6",
		mine: true,
		body: "Before you do — the sync gate is still disagreeing with itself on cold builds. Separate issue, but same area.",
	},
	{ id: "t7", mine: false, body: "Filed. Thanks." },
]

const OUTGOING = [
	"Taking a look now.",
	"That matches what I saw in staging.",
	"Pushed a fix — check when you get a moment.",
	"Confirmed on my end too.",
]

function Turns({ turns }: { turns: Turn[] }) {
	return (
		<>
			{turns.map((turn) => (
				<Message
					key={turn.id}
					messageId={turn.id}
					align={turn.mine ? "end" : "start"}
					avatar={
						turn.mine ? undefined : <Avatar size="sm" fallback="AM" />
					}
				>
					<Bubble
						variant={turn.mine ? "primary" : "muted"}
						align={turn.mine ? "end" : "start"}
					>
						{turn.body}
					</Bubble>
				</Message>
			))}
		</>
	)
}

/** Auto-follow, and the jump control that appears once you scroll away. */
function FollowDemo() {
	const [turns, setTurns] = useState(SEED)
	const [following, setFollowing] = useState(true)

	function send() {
		const body = OUTGOING[turns.length % OUTGOING.length]
		setTurns((prev) => [...prev, { id: `t${prev.length + 1}`, mine: true, body }])
	}

	return (
		<div className="flex w-full flex-col gap-3">
			<Card density="compact">
				<MessageScroller className="h-72 p-[var(--card-p)]" onFollowChange={setFollowing}>
					<Marker variant="separator">Today</Marker>
					<Turns turns={turns} />
				</MessageScroller>
			</Card>
			<div className="flex items-center gap-3">
				<Button size="sm" variant="secondary" onClick={send}>
					Send a message
				</Button>
				<p className="min-w-0 text-body-xs text-muted-foreground">
					{following
						? "Following — new messages pin to the bottom."
						: "Released — scroll back down, or use the jump control."}
				</p>
			</div>
		</div>
	)
}

/** Prepending history above the reader without moving what they are reading. */
function PrependDemo() {
	const [turns, setTurns] = useState(SEED)
	const [remaining, setRemaining] = useState(3)
	const [loading, setLoading] = useState(false)

	function prependOlder() {
		setTurns((prev) => [
			...Array.from({ length: 4 }, (_, i) => ({
				id: `older-${remaining}-${i}`,
				mine: i % 2 === 1,
				body: `Earlier message ${remaining}.${i + 1} — loaded above the fold.`,
			})),
			...prev,
		])
		setRemaining((r) => r - 1)
	}

	function loadOlder() {
		// A short stand-in for the fetch, so the button shows the loading state a
		// real request would.
		setLoading(true)
		window.setTimeout(() => {
			prependOlder()
			setLoading(false)
		}, 400)
	}

	return (
		<Card density="compact" className="w-full">
			<MessageScroller
				className="h-72 p-[var(--card-p)]"
				// Opens at the top, where the sentinel is — which is both the honest
				// place to start a "load earlier" demo and well clear of the follow
				// band, so the anchor path is what runs when you press the button.
				initialScroll="top"
			>
				{remaining > 0 ? (
					<Button
						variant="secondary"
						size="sm"
						className="self-center"
						loading={loading}
						loadingLabel="Loading…"
						onClick={loadOlder}
					>
						Load earlier messages
					</Button>
				) : (
					<Marker variant="note">Beginning of the conversation</Marker>
				)}
				<Turns turns={turns} />
			</MessageScroller>
		</Card>
	)
}

export function MessageScrollerPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Message Scroller"
				lede={ledeFor(messageScrollerMeta)}
			/>

			<Section
				title="Auto-follow"
				description="New messages keep the view at the bottom until you scroll up. Try scrolling away, then send a few."
			>
				<Example>
					<FollowDemo />
				</Example>
			</Section>

			<Section
				title="Loading older messages"
				description="Older messages load above without moving what you were reading."
			>
				<Example>
					<PrependDemo />
				</Example>
			</Section>

			<MetaFooter meta={messageScrollerMeta} />
		</>
	)
}
