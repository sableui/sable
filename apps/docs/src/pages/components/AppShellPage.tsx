import { appShellMeta, Button, Grid, Icon } from "@sableui/react"
import { PreviewCard } from "../../components/PreviewCard"
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
				title="Inset frame"
				description="The inset frame paints the rail's surface as the ground and raises main as a rounded panel that scrolls inside itself, for dense product apps. Below lg both frames are the same mobile layout. Open either to scroll it full size."
			>
				<Grid cols={{ base: 1, sm: 2 }} gap={[5, 3]}>
					<PreviewCard
						href="/preview/dashboard-page"
						title="Flush"
						caption="The default: main sits on the page and the window scrolls"
					/>
					<PreviewCard
						href="/preview/app-shell-inset"
						title="Inset"
						caption="The rail is the ground; main is a raised panel with its own scroll"
					/>
				</Grid>
				<p className="mt-4 max-w-(--measure-prose) text-body-md text-muted-foreground">
					Inset moves the desktop page scroll from the window to{" "}
					<InlineCode>{'<main id="main-content">'}</InlineCode>, so scroll listeners and scroll restoration
					should target that element. Keep the Sidebar on <InlineCode>surface="rail"</InlineCode>: it
					drops its border inside an inset shell, since the gap around the panel is the divider.
				</p>
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
