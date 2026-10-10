import type { ComponentMeta } from "../../lib/meta"

export const statusBarMeta: ComponentMeta = {
	name: "StatusBar",
	summary:
		"The bottom chrome strip of a Workspace: ambient document facts — dimensions, counts, sync state — in the micro type tier.",
	keywords: [
		"status bar",
		"status",
		"footer",
		"chrome",
		"workspace",
		"tool",
		"ambient",
		"counts",
		"document",
	],
	usage: {
		description:
			"Use StatusBar for the persistent facts about a document that otherwise have nowhere to live: size, counts, selection state, sync or connection status. Everything in it is ambient — it reports, it does not command. Pair it with Workspace's statusBar slot.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Put document-scoped facts here — dimensions, layer or record counts, saved/sync state — so panels stop competing for that space.",
			},
			{
				guidance: "do",
				description:
					"Use StatusBarGroup with align=\"end\" for the trailing cluster, and StatusBarSeparator between related facts.",
			},
			{
				guidance: "do",
				description:
					"Render numeric facts in the UI num tier so a changing value doesn't shift the strip's layout.",
			},
			{
				guidance: "dont",
				description:
					"Make it the only route to an action. It's ambient chrome at the micro tier — anything essential needs a real control elsewhere too.",
			},
			{
				guidance: "dont",
				description:
					"Put zoom here. Anchor zoom to the canvas it acts on, which is where every reference tool puts it.",
			},
			{
				guidance: "dont",
				description:
					"Use it for transient feedback like a save confirmation — that's Toast. A status bar states what is true, not what just happened.",
			},
			{
				guidance: "dont",
				description:
					"Derive a fact here separately from the surface that shows it, or from something expensive to recompute. The strip re-renders with the document, so read the same value the canvas or panel uses: a status bar that reports max(asset sizes) while the canvas reports something else is a bug types cannot catch, because both are numbers.",
			},
		],
		anatomy: [
			{
				name: "StatusBarGroup",
				required: false,
				description: 'A cluster of items; align="end" pins it to the trailing edge.',
			},
			{
				name: "StatusBarSeparator",
				required: false,
				description: "A decorative dot between related facts; aria-hidden.",
			},
		],
	},
	related: {
		components: ["Workspace", "PanelGroup", "InlineStatus", "Toast", "Banner"],
	},
	status: "stable",
	props: [],
	subcomponents: [
		{
			name: "StatusBarGroup",
			type: "{ align?: 'start' | 'end' }",
			description: "A cluster of status items; `end` pushes it to the trailing edge.",
		},
		{
			name: "StatusBarSeparator",
			type: "ComponentProps<'span'>",
			description: "A decorative middle dot between facts. aria-hidden, since order conveys grouping.",
		},
	],
	a11y: [
		"Renders a <footer>, so the strip is a discoverable region rather than an anonymous row of text.",
		"Separators are aria-hidden — a screen reader announcing 'middle dot' between every fact is noise.",
		"Micro-tier text is small by design; never put information here that exists nowhere else.",
	],
	tokensUsed: ["muted-foreground", "panel", "hairline", "hairline-strong"],
	examples: [
		{
			label: "Document facts with a trailing cluster",
			code: `<StatusBar>
  <span className="text-ui-num">1024 × 768</span>
  <StatusBarSeparator />
  <span>3 layers</span>
  <StatusBarGroup align="end">
    <span>Saved</span>
  </StatusBarGroup>
</StatusBar>`,
		},
		{
			label: "With a warning tone",
			code: `<StatusBar>
  <span>Offline — edits are queued</span>
  <StatusBarGroup align="end">
    <span className="text-tone-warning">2 unsynced</span>
  </StatusBarGroup>
</StatusBar>`,
		},
		{
			label: "In a Workspace",
			code: `<Workspace statusBar={<StatusBar><span>Connected</span></StatusBar>}>
  <PanelGroup>
    <WorkspaceCanvas />
  </PanelGroup>
</Workspace>`,
		},
	],
}
