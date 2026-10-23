import {
	AgentAvatar,
	Avatar,
	Bubble,
	BubbleReaction,
	BubbleReactionAdd,
	BubbleReactions,
	bubbleMeta,
	DEFAULT_REACTIONS,
	Card,
	CardContent,
	CodeBlock,
	Message,
	MessageScroller,
} from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function Frame({
	children,
	wide = false,
}: {
	children: React.ReactNode
	/** Let the conversation run the full example width (to show the bubble's own cap). */
	wide?: boolean
}) {
	return (
		<Card className={wide ? "w-full" : "w-full max-w-2xl"}>
			<CardContent>
				<MessageScroller jumpToLatest={false}>{children}</MessageScroller>
			</CardContent>
		</Card>
	)
}

const LABELS: Record<string, string> = {
	...Object.fromEntries(DEFAULT_REACTIONS.map((r) => [r.emoji, r.label])),
	"👀": "Eyes",
	"🚢": "Ship",
}

function ReactionsDemo() {
	// Everyone else's counts; the reader's own reactions are added on top.
	const others: Record<string, number> = { "🎉": 2, "👀": 1, "🚢": 2 }
	const [mine, setMine] = useState<string[]>(["🎉"])
	const toggle = (emoji: string) =>
		setMine((prev) => (prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]))
	const shown = [...Object.keys(others), ...mine.filter((e) => !(e in others))]

	return (
		<Frame>
			<Message messageId="r1" avatar={<Avatar size="sm" fallback="JR" />}>
				<Bubble>Shipped 0.45.0.</Bubble>
				<BubbleReactions>
					{shown.map((emoji) => (
						<BubbleReaction
							key={emoji}
							emoji={emoji}
							label={LABELS[emoji]}
							count={(others[emoji] ?? 0) + (mine.includes(emoji) ? 1 : 0)}
							active={mine.includes(emoji)}
							onClick={() => toggle(emoji)}
						/>
					))}
					<BubbleReactionAdd selected={mine} onSelect={toggle} />
				</BubbleReactions>
			</Message>
		</Frame>
	)
}

export function BubblePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Bubble" lede={ledeFor(bubbleMeta)} />

			<ComponentPlayground meta={bubbleMeta} />

			<Section
				title="Variants"
				description="Muted for the other person, primary for your own, outline for a quieter own side."
			>
				<Example>
					<Frame>
						<Message messageId="v1" avatar={<Avatar size="sm" fallback="AM" />}>
							<Bubble>Did the deploy finish?</Bubble>
						</Message>
						<Message messageId="v2" align="end">
							<Bubble variant="primary" align="end">
								Green across the board.
							</Bubble>
						</Message>
						<Message messageId="v3" align="end">
							<Bubble variant="outline" align="end">
								Sent from the status page integration.
							</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="Plain, for long-form output"
				description="No box, so long answers with code and tables use the full width."
			>
				<Example>
					<Frame>
						<Message messageId="p1" avatar={<AgentAvatar size="sm" />}>
							<Bubble variant="plain" className="space-y-3">
								<p className="text-body-md text-foreground">
									Three things changed in this release:
								</p>
								<CodeBlock
									code={"+ Marker\n+ Bubble\n- Pill"}
									filename="CHANGELOG.md"
								/>
							</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="The tail"
				description="The tail marks where a speaker starts. Follow-up messages drop it."
			>
				<Example>
					<Frame>
						<Message messageId="t1" avatar={<Avatar size="sm" fallback="AM" />}>
							<Bubble>Tail on — this is where the speaker starts.</Bubble>
						</Message>
						<Message messageId="t2" grouped>
							<Bubble tail={false}>Tail off — this continues the run.</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="Reactions"
				description="Tap a pill to add or take back your own reaction, or pick a new one from the smiley. When a reaction becomes yours the emoji blooms and copies of it spray out; taking it back is quiet. Reactions the page loads with stay still."
			>
				<Example
					code={`<BubbleReactions>
	{reactions.map((r) => (
		<BubbleReaction
			key={r.emoji}
			emoji={r.emoji}
			label={r.label}
			count={r.count}
			active={mine.includes(r.emoji)}
			onClick={() => toggle(r.emoji)}
		/>
	))}
	<BubbleReactionAdd selected={mine} onSelect={toggle} />
</BubbleReactions>`}
				>
					<ReactionsDemo />
				</Example>
			</Section>

			<Section
				title="Reading width"
				description="Bubbles stop at a comfortable reading width, even in a wide window."
			>
				<Example>
					<Frame wide>
						<Message messageId="w1" avatar={<Avatar size="sm" fallback="AM" />}>
							<Bubble>
								The scroller anchors on the first rendered message and re-adds
								whatever height appeared above it, which is what keeps a
								prepended page of history from moving the thing you were
								reading. It is a small behaviour and it is the one people
								notice when it is missing — this line is long enough to show
								the cap doing its work.
							</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<MetaFooter meta={bubbleMeta} />
		</>
	)
}
