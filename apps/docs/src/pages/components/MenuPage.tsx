import {
	Button,
	Icon,
	Menu,
	MenuContent,
	MenuGroup,
	MenuGroupLabel,
	MenuItem,
	menuMeta,
	MenuSeparator,
	MenuTrigger,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function MenuPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Menu" lede={ledeFor(menuMeta)} />

			<Section title="Basic">
				<Example>
					<Menu>
						<MenuTrigger
							render={
								<Button variant="secondary">
									Options
									<Icon name="chevron-down" className="text-sm" />
								</Button>
							}
						/>
						<MenuContent>
							<MenuItem>Edit</MenuItem>
							<MenuItem>Duplicate</MenuItem>
							<MenuItem>Share</MenuItem>
							<MenuSeparator />
							<MenuItem variant="destructive">Delete</MenuItem>
						</MenuContent>
					</Menu>
				</Example>
			</Section>

			<Section
				title="Grouped"
				description="A small label heads a set of related items."
			>
				<Example>
					<Menu>
						<MenuTrigger
							render={
								<Button variant="secondary">
									Account
									<Icon name="chevron-down" className="text-sm" />
								</Button>
							}
						/>
						<MenuContent>
							<MenuGroup>
								<MenuGroupLabel>Signed in as ada</MenuGroupLabel>
								<MenuItem>Profile</MenuItem>
								<MenuItem>Settings</MenuItem>
							</MenuGroup>
							<MenuSeparator />
							<MenuItem>Sign out</MenuItem>
						</MenuContent>
					</Menu>
				</Example>
			</Section>

			<Section
				title="Icons and disabled items"
				description="An icon can lead the label. Unavailable items stay visible but dimmed."
			>
				<Example>
					<Menu>
						<MenuTrigger
							render={
								<Button variant="ghost" size="icon" aria-label="More actions">
									<Icon name="ellipsis" className="text-base" />
								</Button>
							}
						/>
						<MenuContent>
							<MenuItem>
								<Icon name="check" className="text-sm" />
								Mark as read
							</MenuItem>
							<MenuItem>
								<Icon name="bell" className="text-sm" />
								Mute notifications
							</MenuItem>
							<MenuSeparator />
							<MenuItem disabled>
								<Icon name="xmark" className="text-sm" />
								Remove (unavailable)
							</MenuItem>
						</MenuContent>
					</Menu>
				</Example>
			</Section>

			<MetaFooter meta={menuMeta} />
		</>
	)
}
