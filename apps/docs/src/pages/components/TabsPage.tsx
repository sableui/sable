import { Tabs, TabsList, TabsPanel, TabsTrigger, tabsMeta } from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function TabsPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Tabs" lede={ledeFor(tabsMeta)} />

			<Section
				title="Basic"
				description="Underlined tabs switch between sections of a page."
			>
				<Example>
					<Tabs defaultValue="overview" className="w-full max-w-md">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="activity">Activity</TabsTrigger>
							<TabsTrigger value="holders">Holders</TabsTrigger>
						</TabsList>
						<TabsPanel value="overview">
							<p className="text-body-md text-muted-foreground">
								A limited run of 100, stored permanently on Arweave.
							</p>
						</TabsPanel>
						<TabsPanel value="activity">
							<p className="text-body-md text-muted-foreground">
								Recent mints, transfers, and sales appear here.
							</p>
						</TabsPanel>
						<TabsPanel value="holders">
							<p className="text-body-md text-muted-foreground">
								Every wallet that currently holds an edition.
							</p>
						</TabsPanel>
					</Tabs>
				</Example>
			</Section>

			<Section
				title="Pill"
				description="A compact switcher for inside a card or toolbar."
			>
				<Example>
					<Tabs defaultValue="preview" className="w-full max-w-md">
						<TabsList variant="pill">
							<TabsTrigger value="preview">Preview</TabsTrigger>
							<TabsTrigger value="code">Code</TabsTrigger>
						</TabsList>
						<TabsPanel value="preview">
							<p className="text-body-md text-muted-foreground">
								The rendered example.
							</p>
						</TabsPanel>
						<TabsPanel value="code">
							<p className="text-body-md text-muted-foreground">
								The source behind it.
							</p>
						</TabsPanel>
					</Tabs>
				</Example>
			</Section>

			<Section title="With a disabled tab">
				<Example>
					<Tabs defaultValue="overview" className="w-full max-w-md">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="comments">Comments</TabsTrigger>
							<TabsTrigger value="offers" disabled>
								Offers
							</TabsTrigger>
						</TabsList>
						<TabsPanel value="overview">
							<p className="text-body-md text-muted-foreground">
								Offers are disabled until the mint window opens.
							</p>
						</TabsPanel>
						<TabsPanel value="comments">
							<p className="text-body-md text-muted-foreground">
								Be the first to comment on this drop.
							</p>
						</TabsPanel>
					</Tabs>
				</Example>
			</Section>

			<MetaFooter meta={tabsMeta} />
		</>
	)
}
