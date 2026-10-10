import { appShellMeta, Button, Icon } from "@sableui/react"
import {
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function AppShellPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="App Shell"
				lede={ledeFor(appShellMeta)}
			/>

			<Section
				title="Live preview"
				description="A sidebar and a wide content area: the standard desktop frame."
			>
				<div className="overflow-hidden rounded-lg border border-border bg-background">
					<iframe
						src="/preview/dashboard-page"
						title="DashboardPage preview"
						loading="lazy"
						className="aspect-video w-full"
					/>
				</div>
				<div className="mt-3 flex justify-end">
					<Button
						variant="outline"
						size="sm"
						render={<a href="/patterns" />}
					>
						<Icon name="layout" />
						See all page shells
					</Button>
				</div>
			</Section>

			<MetaFooter meta={appShellMeta} />
		</>
	)
}
