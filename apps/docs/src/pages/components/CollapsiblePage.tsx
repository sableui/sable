import {
	Button,
	Collapsible,
	collapsibleMeta,
	CollapsibleIndicator,
	CollapsiblePanel,
	CollapsibleTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function CollapsiblePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Collapsible"
				lede={ledeFor(collapsibleMeta)}
			/>

			<Section
				title="Basic"
				description="A trigger shows and hides extra content in place."
			>
				<Example>
					<Collapsible className="w-full max-w-sm">
						<CollapsibleTrigger
							render={
								<Button variant="ghost">
									What happens when I archive?
									<CollapsibleIndicator />
								</Button>
							}
						/>
						<CollapsiblePanel>
							<p className="text-body-md text-muted-foreground pt-3">
								Archived projects stay searchable and can be restored at any
								time, but they stop counting toward your plan's project
								limit.
							</p>
						</CollapsiblePanel>
					</Collapsible>
				</Example>
			</Section>

			<Section
				title="Open by default"
				description="Starts expanded, and the trigger still closes it."
			>
				<Example>
					<Collapsible defaultOpen className="w-full max-w-sm">
						<CollapsibleTrigger
							render={
								<Button variant="ghost">
									Summary
									<CollapsibleIndicator />
								</Button>
							}
						/>
						<CollapsiblePanel>
							<p className="text-body-md text-muted-foreground pt-3">
								Visible on first render. The trigger still toggles it closed.
							</p>
						</CollapsiblePanel>
					</Collapsible>
				</Example>
			</Section>

			<Section
				title="Group header"
				description='direction="end" points the caret to the inline end while closed and turns it down on open: the header of a grouped list, or a tree row. The indicator reads the trigger’s state itself, so there is no class to add.'
			>
				<Example>
					<Collapsible defaultOpen className="w-full max-w-sm">
						<CollapsibleTrigger
							render={
								<Button variant="ghost" size="sm">
									<CollapsibleIndicator direction="end" />
									In progress
									<span className="text-label-sm text-muted-foreground">3</span>
								</Button>
							}
						/>
						<CollapsiblePanel>
							<ul className="sable-list pt-2 text-body-md text-muted-foreground">
								<li>Refine product detail page</li>
								<li>Build the ingredient library</li>
								<li>Resolve keyboard focus order</li>
							</ul>
						</CollapsiblePanel>
					</Collapsible>
				</Example>
			</Section>

			<MetaFooter meta={collapsibleMeta} />
		</>
	)
}
