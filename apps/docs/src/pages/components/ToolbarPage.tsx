import {
	Density,
	Icon,
	Menu,
	MenuContent,
	MenuItem,
	MenuTrigger,
	Toggle,
	ToggleGroup,
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarInput,
	ToolbarLink,
	ToolbarSeparator,
	toolbarMeta,
} from "@sableui/react"
import {
	ComponentPlayground,
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ToolbarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Toolbar" lede={ledeFor(toolbarMeta)} />

			<ComponentPlayground meta={toolbarMeta} />

			<Section
				title="Formatting bar"
				description="One tab stop for the whole row. Arrow keys move between the buttons, and separators split it into groups."
			>
				<Example
					code={`<Toolbar aria-label="Text formatting">
	<ToolbarGroup aria-label="History">
		<ToolbarButton size="icon-sm" aria-label="Undo">
			<Icon name="arrow-left" />
		</ToolbarButton>
		<ToolbarButton size="icon-sm" aria-label="Redo">
			<Icon name="arrow-right" />
		</ToolbarButton>
	</ToolbarGroup>
	<ToolbarSeparator />
	<ToggleGroup multiple aria-label="Style" defaultValue={["bold"]}>
		<ToolbarButton size="icon-sm" aria-label="Bold" render={<Toggle value="bold" />}>
			<Icon name="bold" />
		</ToolbarButton>
		<ToolbarButton size="icon-sm" aria-label="Italic" render={<Toggle value="italic" />}>
			<Icon name="italic" />
		</ToolbarButton>
	</ToggleGroup>
	<ToolbarSeparator />
	<ToolbarButton size="icon-sm" aria-label="Insert link">
		<Icon name="link" />
	</ToolbarButton>
	<ToolbarLink href="#help">Help</ToolbarLink>
</Toolbar>`}
				>
					<Toolbar aria-label="Text formatting">
						<ToolbarGroup aria-label="History">
							<ToolbarButton size="icon-sm" aria-label="Undo">
								<Icon name="arrow-left" />
							</ToolbarButton>
							<ToolbarButton size="icon-sm" aria-label="Redo">
								<Icon name="arrow-right" />
							</ToolbarButton>
						</ToolbarGroup>
						<ToolbarSeparator />
						<ToggleGroup multiple aria-label="Style" defaultValue={["bold"]}>
							<ToolbarButton
								size="icon-sm"
								aria-label="Bold"
								render={<Toggle value="bold" />}
							>
								<Icon name="bold" />
							</ToolbarButton>
							<ToolbarButton
								size="icon-sm"
								aria-label="Italic"
								render={<Toggle value="italic" />}
							>
								<Icon name="italic" />
							</ToolbarButton>
						</ToggleGroup>
						<ToolbarSeparator />
						<ToolbarButton size="icon-sm" aria-label="Insert link">
							<Icon name="link" />
						</ToolbarButton>
						<ToolbarLink href="#help">Help</ToolbarLink>
					</Toolbar>
				</Example>
			</Section>

			<Section
				title="Menus and fields"
				description="Menu triggers and a search field join the same arrow-key order. A disabled button stays reachable, so the row keeps its shape."
			>
				<Example
					code={`<Toolbar aria-label="Table">
	<Menu>
		<ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>
		<MenuContent>
			<MenuItem>Compact rows</MenuItem>
			<MenuItem>Comfortable rows</MenuItem>
		</MenuContent>
	</Menu>
	<ToolbarButton disabled>Export</ToolbarButton>
	<ToolbarSeparator />
	<ToolbarInput aria-label="Search rows" placeholder="Search" />
</Toolbar>`}
				>
					<Toolbar aria-label="Table">
						<Menu>
							<ToolbarButton render={<MenuTrigger />}>View</ToolbarButton>
							<MenuContent>
								<MenuItem>Compact rows</MenuItem>
								<MenuItem>Comfortable rows</MenuItem>
							</MenuContent>
						</Menu>
						<ToolbarButton disabled>Export</ToolbarButton>
						<ToolbarSeparator />
						<ToolbarInput aria-label="Search rows" placeholder="Search" />
					</Toolbar>
				</Example>
			</Section>

			<Section
				title="Vertical"
				description="A tool rail. Up and down move between tools, and the separator turns to match."
			>
				<Example
					code={`<Toolbar orientation="vertical" aria-label="Tools">
	<ToolbarButton size="icon-sm" aria-label="Select">
		<Icon name="arrow-up" />
	</ToolbarButton>
	<ToolbarButton size="icon-sm" aria-label="Draw">
		<Icon name="edit" />
	</ToolbarButton>
	<ToolbarSeparator />
	<ToolbarButton size="icon-sm" aria-label="Delete">
		<Icon name="trash" />
	</ToolbarButton>
</Toolbar>`}
				>
					<Toolbar orientation="vertical" aria-label="Tools">
						<ToolbarButton size="icon-sm" aria-label="Select">
							<Icon name="arrow-up" />
						</ToolbarButton>
						<ToolbarButton size="icon-sm" aria-label="Draw">
							<Icon name="edit" />
						</ToolbarButton>
						<ToolbarSeparator />
						<ToolbarButton size="icon-sm" aria-label="Delete">
							<Icon name="trash" />
						</ToolbarButton>
					</Toolbar>
				</Example>
			</Section>

			<Section
				title="Compact"
				description="Inside a workspace the same toolbar drops to the compact sizes. Nothing changes but the density."
			>
				<Example
					code={`<Density value="compact">
	<Toolbar aria-label="Canvas">
		<ToolbarButton size="xs">File</ToolbarButton>
		<ToolbarButton size="xs">Edit</ToolbarButton>
		<ToolbarSeparator />
		<ToolbarButton size="icon-xs" aria-label="Zoom out">
			<Icon name="minus" />
		</ToolbarButton>
		<ToolbarButton size="icon-xs" aria-label="Zoom in">
			<Icon name="plus" />
		</ToolbarButton>
	</Toolbar>
</Density>`}
				>
					<Density value="compact">
						<Toolbar aria-label="Canvas">
							<ToolbarButton size="xs">File</ToolbarButton>
							<ToolbarButton size="xs">Edit</ToolbarButton>
							<ToolbarSeparator />
							<ToolbarButton size="icon-xs" aria-label="Zoom out">
								<Icon name="minus" />
							</ToolbarButton>
							<ToolbarButton size="icon-xs" aria-label="Zoom in">
								<Icon name="plus" />
							</ToolbarButton>
						</Toolbar>
					</Density>
				</Example>
			</Section>

			<MetaFooter meta={toolbarMeta} />
		</>
	)
}
