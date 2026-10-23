import {
	AgentAvatar,
	Bubble,
	Button,
	Card,
	CardContent,
	Marker,
	markerMeta,
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

const STAGES = [
	"Thinking…",
	"Searching the docs",
	"Reading 4 sources",
	"Writing the answer",
]

/** A status marker is meant to be replaced as the work moves, not left up. */
function StatusDemo() {
	const [stage, setStage] = useState(0)
	const done = stage >= STAGES.length

	return (
		<div className="flex w-full flex-col items-start gap-3">
			<Card density="compact" className="w-full">
				<CardContent>
					{done ? (
						<Marker variant="note" icon="circle-check">
							Answered in 4.2s
						</Marker>
					) : (
						<Marker icon="spinner" spin shimmer>
							{STAGES[stage]}
						</Marker>
					)}
				</CardContent>
			</Card>
			<Button
				size="sm"
				variant="secondary"
				onClick={() => setStage((s) => (s >= STAGES.length ? 0 : s + 1))}
			>
				{done ? "Restart" : "Advance"}
			</Button>
		</div>
	)
}

export function MarkerPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Marker" lede={ledeFor(markerMeta)} />

			<ComponentPlayground meta={markerMeta} />

			<Section
				title="Streaming status"
				description="A spinner and shimmer while work runs, swapped for a quiet note when it finishes."
			>
				<Example>
					<StatusDemo />
				</Example>
			</Section>

			<Section
				title="Variants"
				description="All four sit quieter than messages, and only the bordered one is boxed."
			>
				<Example>
					<Card density="compact" className="w-full max-w-xl">
						<CardContent className="flex flex-col gap-4">
							<Marker icon="spinner" spin shimmer>
								Running the changelog tool
							</Marker>
							<Marker variant="note" icon="user">
								Carla joined the conversation
							</Marker>
							<Marker variant="separator">Yesterday</Marker>
							<Marker variant="bordered" icon="warning">
								This conversation will be archived in 7 days.
							</Marker>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<Section
				title="In a transcript"
				description="Date breaks, tool activity and status annotate the chat without competing with it."
			>
				<Example>
					<Card density="compact" className="w-full max-w-2xl">
						<MessageScroller className="p-[var(--card-p)]" jumpToLatest={false}>
							<Marker variant="separator">Yesterday</Marker>
							<Message messageId="k1" align="end">
								<Bubble variant="primary" align="end">
									Can you summarise the 0.44 releases?
								</Bubble>
							</Message>
							<Message messageId="k2" avatar={<AgentAvatar size="sm" />}>
								<Bubble>Three fixes and one new component. The changelog has the details.</Bubble>
							</Message>
							<Marker variant="separator">Today</Marker>
							<Message messageId="k3" align="end">
								<Bubble variant="primary" align="end">
									And 0.45?
								</Bubble>
							</Message>
							<Marker variant="note" icon="sparkles">
								Ran changelog — 12 entries
							</Marker>
							<Marker icon="spinner" spin shimmer>
								Writing the answer
							</Marker>
						</MessageScroller>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={markerMeta} />
		</>
	)
}
