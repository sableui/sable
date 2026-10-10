import type { ComponentMeta } from "../../lib/meta"

export const workspaceMeta: ComponentMeta = {
	name: "Workspace",
	summary:
		"The shell for a tool: a fixed viewport partitioned into independently scrolling regions, with a compact density scope, a skip link, and a canvas landmark.",
	keywords: [
		"workspace",
		"tool",
		"editor",
		"shell",
		"frame",
		"canvas",
		"chrome",
		"panels",
		"density",
		"viewport",
	],
	usage: {
		description:
			"Use Workspace as the outer frame for a tool — an editor, a console, a canvas app. It owns the viewport, scopes the compact control density, and guarantees a skip link plus a main landmark on the canvas. Reach for AppShell instead for page-register products: it is built around a scrolling document, where a workspace is built around a fixed one. Workspace fills the viewport (h-dvh) by design; to embed one in a page (a docs preview, a modal-sized demo), wrap it in a bounded container and pass className=\"h-full\".",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Put a PanelGroup in the body and a WorkspaceCanvas inside it, so panels are aside chrome and the work surface is the main landmark.",
			},
			{
				guidance: "do",
				description:
					"Let each panel own its scrolling. The shell never scrolls, and the canvas clips rather than scrolls — panning is the viewport's job.",
			},
			{
				guidance: "do",
				description:
					"Keep the density scope at compact unless you have a specific reason; the workspace register's measured control ladder is what makes tool chrome read as tool chrome.",
			},
			{
				guidance: "dont",
				description:
					"Nest a Region or Page inside it to set a width. Region caps are a page-register idea; a workspace is edge-to-edge and its panels are fixed-width chrome outside the content grid.",
			},
			{
				guidance: "dont",
				description:
					"Hardcode a control height (h-[32px]). CI rejects it (raw-control-height); read the ladder instead, e.g. h-(--control-sm), so the density scope can size it.",
			},
			{
				guidance: "dont",
				description:
					"Put a Card in the chrome. Use PanelSection — a card inside a narrow panel spends its border and inset on nothing.",
			},
			{
				guidance: "dont",
				description:
					"Use it for a dashboard that scrolls. If the primary interaction is reading down a page, that's AppShell plus a Region, not a workspace.",
			},
		],
		anatomy: [
			{
				name: "WorkspaceBar",
				required: false,
				description:
					"Top chrome at --chrome-bar-height with a hairline beneath: toolbar, document tabs, menubar row.",
			},
			{
				name: "Body",
				required: true,
				description:
					"The flexible middle row, normally a PanelGroup. Constrained so its children can shrink and scroll.",
			},
			{
				name: "WorkspaceCanvas",
				required: false,
				description:
					"The work surface and the main#main-content landmark the skip link targets. Clips rather than scrolls.",
			},
			{
				name: "StatusBar",
				required: false,
				description: "Bottom chrome for ambient document facts.",
			},
		],
	},
	related: {
		components: ["PanelGroup", "PanelSection", "StatusBar", "ScrubField", "AppShell"],
	},
	status: "stable",
	props: [
		{
			name: "toolbar",
			type: "ReactNode",
			description: "Top chrome, normally a WorkspaceBar.",
		},
		{ name: "statusBar", type: "ReactNode", description: "Bottom chrome, normally a StatusBar." },
		{
			name: "density",
			type: '"compact" | "comfortable"',
			default: '"compact"',
			description:
				"Density scope for everything inside. Sets the --control-* ladder via data-density; compact is the workspace register. Nothing hardcodes a height, so the same size=\"md\" Button is 40px on a page and 32px inside a compact Workspace. A Dialog opened from inside resets to comfortable, because a modal is a page-register surface even when a tool launched it.",
		},
		{
			name: "skipLinkLabel",
			type: "string",
			default: '"Skip to canvas"',
			description: "Text for the skip link that targets the canvas landmark.",
		},
	],
	subcomponents: [
		{
			name: "WorkspaceBar",
			type: "ComponentProps<'header'>",
			description: "The top chrome strip, sized to --chrome-bar-height with a hairline beneath.",
		},
		{
			name: "WorkspaceCanvas",
			type: "ComponentProps<'main'>",
			description:
				"The work surface: renders main#main-content, fills the body, clips its overflow.",
		},
	],
	a11y: [
		"Renders a skip link to #main-content as the first focusable element, even though there is no scrolling document.",
		"WorkspaceCanvas is the <main id=\"main-content\"> landmark; Panels are <aside> chrome with their own names.",
		"Density only changes control sizes, never hit-target rules — an icon button at the 24px floor still needs a padded 44px hit area.",
	],
	tokensUsed: ["canvas", "canvas-foreground", "panel", "hairline", "popover", "popover-foreground", "ring"],
	examples: [
		{
			label: "Editor shell",
			code: `<Workspace
  toolbar={
    <WorkspaceBar>
      <span className="px-1 text-ui-md text-foreground">Studio</span>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <Button size="xs" variant="ghost">Open</Button>
    </WorkspaceBar>
  }
  statusBar={
    <StatusBar>
      <span className="text-ui-num">1024 × 768</span>
      <StatusBarSeparator />
      <span>3 layers</span>
      <StatusBarGroup align="end"><span>Saved</span></StatusBarGroup>
    </StatusBar>
  }
>
  <PanelGroup>
    <Panel label="Layers" width={240}>
      <PanelSection title="Layers">
        <PropertyRow label="Background"><Switch defaultChecked /></PropertyRow>
      </PanelSection>
    </Panel>
    <WorkspaceCanvas>
      <div className="grid h-full place-items-center text-ui-body text-muted-foreground">Canvas</div>
    </WorkspaceCanvas>
    <Panel label="Properties" width={256}>
      <PanelSection title="Blending">
        <PropertyPair>
          <ScrubField label="Opacity" icon="grid" suffix="%" value={100} min={0} max={100} />
          <ScrubField label="Blur" value={0} min={0} max={64} suffix="px" />
        </PropertyPair>
      </PanelSection>
    </Panel>
  </PanelGroup>
</Workspace>`,
		},
		{
			label: "Console shell (no canvas)",
			code: `<Workspace statusBar={<StatusBar><span>Connected</span></StatusBar>}>
  <PanelGroup>
    <Panel label="Sources" width={240}>
      <PanelSection title="Sources">
        <PropertyRow label="Filter"><Input placeholder="Search" /></PropertyRow>
      </PanelSection>
    </Panel>
    <WorkspaceCanvas className="overflow-y-auto scrollbar-quiet">
      <div className="p-3 text-ui-num text-muted-foreground">log output…</div>
    </WorkspaceCanvas>
  </PanelGroup>
</Workspace>`,
		},
		{
			label: "Comfortable density",
			code: `<Workspace density="comfortable" toolbar={<WorkspaceBar><span className="text-ui-md">Review</span></WorkspaceBar>}>
  <PanelGroup>
    <WorkspaceCanvas>
      <div className="grid h-full place-items-center text-body-md text-muted-foreground">Touch-friendly review mode</div>
    </WorkspaceCanvas>
  </PanelGroup>
</Workspace>`,
		},
	],
}
