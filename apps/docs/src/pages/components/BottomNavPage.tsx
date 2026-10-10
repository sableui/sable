import {
	BottomNav,
	BottomNavItem,
	bottomNavMeta,
	Icon,
	NotificationBadge,
	Phone,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/** BottomNav is fixed + hidden at lg; pin it static and visible for the demo. */
const DEMO_OVERRIDES = "!static lg:!block"

export function BottomNavPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Bottom Nav"
				lede={ledeFor(bottomNavMeta)}
			/>

			<Section
				title="Tab bar"
				description="Icon-only tabs for the main sections of a mobile app."
			>
				<Example className="!block">
					<div className="mx-auto max-w-xs">
						<Phone>
							<div className="flex h-full min-h-96 flex-col">
								<div className="flex-1 p-4">
									<h2 className="text-title-lg">Activity</h2>
									<p className="text-body-sm text-muted-foreground">
										3 new collects today.
									</p>
								</div>
								<BottomNav className={DEMO_OVERRIDES}>
									<BottomNavItem icon={<Icon name="home" />} label="Home" active />
									<BottomNavItem icon={<Icon name="search" />} label="Explore" />
									<BottomNavItem
										icon={<Icon name="bell" />}
										label="Notifications"
										badge={<NotificationBadge dot />}
									/>
									<BottomNavItem icon={<Icon name="user" />} label="Profile" />
								</BottomNav>
							</div>
						</Phone>
					</div>
				</Example>
			</Section>

			<Section
				title="With labels"
				description="Add captions when the icons alone aren't obvious."
			>
				<Example className="!block">
					<div className="overflow-hidden rounded-lg border border-border">
						<BottomNav className={DEMO_OVERRIDES}>
							<BottomNavItem icon={<Icon name="home" />} label="Home" showLabel active />
							<BottomNavItem icon={<Icon name="search" />} label="Explore" showLabel />
							<BottomNavItem icon={<Icon name="image-stack" />} label="Library" showLabel />
							<BottomNavItem icon={<Icon name="gear" />} label="Settings" showLabel />
						</BottomNav>
					</div>
				</Example>
			</Section>

			<MetaFooter meta={bottomNavMeta} />
		</>
	)
}
