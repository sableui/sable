import {
	OverflowMenu,
	overflowMenuMeta,
	Icon,
	MenuItem,
	MenuSeparator,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

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

			<MetaFooter meta={overflowMenuMeta} />
		</>
	)
}
