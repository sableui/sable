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
							<TabsTrigger value="members">Members</TabsTrigger>
						</TabsList>
						<TabsPanel value="overview">
							<p className="text-body-md text-muted-foreground">
								A shared project for the Q3 launch, due in October.
							</p>
						</TabsPanel>
						<TabsPanel value="activity">
							<p className="text-body-md text-muted-foreground">
								Recent edits, comments, and uploads appear here.
							</p>
						</TabsPanel>
						<TabsPanel value="members">
							<p className="text-body-md text-muted-foreground">
								Everyone who can view or edit this project.
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

			<Section
				title="Subtle motion"
				description="The indicator glides to the chosen tab in both styles. In a dense view where every tab change is frequent, motion=&quot;subtle&quot; lands it in place and keeps the hover and panel fade."
			>
				<Example>
					<Tabs defaultValue="table" motion="subtle" className="w-full max-w-md">
						<TabsList variant="pill">
							<TabsTrigger value="table">Table</TabsTrigger>
							<TabsTrigger value="chart">Chart</TabsTrigger>
							<TabsTrigger value="summary">Summary</TabsTrigger>
						</TabsList>
						<TabsPanel value="table">
							<p className="text-body-md text-muted-foreground">
								Every order this week, one per row.
							</p>
						</TabsPanel>
						<TabsPanel value="chart">
							<p className="text-body-md text-muted-foreground">
								Orders per day, against last week.
							</p>
						</TabsPanel>
						<TabsPanel value="summary">
							<p className="text-body-md text-muted-foreground">
								Totals and the change since Monday.
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
							<TabsTrigger value="billing" disabled>
								Billing
							</TabsTrigger>
						</TabsList>
						<TabsPanel value="overview">
							<p className="text-body-md text-muted-foreground">
								Billing is disabled until an admin turns it on.
							</p>
						</TabsPanel>
						<TabsPanel value="comments">
							<p className="text-body-md text-muted-foreground">
								Be the first to comment on this project.
							</p>
						</TabsPanel>
					</Tabs>
				</Example>
			</Section>

			<MetaFooter meta={tabsMeta} />
		</>
	)
}
