import { appShellMeta, Button, Icon } from "@sableui/react"
import {
	InlineCode,
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

			<Section
				title="SkipLink without AppShell"
				description="AppShell renders a skip link to #main-content. A layout of your own, such as a storefront with a top header, takes the same link from SkipLink."
			>
				<p className="max-w-(--measure-prose) text-body-md text-muted-foreground">
					Put <InlineCode>{"<SkipLink />"}</InlineCode> first in the body and give your{" "}
					<InlineCode>{"<main>"}</InlineCode> <InlineCode>id="main-content"</InlineCode> and{" "}
					<InlineCode>{"tabIndex={-1}"}</InlineCode>. It stays hidden until it is focused.
				</p>
			</Section>

			<MetaFooter meta={appShellMeta} />
		</>
	)
}
