import { Button, Icon, NotificationBadge, notificationBadgeMeta, Row } from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function NotificationBadgePage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Notification Badge"
				lede={ledeFor(notificationBadgeMeta)}
			/>

			<ComponentPlayground meta={notificationBadgeMeta} />

			<Section
				title="Dot"
				description="Something new, no number."
			>
				<Example>
					<NotificationBadge dot />
				</Example>
			</Section>

			<Section
				title="Counts"
				description='Large counts cap at "99+".'
			>
				<Example>
					<NotificationBadge count={3} />
					<NotificationBadge count={42} />
					<NotificationBadge count={128} />
				</Example>
			</Section>

			<Section
				title="Overlay"
				description="Pinned to the corner of the control it belongs to."
			>
				<Example
					code={`<Button variant="secondary" size="icon" aria-label="Notifications, 5 unread" className="relative">
	<Icon name="bell" />
	<NotificationBadge count={5} overlay />
</Button>
<Button variant="secondary" size="icon" aria-label="Notifications, new activity" className="relative">
	<Icon name="bell" />
	<NotificationBadge dot overlay />
</Button>`}
				>
					<Button
						variant="secondary"
						size="icon"
						aria-label="Notifications, 5 unread"
						className="relative"
					>
						<Icon name="bell" />
						<NotificationBadge count={5} overlay />
					</Button>
					<Button
						variant="secondary"
						size="icon"
						aria-label="Notifications, new activity"
						className="relative"
					>
						<Icon name="bell" />
						<NotificationBadge dot overlay />
					</Button>
				</Example>
			</Section>

			<Section
				title="Empty"
				description="At zero, nothing shows."
			>
				<Example>
					<Row gap={2} className="text-body-sm text-muted-foreground">
						<NotificationBadge count={0} />
						<span>(nothing rendered)</span>
					</Row>
				</Example>
			</Section>

			<MetaFooter meta={notificationBadgeMeta} />
		</>
	)
}
