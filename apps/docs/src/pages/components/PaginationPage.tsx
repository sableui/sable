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
	const [linkedPage, setLinkedPage] = useState(1)

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

			<Section
				title="Page links"
				description="When the page lives in the URL, pageLink makes every control a real link: crawlable, and it opens in a new tab. Pass a router's Link the same way. The arrows at the ends stay disabled buttons."
			>
				<Example
					code={`<Pagination
	page={page}
	total={12}
	pageLink={(page) => <Link to={\`/search?q=chairs&page=\${page}\`} />}
/>`}
				>
					<Pagination
						label="Search result pages"
						page={linkedPage}
						total={12}
						// The demo keeps its own state and links to a fragment, so
						// following a page link here does not leave the docs.
						pageLink={(page) => <a href={`#results-page-${page}`} />}
						onPageChange={setLinkedPage}
					/>
				</Example>
			</Section>

			<MetaFooter meta={paginationMeta} />
		</>
	)
}
