import {
	Button,
	Icon,
	PageHeader as SablePageHeader,
	pageHeaderMeta,
} from "@sableui/react"
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

			<MetaFooter meta={pageHeaderMeta} />
		</>
	)
}
