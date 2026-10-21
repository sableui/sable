import {
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	Breadcrumbs,
	BreadcrumbSeparator,
	Button,
	DataTable,
	Density,
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

const ISSUES = [
	{ id: "AES-104", title: "Refine product detail page", status: "In progress" },
	{ id: "AES-105", title: "Build the ingredient library", status: "In progress" },
	{ id: "AES-106", title: "Review mobile navigation", status: "In review" },
	{ id: "AES-107", title: "Define checkout transitions", status: "Todo" },
]

/**
 * The tracker shape: no `toolbar` slot (the bar belongs to the list column, so
 * the inspector runs the full height beside it), and an inspector Panel with
 * `narrow="sheet"` — docked here, a sheet below lg. Selecting a row opens it at
 * every width; closing it gives the list its width back.
 */
function TrackerDemo() {
	const [selected, setSelected] = useState<string | null>("AES-104")
	const [tab, setTab] = useState<"issues" | "overview">("issues")
	const issue = ISSUES.find((i) => i.id === selected)
	return (
		<div className="h-[420px] overflow-hidden rounded-lg border border-border">
			<Workspace
				className="h-full"
				statusBar={
					<StatusBar>
						<span>{ISSUES.length} issues</span>
						<StatusBarGroup align="end">
							<span>Saved</span>
						</StatusBarGroup>
					</StatusBar>
				}
			>
				<PanelGroup>
					<WorkspaceCanvas className="flex flex-col">
						<WorkspaceBar>
							<Breadcrumbs className="px-1">
								<BreadcrumbItem>
									<BreadcrumbLink href="#">Studio</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>Digital flagship</BreadcrumbPage>
								</BreadcrumbItem>
							</Breadcrumbs>
							<Toolbar aria-label="View" className="ms-auto">
								<ToolbarButton size="xs" aria-pressed={tab === "issues"} onClick={() => setTab("issues")}>
									Issues
								</ToolbarButton>
								<ToolbarButton size="xs" aria-pressed={tab === "overview"} onClick={() => setTab("overview")}>
									Overview
								</ToolbarButton>
							</Toolbar>
						</WorkspaceBar>
						<div className="min-h-0 flex-1 overflow-y-auto scrollbar-quiet">
							{tab === "issues" ? (
								<DataTable
									columns={[
										{ key: "id", header: "ID", className: "w-24" },
										{ key: "title", header: "Issue" },
										{ key: "status", header: "Status", className: "w-28" },
									]}
									data={ISSUES}
									rowKey={(i) => i.id}
									onRowClick={(i) => setSelected(i.id)}
									isRowSelected={(i) => i.id === selected}
								/>
							) : (
								// A reading view: the comfortable scope gives prose its page
								// size back inside the compact workspace.
								<Density value="comfortable">
									<article className="max-w-prose p-6">
										<h2 className="text-heading-4">Project overview</h2>
										<p className="mt-3 text-body-md text-muted-foreground">
											A considered digital experience for everyday rituals. Paragraphs keep their page size
											here, while the chrome around the canvas stays compact.
										</p>
									</article>
								</Density>
							)}
						</div>
					</WorkspaceCanvas>
					<Panel
						label="Issue details"
						width={280}
						narrow="sheet"
						open={issue !== undefined}
						onOpenChange={(open) => !open && setSelected(null)}
						className="border-s border-hairline"
					>
						{issue ? (
							<PanelSection
								title={issue.id}
								action={
									<Button size="icon-xs" variant="ghost" aria-label="Close issue" onClick={() => setSelected(null)}>
										<Icon name="xmark" />
									</Button>
								}
							>
								<PropertyRow label="Title" stacked>
									<span className="text-ui-body">{issue.title}</span>
								</PropertyRow>
								<PropertyRow label="Status">
									<Select defaultValue={issue.status}>
										<SelectTrigger size="xs" aria-label="Issue status" />
										<SelectContent>
											<SelectItem value="Todo">Todo</SelectItem>
											<SelectItem value="In progress">In progress</SelectItem>
											<SelectItem value="In review">In review</SelectItem>
										</SelectContent>
									</Select>
								</PropertyRow>
							</PanelSection>
						) : null}
					</Panel>
				</PanelGroup>
			</Workspace>
		</div>
	)
}
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

			<Section
				title="Issue tracker"
				description="No toolbar slot: the bar belongs to the list column, so the inspector runs the full height beside it. The inspector docks here and becomes a sheet below lg. The Overview tab is a reading view in a comfortable Density scope."
			>
				<TrackerDemo />
			</Section>

			<MetaFooter meta={workspaceMeta} />
		</>
	)
}
