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
					<MenuItem>New</MenuItem>
					<MenuItem>Open…</MenuItem>
					<MenuSubmenu>
						<MenuSubmenuTrigger>Open recent</MenuSubmenuTrigger>
						<MenuContent side="inline-end" align="start" sideOffset={4}>
							<MenuItem>Launch plan</MenuItem>
							<MenuItem>Brand refresh</MenuItem>
						</MenuContent>
					</MenuSubmenu>
					<MenuSeparator />
					<MenuItem>Save</MenuItem>
					<MenuItem>Export…</MenuItem>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenuContent>
					<MenuItem>Undo</MenuItem>
					<MenuItem>Redo</MenuItem>
					<MenuSeparator />
					<MenuItem>Cut</MenuItem>
					<MenuItem>Copy</MenuItem>
					<MenuItem>Paste</MenuItem>
				</MenuContent>
			</Menu>
			<Menu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenuContent>
					<MenuCheckboxItem checked={ruler} onCheckedChange={setRuler}>
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
				description="Open one menu, then point at the next title: the bar switches menus without another click. With the keyboard, ←/→ move between titles and ↓ opens one."
			>
				<Example
					code={
						'<Menubar aria-label="Editor">\n\t<Menu>\n\t\t<MenubarTrigger>File</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem>New</MenuItem>\n\t\t\t<MenuItem>Open…</MenuItem>\n\t\t\t<MenuSeparator />\n\t\t\t<MenuItem>Save</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n\t<Menu>\n\t\t<MenubarTrigger>Edit</MenubarTrigger>\n\t\t<MenuContent>\n\t\t\t<MenuItem>Undo</MenuItem>\n\t\t\t<MenuItem>Redo</MenuItem>\n\t\t</MenuContent>\n\t</Menu>\n</Menubar>'
					}
				>
					<EditorMenubar />
				</Example>
			</Section>

			<MetaFooter meta={menubarMeta} />
		</>
	)
}
