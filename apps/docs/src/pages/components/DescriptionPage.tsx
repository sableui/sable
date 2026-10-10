import {
	Description,
	DescriptionItem,
	descriptionMeta,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function DescriptionPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Description"
				lede={ledeFor(descriptionMeta)}
			/>

			<Section
				title="Metadata list"
				description="Labels on the left, values on the right."
			>
				<Example className="block">
					<Description>
						<DescriptionItem term="Network" detail="Solana" />
						<DescriptionItem term="Supply" detail="100" />
						<DescriptionItem term="Royalty" detail="5%" />
					</Description>
				</Example>
			</Section>

			<Section
				title="Two-column"
				description="Two pairs per row. Drops to one column when the space it sits in is narrow, whatever the screen size."
			>
				<Example className="block">
					<Description cols="2">
						<DescriptionItem term="Network" detail="Solana" />
						<DescriptionItem term="Supply" detail="100" />
						<DescriptionItem term="Royalty" detail="5%" />
						<DescriptionItem term="Standard" detail="Core" />
					</Description>
				</Example>
			</Section>

			<MetaFooter meta={descriptionMeta} />
		</>
	)
}
