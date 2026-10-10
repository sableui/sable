import { Feedback, feedbackMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function FeedbackPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Feedback"
				lede={ledeFor(feedbackMeta)}
			/>

			<Section
				title="Basic"
				description="Opens a small form with a rating row and a message."
			>
				<Example>
					<Feedback
						onSubmit={({ rating, message }) =>
							console.log("feedback", rating, message)
						}
					/>
				</Example>
			</Section>

			<Section
				title="Custom wording"
				description="Every piece of text can be rewritten."
			>
				<Example>
					<Feedback
						label="Tell us"
						heading="How are we doing?"
						placeholder="Describe the issue…"
						submitLabel="Send it"
					/>
				</Example>
			</Section>

			<Section
				title="Worded ratings"
				description="Short words in place of the emoji."
			>
				<Example>
					<Feedback
						ratings={[
							{ value: "bad", label: "Bad" },
							{ value: "ok", label: "Ok" },
							{ value: "good", label: "Good" },
						]}
					/>
				</Example>
			</Section>

			<MetaFooter meta={feedbackMeta} />
		</>
	)
}
