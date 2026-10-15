import {
	Button,
	ButtonGroup,
	Icon,
	Menu,
	MenuContent,
	MenuItem,
	MenuLinkItem,
	MenuTrigger,
	buttonGroupMeta,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ButtonGroupPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Button Group" lede={ledeFor(buttonGroupMeta)} />

			<ComponentPlayground meta={buttonGroupMeta} />

			<Section
				title="Split button"
				description="The main action, then a chevron that opens the alternatives. This page's own Copy page control is one."
			>
				<Example
					code={
						'<ButtonGroup aria-label="Page actions">\n\t<Button variant="outline" size="sm" iconStart={<Icon name="copy" />}>Copy page</Button>\n\t<Menu>\n\t\t<MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}>\n\t\t\t<Icon name="chevron-down" />\n\t\t</MenuTrigger>\n\t\t<MenuContent align="end">\n\t\t\t<MenuItem icon={<Icon name="copy" />} description="Copy page as Markdown for LLMs">Copy page</MenuItem>\n\t\t\t<MenuLinkItem icon={<Icon name="file" />} description="View this page as plain text" href="/llms.txt" target="_blank">View as Markdown</MenuLinkItem>\n\t\t</MenuContent>\n\t</Menu>\n</ButtonGroup>'
					}
				>
					<ButtonGroup aria-label="Page actions">
						<Button variant="outline" size="sm" iconStart={<Icon name="copy" />}>
							Copy page
						</Button>
						<Menu>
							<MenuTrigger render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}>
								<Icon name="chevron-down" />
							</MenuTrigger>
							<MenuContent align="end" className="w-72">
								<MenuItem icon={<Icon name="copy" />} description="Copy page as Markdown for LLMs">
									Copy page
								</MenuItem>
								<MenuLinkItem icon={<Icon name="file" />} description="View this page as plain text" href="/llms.txt" target="_blank">
									View as Markdown
								</MenuLinkItem>
							</MenuContent>
						</Menu>
					</ButtonGroup>
				</Example>
			</Section>

			<Section
				title="Filled"
				description="Filled and ghost buttons meet at a hairline in their own ink, so the seam reads on any fill."
			>
				<Example
					code={
						'<ButtonGroup aria-label="Zoom">\n\t<Button variant="secondary" size="icon-sm" aria-label="Zoom out"><Icon name="minus" /></Button>\n\t<Button variant="secondary" size="sm">100%</Button>\n\t<Button variant="secondary" size="icon-sm" aria-label="Zoom in"><Icon name="plus" /></Button>\n</ButtonGroup>'
					}
				>
					<ButtonGroup aria-label="Zoom">
						<Button variant="secondary" size="icon-sm" aria-label="Zoom out">
							<Icon name="minus" />
						</Button>
						<Button variant="secondary" size="sm">
							100%
						</Button>
						<Button variant="secondary" size="icon-sm" aria-label="Zoom in">
							<Icon name="plus" />
						</Button>
					</ButtonGroup>
					<ButtonGroup aria-label="Publish">
						<Button size="sm">Publish</Button>
						<Button size="icon-sm" aria-label="Publish options">
							<Icon name="chevron-down" />
						</Button>
					</ButtonGroup>
				</Example>
			</Section>

			<MetaFooter meta={buttonGroupMeta} />
		</>
	)
}
