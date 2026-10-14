import { Row, Separator, separatorMeta } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function SeparatorPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Separator"
				lede={ledeFor(separatorMeta)}
			/>

			<ComponentPlayground meta={separatorMeta} />

			<Section
				title="Horizontal"
				description="A full-width rule between stacked content."
			>
				<Example code="<Separator />">
					<div className="w-full max-w-sm">
						<p className="text-body-md mb-3">Standard post</p>
						<Separator />
						<p className="text-body-md mt-3 text-muted-foreground">
							Shared with your team, open to comments.
						</p>
					</div>
				</Example>
			</Section>

			<Section
				title="Vertical"
				description="Between items in a row."
			>
				<Example code='<Separator orientation="vertical" />'>
					<Row gap={3} className="h-6 items-center">
						<span className="text-label-md">Edit</span>
						<Separator orientation="vertical" />
						<span className="text-label-md">Share</span>
						<Separator orientation="vertical" />
						<span className="text-label-md text-muted-foreground">Delete</span>
					</Row>
				</Example>
			</Section>

			<Section
				title="With a label"
				description="A short caption that names the section below it."
			>
				<Example code='<Separator label="Other holdings" />'>
					<div className="w-full max-w-sm">
						<p className="text-body-md mb-3">Genesis series #12</p>
						<Separator label="Other holdings" />
						<p className="text-body-md mt-3 text-muted-foreground">
							Night studies #4
						</p>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={separatorMeta} />
		</>
	)
}
