import {
	Attachment,
	attachmentMeta,
	Avatar,
	Button,
	Card,
	CardContent,
	Icon,
	Message,
	MessageScroller,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const SHOTS = [
	"https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=400&q=60",
	"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=60",
	"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60",
]

function RemoveAction({ name }: { name: string }) {
	return (
		<Button variant="ghost" size="icon-xs" aria-label={`Remove ${name}`}>
			<Icon name="xmark" />
		</Button>
	)
}

export function AttachmentPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Attachment"
				lede={ledeFor(attachmentMeta)}
			/>

			<Section
				title="Two shapes"
				description="A named row for documents, a picture tile for images."
			>
				<Example>
					<div className="flex flex-wrap items-start gap-3">
						<Attachment
							name="q3-proposal.pdf"
							meta="2.4 MB · PDF"
							actions={<RemoveAction name="q3-proposal.pdf" />}
						/>
						<Attachment variant="media" name="cover.png" thumbnail={SHOTS[0]} />
						<Attachment variant="media" name="hero.png" thumbnail={SHOTS[1]} />
					</div>
				</Example>
			</Section>

			<Section
				title="Upload states"
				description="Uploading with known progress, uploading without, and failed."
			>
				<Example>
					<div className="flex flex-wrap items-start gap-3">
						<Attachment
							name="recording.mov"
							meta="Uploading… 62%"
							status="uploading"
							progress={62}
						/>
						<Attachment
							name="dataset.csv"
							meta="Uploading…"
							status="uploading"
						/>
						<Attachment
							name="raw-capture.mov"
							meta="Upload failed — over the 50 MB limit"
							status="error"
							icon="warning"
							actions={
								<Button variant="ghost" size="xs">
									Retry
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<Section
				title="In a message"
				description="Attachments sit in a conversation where a bubble would."
			>
				<Example>
					<Card className="w-full max-w-2xl">
						<CardContent>
							<MessageScroller jumpToLatest={false}>
								<Message
									messageId="a1"
									avatar={<Avatar size="sm" fallback="CA" alt="Carla" />}
									header={<strong className="text-foreground">Carla</strong>}
								>
									<div className="flex flex-wrap gap-2">
										{SHOTS.map((src, i) => (
											<Attachment
												key={src}
												variant="media"
												name={`shot-${i + 1}.png`}
												thumbnail={src}
												onOpen={() => undefined}
											/>
										))}
									</div>
								</Message>
								<Message messageId="a2" align="end">
									<Attachment
										name="annotated.pdf"
										meta="1.1 MB · PDF"
										onOpen={() => undefined}
									/>
								</Message>
							</MessageScroller>
						</CardContent>
					</Card>
				</Example>
			</Section>

			<MetaFooter meta={attachmentMeta} />
		</>
	)
}
