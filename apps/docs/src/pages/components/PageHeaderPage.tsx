import {
	Button,
	Icon,
	PageHeader as SablePageHeader,
	SectionHeader,
	pageHeaderMeta,
} from "@sableui/react"
import { hrefFor } from "../../lib/router"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function PageHeaderPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Page Header"
				lede={ledeFor(pageHeaderMeta)}
			/>

			<Section
				title="With actions"
				description="Title, a short description and the page's actions. These examples use titleAs=&quot;h2&quot; because this page already has its h1; in an app, keep the default."
			>
				<Example
					className="!block"
					code={`<PageHeader
	titleAs="h2"
	title="Storage credits"
	description="Fund permanent storage for your posts."
	actions={<Button>Top up</Button>}
/>`}
				>
					<SablePageHeader
						titleAs="h2"
						title="Storage credits"
						description="Fund permanent storage for your posts."
						actions={<Button>Top up</Button>}
					/>
				</Example>
			</Section>

			<Section
				title="With a back button"
				description="For pages you drill into. Keep the back button quiet."
			>
				<Example
					className="!block"
					code={`<PageHeader
	titleAs="h2"
	back={
		<Button size="icon" variant="ghost" aria-label="Back">
			<Icon name="chevron-left" />
		</Button>
	}
	title="Edition details"
	description="Untitled (gold rush) — limited run of 100."
	actions={<Button variant="outline">Share</Button>}
/>`}
				>
					<SablePageHeader
						titleAs="h2"
						back={
							<Button size="icon" variant="ghost" aria-label="Back">
								<Icon name="chevron-left" />
							</Button>
						}
						title="Edition details"
						description="Untitled (gold rush) — limited run of 100."
						actions={<Button variant="outline">Share</Button>}
					/>
				</Example>
			</Section>

			<Section
				title="Sections below the title"
				description="PageHeader is the route's one h1. Each section under it takes a Section Header: an h2 on a smaller tier, with the same title row, description and actions."
			>
				<Example
					className="!block"
					code={`<Page as="main" max="content">
	<PageHeader title="Library" actions={<Button>Import</Button>} />
	<section aria-labelledby="recent" className="flex flex-col gap-4">
		<SectionHeader
			titleId="recent"
			title="Recently played"
			actions={<Button variant="ghost" size="sm">View all</Button>}
		/>
		…
	</section>
</Page>`}
				>
					<div className="flex flex-col gap-4">
						<SablePageHeader titleAs="h2" title="Library" actions={<Button>Import</Button>} />
						<SectionHeader
							titleAs="h3"
							title="Recently played"
							actions={
								<Button variant="ghost" size="sm" render={<a href={hrefFor("section-header")} />}>
									View all
								</Button>
							}
						/>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={pageHeaderMeta} />
		</>
	)
}
