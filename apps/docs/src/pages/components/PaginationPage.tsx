import { Pagination, paginationMeta } from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function PaginationPage() {
	const [smallPage, setSmallPage] = useState(1)
	const [largePage, setLargePage] = useState(8)

	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Pagination"
				lede={ledeFor(paginationMeta)}
			/>

			<Section
				title="Few pages"
				description="Every number fits. The arrows dim at the first and last page."
			>
				<Example
					code={`const [page, setPage] = useState(1)
<Pagination page={page} total={5} onPageChange={setPage} />`}
				>
					<Pagination
						page={smallPage}
						total={5}
						onPageChange={setSmallPage}
					/>
				</Example>
			</Section>

			<Section
				title="Many pages"
				description="Skipped pages collapse into an ellipsis around the current one."
			>
				<Example
					code={`const [page, setPage] = useState(8)
<Pagination page={page} total={20} onPageChange={setPage} />`}
				>
					<Pagination
						page={largePage}
						total={20}
						onPageChange={setLargePage}
					/>
				</Example>
			</Section>

			<MetaFooter meta={paginationMeta} />
		</>
	)
}
