import {
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	Breadcrumbs,
	breadcrumbsMeta,
	BreadcrumbSeparator,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function BreadcrumbsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Breadcrumbs"
				lede={ledeFor(breadcrumbsMeta)}
			/>

			<Section
				title="Three-level trail"
				description="Parent pages are links. The last crumb is the page you are on."
			>
				<Example>
					<Breadcrumbs>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="/library">Library</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Editions</BreadcrumbPage>
						</BreadcrumbItem>
					</Breadcrumbs>
				</Example>
			</Section>

			<Section
				title="Custom separator"
				description="A chevron by default. Any glyph can replace it, like a slash."
			>
				<Example>
					<Breadcrumbs>
						<BreadcrumbItem>
							<BreadcrumbLink href="/">Home</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>/</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbLink href="/account">Account</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>/</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbPage>Settings</BreadcrumbPage>
						</BreadcrumbItem>
					</Breadcrumbs>
				</Example>
			</Section>

			<MetaFooter meta={breadcrumbsMeta} />
		</>
	)
}
