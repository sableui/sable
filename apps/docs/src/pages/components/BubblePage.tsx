import {
	Avatar,
	Bubble,
	BubbleReaction,
	BubbleReactions,
	bubbleMeta,
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

function ReactionsDemo() {
	const [mine, setMine] = useState<Record<string, boolean>>({ "🎉": true })
	const counts: Record<string, number> = { "🎉": 3, "👀": 1, "🚢": 2 }

	return (
		<Frame>
			<Message messageId="r1" avatar={<Avatar size="sm" fallback="JR" />}>
				<Bubble>Shipped 0.45.0.</Bubble>
				<BubbleReactions>
					{Object.entries(counts).map(([emoji, base]) => (
						<BubbleReaction
							key={emoji}
							emoji={emoji}
							count={base + (mine[emoji] ? 1 : 0)}
							active={Boolean(mine[emoji])}
							onClick={() =>
								setMine((prev) => ({ ...prev, [emoji]: !prev[emoji] }))
							}
						/>
					))}
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
						<Message messageId="p1" avatar={<Avatar size="sm" fallback="AI" />}>
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
				description="Tap to add or remove your own reaction."
			>
				<Example>
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
