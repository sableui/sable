import {
	Menu,
	MenuCheckboxItem,
	MenuContent,
	MenuItem,
	MenuLinkItem,
	MenuRadioGroup,
	MenuRadioItem,
	MenuSeparator,
	MenuSubmenu,
	MenuSubmenuTrigger,
	Menubar,
	MenubarTrigger,
	menubarMeta,
} from "@sableui/react"
import { useState } from "react"
import {
	Example,
	MetaFooter,
	PageHeader,
	Section,
	ledeFor,
} from "../../components/docs-ui"

function EditorMenubar() {
	const [ruler, setRuler] = useState(true)
	const [zoom, setZoom] = useState("100%")
	return (
		<Menubar aria-label="Editor">
			<Menu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenuContent>
					<MenuItem shortcut="Ctrl N">New</MenuItem>
					<MenuItem shortcut="Ctrl O">Open…</MenuItem>
					<MenuSubmenu>
						<MenuSubmenuTrigger>Open recent</MenuSubmenuTrigger>
						<MenuContent side="inline-end" align="start" sideOffset={4}>
							<MenuItem>Launch plan</MenuItem>
							<MenuItem>Brand refresh</MenuItem>
						</MenuContent>
					</MenuSubmenu>
					<MenuSeparator />
					<MenuItem shortcut="Ctrl S">Save</MenuItem>
					<MenuItem shortcut="Ctrl Shift E">Export…</MenuItem>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenuContent>
					<MenuItem shortcut="Ctrl Z">Undo</MenuItem>
					<MenuItem shortcut="Ctrl Shift Z">Redo</MenuItem>
					<MenuSeparator />
					<MenuItem shortcut="Ctrl X">Cut</MenuItem>
					<MenuItem shortcut="Ctrl C">Copy</MenuItem>
					<MenuItem shortcut="Ctrl V">Paste</MenuItem>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenuContent>
					<MenuCheckboxItem checked={ruler} onCheckedChange={setRuler} shortcut="Ctrl R">
						Show ruler
					</MenuCheckboxItem>
					<MenuSubmenu>
						<MenuSubmenuTrigger value={zoom}>Zoom</MenuSubmenuTrigger>
						<MenuContent side="inline-end" align="start" sideOffset={4}>
							<MenuRadioGroup value={zoom} onValueChange={setZoom}>
								<MenuRadioItem value="100%">100%</MenuRadioItem>
								<MenuRadioItem value="200%">200%</MenuRadioItem>
								<MenuRadioItem value="Fit">Fit</MenuRadioItem>
							</MenuRadioGroup>
						</MenuContent>
					</MenuSubmenu>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>Help</MenubarTrigger>
				<MenuContent>
					<MenuLinkItem href="/llms.txt">Documentation</MenuLinkItem>
				</MenuContent>
			</Menu>
		</Menubar>
	)
}

export function MenubarPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Menubar" lede={ledeFor(menubarMeta)} />

			<Section
				title="Editor menus"
				description="Open one menu, then point at the next title: the bar switches menus without another click. With the keyboard, ←/→ move between titles and ↓ opens one. Each command shows its key in the row's shortcut column."
			>
				<Example
					code={
						'<Menubar aria-label="Editor">\n\t<Menu>\n\t\t<MenubarTrigger>File</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem shortcut="Ctrl N">New</MenuItem>\n\t\t\t<MenuItem shortcut="Ctrl O">Open…</MenuItem>\n\t\t\t<MenuSeparator />\n\t\t\t<MenuItem shortcut="Ctrl S">Save</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n\t<Menu>\n\t\t<MenubarTrigger>Edit</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem shortcut="Ctrl Z">Undo</MenuItem>\n\t\t\t<MenuItem shortcut="Ctrl Shift Z">Redo</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n</Menubar>'
					}
				>
					<EditorMenubar />
				</Example>
			</Section>

			<MetaFooter meta={menubarMeta} />
		</>
	)
}
