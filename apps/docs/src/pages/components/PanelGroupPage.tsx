import {
	Panel,
	PanelGroup,
	PanelResizer,
	PanelSection,
	PropertyRow,
	Switch,
	panelGroupMeta,
	usePanelWidth,
} from "@sableui/react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

function PanelGroupDemo() {
	const [leftWidth, setLeftWidth, leftBounds] = usePanelWidth(200, {
		storageKey: "sable-docs:panel-group:left",
		min: 160,
		max: 300,
	})

	return (
		<div
			data-density="compact"
			className="flex h-72 flex-col overflow-hidden rounded-lg border border-border bg-panel"
		>
			<PanelGroup>
				<Panel label="Layers" width={leftWidth}>
					<PanelSection title="Layers">
						<PropertyRow label="Backdrop">
							<Switch defaultChecked />
						</PropertyRow>
						<PropertyRow label="Overlay">
							<Switch />
						</PropertyRow>
					</PanelSection>
				</Panel>
				<PanelResizer
					side="left"
					width={leftWidth}
					onWidthChange={setLeftWidth}
					label="Resize layers panel"
					{...leftBounds}
				/>
				<Panel
					label="Canvas"
					scroll={false}
					className="grid place-items-center bg-canvas text-ui-body text-muted-foreground"
				>
					Canvas — {leftWidth}px
				</Panel>
			</PanelGroup>
		</div>
	)
}

export function PanelGroupPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Panel Group" lede={ledeFor(panelGroupMeta)} />

			<Section
				title="Live preview"
				description="Drag the divider to resize the panel. It works from the keyboard too."
			>
				<PanelGroupDemo />
			</Section>

			<MetaFooter meta={panelGroupMeta} />
		</>
	)
}
