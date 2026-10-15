import {
	Button,
	OverflowMenu,
	overflowMenuMeta,
	Icon,
	MenuItem,
	MenuSeparator,
	Row,
	Stack,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

/**
 * Secondary actions inline when the container is wide, in an OverflowMenu
 * when it is narrow; the primary action stays inline at every width. Both
 * copies are rendered and one is display:none, which also takes it out of the
 * accessibility tree, so only one set is ever announced.
 */
function ReportActions() {
	return (
		<div className="@container/actions flex w-full justify-end">
			<Row gap={1} align="center">
				{/* Row sets its display inline, so a wrapper does the hiding. */}
				<div className="hidden @md/actions:block">
					<Row gap={1}>
						<Button variant="ghost" size="sm" iconStart={<Icon name="share" />}>
							Share
						</Button>
						<Button variant="ghost" size="sm" iconStart={<Icon name="download" />}>
							Export
						</Button>
					</Row>
				</div>
				<div className="@md/actions:hidden">
					<OverflowMenu label="Report actions" size="icon-sm">
						<MenuItem icon={<Icon name="share" />}>Share</MenuItem>
						<MenuItem icon={<Icon name="download" />}>Export</MenuItem>
					</OverflowMenu>
				</div>
				<Button size="sm" iconStart={<Icon name="edit" />}>
					Edit report
				</Button>
			</Row>
		</div>
	)
}

export function OverflowMenuPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Overflow Menu"
				lede={ledeFor(overflowMenuMeta)}
			/>

			<Section
				title="Basic"
				description="A quiet icon button that opens a short list of extra actions."
			>
				<Example>
					<OverflowMenu label="Post actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Delete</MenuItem>
					</OverflowMenu>
				</Example>
			</Section>

			<Section
				title="With leading icons"
			>
				<Example>
					<OverflowMenu label="Project actions">
						<MenuItem>
							<Icon name="check" className="text-sm" />
							Mark as read
						</MenuItem>
						<MenuItem>
							<Icon name="arrow-right" className="text-sm" />
							Move to&hellip;
						</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">
							<Icon name="xmark" className="text-sm" />
							Delete
						</MenuItem>
					</OverflowMenu>
				</Example>
			</Section>

			<Section
				title="Alignment"
				description="The menu lines up with the trigger's right edge by default, or its left."
			>
				<Example
					code={`<OverflowMenu label="Aligned end">
	<MenuItem>Pin</MenuItem>
	<MenuItem>Mute</MenuItem>
	<MenuSeparator />
	<MenuItem variant="destructive">Block</MenuItem>
</OverflowMenu>
<OverflowMenu label="Aligned start" align="start">
	<MenuItem>Pin</MenuItem>
	<MenuItem>Mute</MenuItem>
	<MenuSeparator />
	<MenuItem variant="destructive">Block</MenuItem>
</OverflowMenu>`}
				>
					<OverflowMenu label="Aligned end">
						<MenuItem>Pin</MenuItem>
						<MenuItem>Mute</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Block</MenuItem>
					</OverflowMenu>
					<OverflowMenu label="Aligned start" align="start">
						<MenuItem>Pin</MenuItem>
						<MenuItem>Mute</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Block</MenuItem>
					</OverflowMenu>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Step the trigger down in a list row or a dense toolbar so it doesn't set the row height."
			>
				<Example
					code={`<OverflowMenu size="icon" label="Header actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</OverflowMenu>
<OverflowMenu size="icon-sm" label="Row actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</OverflowMenu>
<OverflowMenu size="icon-xs" label="Toolbar actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</OverflowMenu>`}
				>
					<OverflowMenu size="icon" label="Header actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</OverflowMenu>
					<OverflowMenu size="icon-sm" label="Row actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</OverflowMenu>
					<OverflowMenu size="icon-xs" label="Toolbar actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</OverflowMenu>
				</Example>
			</Section>

			<Section
				title="Responsive actions"
				description="Secondary actions sit inline while there is room and fold into the menu when there is not. A container query decides, so it follows the space the actions have, not the window. The primary action never folds."
			>
				<Example
					code={'<div className="@container/actions flex w-full justify-end">\n\t<Row gap={1} align="center">\n\t\t<div className="hidden @md/actions:block">\n\t\t\t<Row gap={1}>\n\t\t\t\t<Button variant="ghost" size="sm" iconStart={<Icon name="share" />}>Share</Button>\n\t\t\t\t<Button variant="ghost" size="sm" iconStart={<Icon name="download" />}>Export</Button>\n\t\t\t</Row>\n\t\t</div>\n\t\t<div className="@md/actions:hidden">\n\t\t\t<OverflowMenu label="Report actions" size="icon-sm">\n\t\t\t\t<MenuItem icon={<Icon name="share" />}>Share</MenuItem>\n\t\t\t\t<MenuItem icon={<Icon name="download" />}>Export</MenuItem>\n\t\t\t</OverflowMenu>\n\t\t</div>\n\t\t<Button size="sm" iconStart={<Icon name="edit" />}>Edit report</Button>\n\t</Row>\n</div>'}
				>
					<Stack gap={6} className="w-full">
						<ReportActions />
						<div className="w-full max-w-64 self-end">
							<ReportActions />
						</div>
					</Stack>
				</Example>
			</Section>

			<MetaFooter meta={overflowMenuMeta} />
		</>
	)
}
