import {
	DotsMenu,
	dotsMenuMeta,
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

export function DotsMenuPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Dots Menu"
				lede={ledeFor(dotsMenuMeta)}
			/>

			<Section
				title="Basic"
				description="A quiet icon button that opens a short list of extra actions."
			>
				<Example>
					<DotsMenu label="Post actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Delete</MenuItem>
					</DotsMenu>
				</Example>
			</Section>

			<Section
				title="With leading icons"
			>
				<Example>
					<DotsMenu label="Edition actions">
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
					</DotsMenu>
				</Example>
			</Section>

			<Section
				title="Alignment"
				description="The menu lines up with the trigger's right edge by default, or its left."
			>
				<Example
					code={`<DotsMenu label="Aligned end">
	<MenuItem>Pin</MenuItem>
	<MenuItem>Mute</MenuItem>
	<MenuSeparator />
	<MenuItem variant="destructive">Block</MenuItem>
</DotsMenu>
<DotsMenu label="Aligned start" align="start">
	<MenuItem>Pin</MenuItem>
	<MenuItem>Mute</MenuItem>
	<MenuSeparator />
	<MenuItem variant="destructive">Block</MenuItem>
</DotsMenu>`}
				>
					<DotsMenu label="Aligned end">
						<MenuItem>Pin</MenuItem>
						<MenuItem>Mute</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Block</MenuItem>
					</DotsMenu>
					<DotsMenu label="Aligned start" align="start">
						<MenuItem>Pin</MenuItem>
						<MenuItem>Mute</MenuItem>
						<MenuSeparator />
						<MenuItem variant="destructive">Block</MenuItem>
					</DotsMenu>
				</Example>
			</Section>

			<Section
				title="Sizes"
				description="Step the trigger down in a list row or a dense toolbar so it doesn't set the row height."
			>
				<Example
					code={`<DotsMenu size="icon" label="Header actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</DotsMenu>
<DotsMenu size="icon-sm" label="Row actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</DotsMenu>
<DotsMenu size="icon-xs" label="Toolbar actions">
	<MenuItem>Edit</MenuItem>
	<MenuItem>Share</MenuItem>
</DotsMenu>`}
				>
					<DotsMenu size="icon" label="Header actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</DotsMenu>
					<DotsMenu size="icon-sm" label="Row actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</DotsMenu>
					<DotsMenu size="icon-xs" label="Toolbar actions">
						<MenuItem>Edit</MenuItem>
						<MenuItem>Share</MenuItem>
					</DotsMenu>
				</Example>
			</Section>

			<MetaFooter meta={dotsMenuMeta} />
		</>
	)
}
