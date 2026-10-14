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
							className="group/collapsible"
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
							className="group/collapsible"
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

			<MetaFooter meta={collapsibleMeta} />
		</>
	)
}
