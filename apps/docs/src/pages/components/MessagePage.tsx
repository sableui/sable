import {
	AgentAvatar,
	Attachment,
	Avatar,
	Bubble,
	BubbleReaction,
	BubbleReactions,
	Card,
	CodeBlock,
	Message,
	MessageScroller,
	messageMeta,
	RelativeTime,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const EARLIER = new Date(Date.now() - 1000 * 60 * 42)

function Frame({ children }: { children: React.ReactNode }) {
	return (
		<Card density="compact" className="w-full max-w-2xl">
			<MessageScroller className="p-[var(--card-p)]" jumpToLatest={false}>
				{children}
			</MessageScroller>
		</Card>
	)
}

export function MessagePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Message" lede={ledeFor(messageMeta)} />

			<ComponentPlayground meta={messageMeta} />

			<Section
				title="Two sides"
				description="Outgoing messages mirror incoming ones, tail and all."
			>
				<Example>
					<Frame>
						<Message
							messageId="m1"
							avatar={<Avatar size="sm" fallback="CA" />}
							header={
								<>
									<strong className="text-foreground">Carla</strong>
									<RelativeTime date={EARLIER} />
								</>
							}
						>
							<Bubble>Did the deploy finish?</Bubble>
						</Message>
						<Message messageId="m2" align="end">
							<Bubble variant="primary" align="end">
								Green across the board.
							</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="Grouped runs"
				description="Follow-ups from the same person sit tighter and line up under the first message."
			>
				<Example>
					<Frame>
						<Message
							messageId="g1"
							avatar={<Avatar size="sm" fallback="CA" />}
							header={<strong className="text-foreground">Carla</strong>}
						>
							<Bubble>One more thing.</Bubble>
						</Message>
						<Message messageId="g2" grouped>
							<Bubble tail={false}>The staging cert expires Friday.</Bubble>
						</Message>
						<Message messageId="g3" grouped>
							<Bubble tail={false}>
								Not urgent, but it will fail the smoke test if it lapses.
							</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="Header and footer"
				description="Name and time above, reactions and receipts below."
			>
				<Example>
					<Frame>
						<Message
							messageId="f1"
							avatar={<Avatar size="sm" fallback="JR" />}
							header={
								<>
									<strong className="text-foreground">Jordan</strong>
									<RelativeTime date={EARLIER} />
								</>
							}
							footer={
								<BubbleReactions>
									<BubbleReaction emoji="🎉" count={3} active />
									<BubbleReaction emoji="👀" />
								</BubbleReactions>
							}
						>
							<Bubble>Shipped 0.45.0.</Bubble>
						</Message>
					</Frame>
				</Example>
			</Section>

			<Section
				title="Any content"
				description="A rich answer, a file or a short reply all sit in the same row."
			>
				<Example>
					<Frame>
						<Message
							messageId="c1"
							avatar={<AgentAvatar size="sm" />}
							header={<strong className="text-foreground">Assistant</strong>}
						>
							<Bubble variant="plain">
								<p className="text-body-md text-foreground">
									Three things changed in this release:
								</p>
								<CodeBlock
									code={"+ Marker\n+ Bubble\n- Pill"}
									filename="CHANGELOG.md"
								/>
							</Bubble>
						</Message>
						<Message messageId="c2" align="end">
							<Attachment name="release-notes.pdf" meta="184 KB · PDF" />
						</Message>
					</Frame>
				</Example>
			</Section>

			<MetaFooter meta={messageMeta} />
		</>
	)
}
