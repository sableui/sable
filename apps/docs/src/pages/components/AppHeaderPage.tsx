import {
	AppHeader,
	appHeaderMeta,
	Avatar,
	Button,
	Icon,
	NotificationBadge,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** AppHeader is sticky + hidden at lg; pin it static and visible for the demo. */
const DEMO_OVERRIDES = "!static lg:!block"

export function AppHeaderPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="App Header"
				lede={ledeFor(appHeaderMeta)}
			/>

			<Section
				title="Contextual header"
				description="Back button on the left, title centered, actions on the right."
			>
				<Example className="!block">
					<div className="overflow-hidden rounded-lg border border-border">
						<AppHeader
							className={DEMO_OVERRIDES}
							leading={
								<Button size="icon" variant="ghost" aria-label="Back">
									<Icon name="chevron-left" />
								</Button>
							}
							title="Notifications"
							actions={
								<Button size="icon" variant="ghost" aria-label="Settings">
									<Icon name="gear" />
								</Button>
							}
						/>
						<div className="p-4 text-body-sm text-muted-foreground">
							Screen content scrolls beneath the sticky header.
						</div>
					</div>
				</Example>
			</Section>

			<Section
				title="Brand header"
				description="Brand wordmark with account actions, for top-level screens."
			>
				<Example className="!block">
					<div className="overflow-hidden rounded-lg border border-border">
						<AppHeader
							className={DEMO_OVERRIDES}
							title="Studio"
							actions={
								<>
									<Button
										size="icon"
										variant="ghost"
										aria-label="Notifications"
										badge={<NotificationBadge dot />}
									>
										<Icon name="bell" />
									</Button>
									<Avatar fallback="AM" alt="Alex Morgan" size="sm" />
								</>
							}
						/>
						<div className="p-4 text-body-sm text-muted-foreground">
							The title column stays centered regardless of side content.
						</div>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={appHeaderMeta} />
		</>
	)
}
