import { Note, noteMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function NotePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Note" lede={ledeFor(noteMeta)} />

			<ComponentPlayground meta={noteMeta} />

			<Section
				title="Tones"
				description="Each tone pairs its color with a matching icon, so color is never the only signal."
			>
				<Example className="flex-col items-stretch">
					<Note tone="info">
						Reports refresh every hour from your connected sources.
					</Note>
					<Note tone="warning">
						Your credit balance is low. Top up before exporting.
					</Note>
					<Note tone="success">Payment confirmed and the receipt is in your inbox.</Note>
					<Note tone="destructive">
						The payment was declined and was not submitted again.
					</Note>
					<Note tone="neutral">
						Drafts are saved locally until you publish them.
					</Note>
				</Example>
			</Section>

			<Section
				title="With title"
				description="A bold lead-in above the message."
			>
				<Example className="flex-col items-stretch">
					<Note tone="warning" title="Low balance">
						Add credits to cover the export, or switch to a paid plan.
					</Note>
					<Note tone="success" title="Published">
						Your report is live and viewable by anyone with the link.
					</Note>
				</Example>
			</Section>

			<Section
				title="With an action"
				description="One quiet remedy when the reader can fix the problem."
			>
				<Example
					className="flex-col items-stretch"
					code='<Note tone="warning" action={{ label: "Unload chat model", onClick: unloadChatModel }}>gemma-4 is holding VRAM — generating now may be slow or fail.</Note>'
				>
					<Note
						tone="warning"
						action={{ label: "Unload chat model", onClick: () => {} }}
					>
						gemma-4 is holding VRAM — generating now may be slow or fail.
					</Note>
					<Note
						tone="info"
						title="Free exports available"
						action={{ label: "Read the docs", href: "/note" }}
					>
						Reports under 100 rows can export without any credits.
					</Note>
					<Note
						tone="destructive"
						action={{ label: "Retry upload", onClick: () => {} }}
					>
						Three files failed to upload and were not retried.
					</Note>
				</Example>
			</Section>

			<MetaFooter meta={noteMeta} />
		</>
	)
}
