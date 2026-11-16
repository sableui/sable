import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	ContextMenuLinkItem,
	contextMenuMeta,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuSubmenu,
	ContextMenuSubmenuTrigger,
	ContextMenuTrigger,
	Icon,
} from "@sableui/react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

export function ContextMenuPage() {
	return (
		<>
			<PageHeader
				eyebrow="Components"
				title="Context Menu"
				lede={ledeFor(contextMenuMeta)}
			/>

			<Section
				title="Basic"
				description="Opens at the pointer on right click or long press."
			>
				<Example>
					<ContextMenu>
						<ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-border bg-card text-body-sm text-muted-foreground select-none">
							Right-click here
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem>Cut</ContextMenuItem>
							<ContextMenuItem>Copy</ContextMenuItem>
							<ContextMenuItem>Paste</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem variant="destructive">
								Delete
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Example>
			</Section>

			<Section
				title="Grouped"
				description="A label gathers related actions."
			>
				<Example>
					<ContextMenu>
						<ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-border bg-card text-body-sm text-muted-foreground select-none">
							Right-click here
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuGroup>
								<ContextMenuGroupLabel>Layout</ContextMenuGroupLabel>
								<ContextMenuItem>Move up</ContextMenuItem>
								<ContextMenuItem>Move down</ContextMenuItem>
							</ContextMenuGroup>
							<ContextMenuSeparator />
							<ContextMenuItem>Duplicate</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Example>
			</Section>

			<Section
				title="With icons and a disabled item"
				description="ContextMenuItem is MenuItem: `icon` leads the row, `description` adds a muted second line, `shortcut` ends it."
			>
				<Example>
					<ContextMenu>
						<ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-border bg-card text-body-sm text-muted-foreground select-none">
							Right-click here
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem icon={<Icon name="check" />} shortcut="R">
								Mark as read
							</ContextMenuItem>
							<ContextMenuItem icon={<Icon name="copy" />} description="Copy the message as Markdown">
								Copy text
							</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem disabled icon={<Icon name="xmark" />}>
								Remove (unavailable)
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Example>
			</Section>

			<Section
				title="Submenus, choices and links"
				description="Every Menu part has a ContextMenu name: a submenu with its current value, checkbox and radio rows that keep the menu open, and a link item that announces a new tab."
			>
				<Example>
					<ContextMenu>
						<ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-border bg-card text-body-sm text-muted-foreground select-none">
							Right-click the file
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem icon={<Icon name="edit" />} shortcut="F2">
								Rename
							</ContextMenuItem>
							<ContextMenuSubmenu>
								<ContextMenuSubmenuTrigger icon={<Icon name="folder" />} value="Desktop">
									Move to
								</ContextMenuSubmenuTrigger>
								<ContextMenuContent side="inline-end">
									<ContextMenuItem>Desktop</ContextMenuItem>
									<ContextMenuItem>Documents</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenuSubmenu>
							<ContextMenuSeparator />
							<ContextMenuGroup>
								<ContextMenuGroupLabel>View</ContextMenuGroupLabel>
								<ContextMenuCheckboxItem defaultChecked>Show extension</ContextMenuCheckboxItem>
								<ContextMenuRadioGroup defaultValue="name">
									<ContextMenuRadioItem value="name">Sort by name</ContextMenuRadioItem>
									<ContextMenuRadioItem value="date">Sort by date</ContextMenuRadioItem>
								</ContextMenuRadioGroup>
							</ContextMenuGroup>
							<ContextMenuSeparator />
							<ContextMenuLinkItem href="https://sableui.com" target="_blank">
								Help
							</ContextMenuLinkItem>
							<ContextMenuItem variant="destructive" icon={<Icon name="trash" />}>
								Delete
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Example>
			</Section>

			<MetaFooter meta={contextMenuMeta} />
		</>
	)
}
