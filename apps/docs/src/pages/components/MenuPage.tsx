import {
	Button,
	Icon,
	Kbd,
	KbdGroup,
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

			<Section
				title="Keyboard shortcuts"
				description="A command's key sits at the end of its row, muted and aligned with the others, so the menu teaches it. Text or ghost Kbd caps; the shortcut is a label, so bind the key yourself."
			>
				<Example
					code={
						'<Menu>\n\t<MenuTrigger render={<Button variant="secondary">Edit</Button>} />\n\t<MenuContent>\n\t\t<MenuItem shortcut="Ctrl Z">Undo</MenuItem>\n\t\t<MenuItem shortcut="Ctrl Shift Z">Redo</MenuItem>\n\t\t<MenuSeparator />\n\t\t<MenuItem shortcut={<KbdGroup><Kbd variant="ghost" mod /><Kbd variant="ghost">D</Kbd></KbdGroup>}>Duplicate</MenuItem>\n\t</MenuContent>\n</Menu>'
					}
				>
					<Menu>
						<MenuTrigger render={<Button variant="secondary">Edit</Button>} />
						<MenuContent>
							<MenuItem shortcut="Ctrl Z">Undo</MenuItem>
							<MenuItem shortcut="Ctrl Shift Z">Redo</MenuItem>
							<MenuSeparator />
							<MenuItem
								shortcut={
									<KbdGroup>
										<Kbd variant="ghost" mod />
										<Kbd variant="ghost">D</Kbd>
									</KbdGroup>
								}
							>
								Duplicate
							</MenuItem>
						</MenuContent>
					</Menu>
				</Example>
			</Section>

			<MetaFooter meta={menuMeta} />
		</>
	)
}
