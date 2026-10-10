import { Button, Spinner, spinnerMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SpinnerPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Spinner"
				lede={ledeFor(spinnerMeta)}
			/>

			<Section title="Basic">
				<Example code="<Spinner />">
					<Spinner />
				</Example>
			</Section>

			<Section title="Sizes">
				<Example
					code={`<Spinner size="sm" />
<Spinner />
<Spinner size="lg" />`}
				>
					<Spinner size="sm" />
					<Spinner />
					<Spinner size="lg" />
				</Example>
			</Section>

			<Section
				title="Color"
				description="It takes the color of the text around it."
			>
				<Example
					code={`<Spinner size="lg" className="text-foreground" />
<Spinner size="lg" className="text-muted-foreground" />`}
				>
					<Spinner size="lg" className="text-foreground" />
					<Spinner size="lg" className="text-muted-foreground" />
				</Example>
			</Section>

			<Section
				title="In a button"
				description="Button's loading prop shows the spinner, matched to the label color, and disables the button."
			>
				<Example code="<Button loading>Collecting</Button>">
					<Button loading>Collecting</Button>
				</Example>
			</Section>

			<Section title="Dots" description="appearance=&quot;dots&quot;: softer, for chat and inline text. The same size scale as the ring.">
				<Example code={`<Spinner appearance="dots" size="sm" />
<Spinner appearance="dots" />
<Spinner appearance="dots" size="lg" />`}>
					<Spinner appearance="dots" size="sm" />
					<Spinner appearance="dots" />
					<Spinner appearance="dots" size="lg" />
				</Example>
			</Section>

			<MetaFooter meta={spinnerMeta} />
		</>
	)
}
