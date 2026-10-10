import {
	Button,
	Icon,
	Panel,
	PanelGroup,
	PanelResizer,
	PanelSection,
	PropertyPair,
	PropertyRow,
	ScrubField,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	StatusBar,
	StatusBarGroup,
	StatusBarSeparator,
	Switch,
	Toolbar,
	ToolbarButton,
	usePanelWidth,
	Workspace,
	WorkspaceBar,
	WorkspaceCanvas,
	workspaceMeta,
} from "@sableui/react"
import { useState } from "react"
import { MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/**
 * A live, interactive miniature of the workspace register. Scaled into a fixed
 * frame rather than iframed: Workspace is `h-dvh` by design, so it needs a
 * bounded container to be embeddable in a docs page at all.
 */
function WorkspaceDemo() {
	const [leftWidth, setLeftWidth] = usePanelWidth(200, { min: 160, max: 280 })
	const [rightWidth, setRightWidth] = usePanelWidth(220, { min: 180, max: 300 })
	const [opacity, setOpacity] = useState(60)
	const [blockSize, setBlockSize] = useState(32)
	const [visible, setVisible] = useState(true)
	const [offsetX, setOffsetX] = useState(4)
	const [offsetY, setOffsetY] = useState(0)

	return (
		<div className="h-[420px] overflow-hidden rounded-lg border border-border">
			<Workspace
				className="h-full"
				toolbar={
					<WorkspaceBar>
						<span className="px-1 text-ui-md text-foreground">Studio</span>
						<Toolbar aria-label="Studio" className="flex-1">
							<ToolbarButton size="xs">File</ToolbarButton>
							<ToolbarButton size="xs">Edit</ToolbarButton>
							<ToolbarButton
								size="icon-xs"
								aria-label={visible ? "Hide layer" : "Show layer"}
								className="ms-auto"
								onClick={() => setVisible((v) => !v)}
							>
								<Icon name={visible ? "eye" : "eye-off"} />
							</ToolbarButton>
						</Toolbar>
					</WorkspaceBar>
				}
				statusBar={
					<StatusBar>
						<span className="text-ui-num">1024 × 768</span>
						<StatusBarSeparator />
						<span>2 layers</span>
						<StatusBarGroup align="end">
							<span>Saved</span>
						</StatusBarGroup>
					</StatusBar>
				}
			>
				<PanelGroup>
					<Panel label="Layers" width={leftWidth}>
						<PanelSection
							title="Layers"
							action={
								<Button
									size="icon-xs"
									variant="ghost"
									aria-label={visible ? "Hide layer" : "Show layer"}
									onClick={() => setVisible((v) => !v)}
								>
									<Icon name={visible ? "eye" : "eye-off"} />
								</Button>
							}
						>
							<PropertyRow label="Backdrop">
								<Switch checked={visible} onCheckedChange={setVisible} />
							</PropertyRow>
							<PropertyRow label="Foreground">
								<Switch defaultChecked />
							</PropertyRow>
						</PanelSection>
					</Panel>

					<PanelResizer
						side="left"
						width={leftWidth}
						onWidthChange={setLeftWidth}
						min={160}
						max={280}
						label="Resize layers panel"
					/>

					<WorkspaceCanvas>
						<div className="grid h-full place-items-center">
							<div
								className="size-32 rounded-sm bg-primary"
								style={{ opacity: opacity / 100 }}
							/>
						</div>
					</WorkspaceCanvas>

					<PanelResizer
						side="right"
						width={rightWidth}
						onWidthChange={setRightWidth}
						min={180}
						max={300}
						label="Resize properties panel"
					/>

					<Panel label="Properties" width={rightWidth}>
						<PanelSection title="Blending">
							<PropertyPair>
								<ScrubField
									label="Opacity"
									icon="grid"
									suffix="%"
									value={opacity}
									min={0}
									max={100}
									onValueChange={setOpacity}
								/>
								<Select defaultValue="normal">
									<SelectTrigger />
									<SelectContent>
										<SelectItem value="normal">Normal</SelectItem>
										<SelectItem value="multiply">Multiply</SelectItem>
									</SelectContent>
								</Select>
							</PropertyPair>
						</PanelSection>
						<PanelSection title="Parameters">
							<PropertyRow label="Block size">
								<ScrubField
									label="Block size"
									value={blockSize}
									min={4}
									max={256}
									suffix="px"
									className="w-(--field-numeric-width)"
									onValueChange={setBlockSize}
								/>
							</PropertyRow>
							<PropertyRow label="Offset">
								<ScrubField
										label="Offset X"
										prefix="X"
										value={offsetX}
										onValueChange={setOffsetX}
										className="w-(--field-numeric-width)"
									/>
								<ScrubField
										label="Offset Y"
										prefix="Y"
										value={offsetY}
										onValueChange={setOffsetY}
										className="w-(--field-numeric-width)"
									/>
							</PropertyRow>
						</PanelSection>
					</Panel>
				</PanelGroup>
			</Workspace>
		</div>
	)
}

export function WorkspacePage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Workspace" lede={ledeFor(workspaceMeta)} />

			<Section
				title="Live preview"
				description="Drag the panel edges, scrub Opacity, or type into any number."
			>
				<WorkspaceDemo />
			</Section>

			<MetaFooter meta={workspaceMeta} />
		</>
	)
}
