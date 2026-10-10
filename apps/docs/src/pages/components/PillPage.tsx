import { Pill, pillMeta, Row } from "@sableui/react"
import { useState } from "react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

const FILTERS = ["All", "Editions", "Collectibles", "Standard"]

export function PillPage() {
	const [selected, setSelected] = useState("All")

	return (
		<>
			<PageHeader eyebrow="Components" title="Pill" lede={ledeFor(pillMeta)} />

			<ComponentPlayground meta={pillMeta} />

			<Section
				title="Filters"
				description="A row of choices. The chosen one fills in. For a label that only describes something, use Badge."
			>
				<Example>
					<Row gap={1}>
						{FILTERS.map((filter) => (
							<Pill
								key={filter}
								selected={selected === filter}
								onClick={() => setSelected(filter)}
							>
								{filter}
							</Pill>
						))}
					</Row>
				</Example>
			</Section>

			<MetaFooter meta={pillMeta} />
		</>
	)
}
