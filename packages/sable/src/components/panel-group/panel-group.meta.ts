import type { ComponentMeta } from "../../lib/meta"

export const panelGroupMeta: ComponentMeta = {
	name: "PanelGroup",
	summary:
		"A row of docked chrome panels around a flexible centre, with draggable and keyboard-resizable edges and optional persisted widths.",
	keywords: [
		"panel",
		"panels",
		"resize",
		"resizable",
		"splitter",
		"docked",
		"workspace",
		"tool",
		"chrome",
		"inspector",
		"layout",
	],
	usage: {
		description:
			"Use PanelGroup for the body of a tool workspace: fixed-width Panels docked left and/or right, a flexible Panel in the middle for the canvas, and a PanelResizer between them. Panels scroll internally and the group never scrolls. This is the workspace-register counterpart to SplitPane, which only switches between side-by-side and stacked at a breakpoint and cannot be resized.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give every docked Panel a fixed width and leave the centre Panel width-less so it absorbs the remaining space.",
			},
			{
				guidance: "do",
				description:
					"Drive the width with usePanelWidth and pass a storageKey, so a user's layout survives a reload. Spread its bounds onto the PanelResizer rather than repeating min and max by hand.",
			},
			{
				guidance: "do",
				description:
					"Label every Panel — they are landmarks, and 'Layers' or 'Properties' is what a screen-reader user navigates by.",
			},
			{
				guidance: "dont",
				description:
					"Let the group scroll. Only panels and the canvas scroll; a scrolling group means the shell lost its height constraint.",
			},
			{
				guidance: "dont",
				description:
					"Use it for page content columns — that's Grid or Columns. PanelGroup is chrome, and it sits outside the content grid.",
			},
			{
				guidance: "dont",
				description:
					"Omit PanelResizer to save effort and then let users live with a fixed panel. If a panel holds a tree or a property grid, its width is a preference.",
			},
		],
		anatomy: [
			{
				name: "PanelGroup",
				required: true,
				description:
					"The flex row. Sets min-h-0/min-w-0 so children can actually shrink and scroll.",
			},
			{
				name: "Panel",
				required: true,
				description:
					"One column. Fixed-width when `width` is set, flexible otherwise. Scrolls internally.",
			},
			{
				name: "PanelResizer",
				required: false,
				description:
					"The draggable edge between two panels: a 1px hairline with a wider hit area, operable by pointer and keyboard.",
			},
		],
	},
	related: {
		components: ["PanelSection", "ScrubField", "SplitPane", "Sidebar", "AppShell"],
	},
	status: "stable",
	props: [],
	subcomponents: [
		{
			name: "Panel",
			type: "{ label: string; width?: number; scroll?: boolean }",
			description:
				"A docked or flexible column. `label` names the landmark; omit `width` for the flexible centre. `scroll` defaults to true — set it false for a header + scrolling body + pinned footer, so the footer doesn't scroll away with the list. When you own the layout, give the header and footer shrink-0 and the middle min-h-0 flex-1 overflow-y-auto. overflow-y-auto only activates if every flex ancestor can shrink: a single missing min-h-0 anywhere up the chain makes the panel grow instead of scroll, and nothing reports it.",
		},
		{
			name: "PanelResizer",
			type: "{ side: 'left' | 'right'; width: number; onWidthChange: (n: number) => void; label: string; min?: number; max?: number; step?: number }",
			description:
				"The draggable edge. `side` says which side the resized panel is on, so the drag delta's sign is right.",
		},
		{
			name: "usePanelWidth",
			type: "(defaultWidth: number, options?: { storageKey?: string; min?: number; max?: number }) => readonly [number, (n: number) => void, { min: number; max: number }]",
			description:
				"Controlled width for a Panel, clamped and optionally persisted to localStorage (only when `storageKey` is passed). Read through useSyncExternalStore, so there is no server/client hydration mismatch and no setState in an effect; do not hand-roll a localStorage read during render or a write from an effect. Without `storageKey` the width is kept in memory per hook instance. The third element is the `{ min, max }` it clamps to: spread it onto the paired PanelResizer so the separator's aria-valuemin/max and Home/End match the real clamp.",
		},
	],
	a11y: [
		"PanelResizer is a role=separator with aria-orientation, aria-valuenow/min/max, and is focusable — a pointer-only resizer is a keyboard trap.",
		"Arrow keys resize by `step`; Home and End jump to the minimum and maximum.",
		"Each Panel renders an <aside> with an accessible name from `label`, so panels are navigable landmarks.",
	],
	tokensUsed: ["primary", "panel", "hairline", "hairline-strong"],
	examples: [
		{
			label: "Tool body with a resizable left panel",
			code: `function Body() {
  const [leftWidth, setLeftWidth, leftBounds] = usePanelWidth(240, { storageKey: "app:panel:left", min: 180, max: 360 })
  return (
    <PanelGroup>
      <Panel label="Layers" width={leftWidth}>
        <PanelSection title="Layers">
          <PropertyRow label="Background">
            <Switch checked />
          </PropertyRow>
        </PanelSection>
      </Panel>
      <PanelResizer side="left" width={leftWidth} onWidthChange={setLeftWidth} label="Resize layers panel" {...leftBounds} />
      <Panel label="Canvas">
        <div className="grid h-full place-items-center bg-canvas text-ui-body text-muted-foreground">Canvas</div>
      </Panel>
    </PanelGroup>
  )
}`,
		},
		{
			label: "Both edges resizable",
			code: `function Body() {
  const [left, setLeft, leftBounds] = usePanelWidth(240, { storageKey: "app:left" })
  const [right, setRight, rightBounds] = usePanelWidth(256, { storageKey: "app:right" })
  return (
    <PanelGroup>
      <Panel label="Layers" width={left} />
      <PanelResizer side="left" width={left} onWidthChange={setLeft} label="Resize layers panel" {...leftBounds} />
      <Panel label="Canvas" />
      <PanelResizer side="right" width={right} onWidthChange={setRight} label="Resize properties panel" {...rightBounds} />
      <Panel label="Properties" width={right}>
        <PanelSection title="Blending">
          <PropertyPair>
            <ScrubField label="Opacity" icon="grid" suffix="%" value={100} min={0} max={100} />
            <ScrubField label="Blur" value={0} min={0} max={64} suffix="px" />
          </PropertyPair>
        </PanelSection>
      </Panel>
    </PanelGroup>
  )
}`,
		},
		{
			label: "Fixed panel, no resizer",
			code: `<PanelGroup>
  <Panel label="Tools" width={56}>
    <div className="flex flex-col gap-1 p-1">
      <Button size="icon-xs" variant="ghost" aria-label="Toggle grid"><Icon name="grid" /></Button>
      <Button size="icon-xs" variant="ghost" aria-label="Hide"><Icon name="eye" /></Button>
    </div>
  </Panel>
  <Panel label="Canvas" />
</PanelGroup>`,
		},
	],
}
