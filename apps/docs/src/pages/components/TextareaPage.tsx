import { Textarea, textareaMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function TextareaPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Textarea"
				lede={ledeFor(textareaMeta)}
			/>

			<ComponentPlayground meta={textareaMeta} />

			<Section title="Default">
				<Example code='<Textarea placeholder="Write a caption…" />'>
					<Textarea
						className="max-w-md"
						placeholder="Write a caption…"
					/>
				</Example>
			</Section>

			<Section
				title="Rows"
				description="Size it to the amount of text you expect."
			>
				<Example code={`<Textarea rows={6} placeholder="Tell your team what this project is for…" />`}>
					<Textarea
						className="max-w-md"
						rows={6}
						placeholder="Tell your team what this project is for…"
					/>
				</Example>
			</Section>

			<Section
				title="States"
				description="Invalid and disabled."
			>
				<Example
					code={`<Textarea aria-invalid defaultValue="This caption is too long for the post." />
<Textarea disabled defaultValue="Notes lock once the invoice is sent." />`}
				>
					<Textarea
						className="max-w-md"
						aria-invalid
						defaultValue="This caption is too long for the post."
					/>
					<Textarea
						className="max-w-md"
						disabled
						defaultValue="Notes lock once the invoice is sent."
					/>
				</Example>
			</Section>

			<MetaFooter meta={textareaMeta} />
		</>
	)
}
