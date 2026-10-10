import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuGroupLabel,
	ContextMenuItem,
	contextMenuMeta,
	ContextMenuSeparator,
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
			>
				<Example>
					<ContextMenu>
						<ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed border-border bg-card text-body-sm text-muted-foreground select-none">
							Right-click here
						</ContextMenuTrigger>
						<ContextMenuContent>
							<ContextMenuItem>
								<Icon name="check" className="text-sm" />
								Mark as read
							</ContextMenuItem>
							<ContextMenuItem>
								<Icon name="ellipsis" className="text-sm" />
								More actions
							</ContextMenuItem>
							<ContextMenuSeparator />
							<ContextMenuItem disabled>
								<Icon name="xmark" className="text-sm" />
								Remove (unavailable)
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				</Example>
			</Section>

			<MetaFooter meta={contextMenuMeta} />
		</>
	)
}
