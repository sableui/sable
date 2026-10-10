import type { ComponentMeta } from "../../lib/meta"

export const tabsMeta: ComponentMeta = {
	name: "Tabs",
	summary:
		"Tabs over Base UI Tabs (roving focus, arrow-key nav, ARIA tablist wiring) in two styles: underline (page sections) or pill (compact switchers). Tabs (Root) + TabsList + TabsTrigger + TabsPanel.",
	status: "stable",
	keywords: [
		"tabs",
		"tablist",
		"panels",
		"segmented content",
	],
	usage: {
		description: "Use Tabs to switch between related panels within the same page context.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use tabs when each panel is peer content and users may compare or switch often.",
			},
			{
				guidance: "do",
				description: "Keep tab labels short and make the active tab unmistakable.",
			},
			{
				guidance: "do",
				description: "Use variant=\"pill\" for a short switcher inside a card or toolbar (Preview / Code, List / Grid); keep the default underline for sections of a page.",
			},
			{
				guidance: "dont",
				description: "Do not use Tabs for unrelated pages or primary navigation that needs distinct URLs.",
			},
			{
				guidance: "dont",
				description: "Do not use tabs for sequential steps. Tabs are peer views the user returns to in any order; a process with an order needs a stepper, or the user will skip ahead.",
			},
		],
		anatomy: [
			{
				name: "TabsList",
				required: true,
				description: "The list of tab triggers.",
			},
			{
				name: "TabsTrigger",
				required: true,
				description: "One selectable tab.",
			},
			{
				name: "TabsPanel",
				required: true,
				description: "The content associated with a trigger.",
			},
			{
				name: "TabsContent",
				required: false,
				description: "Compatibility alias for panel content.",
			},
		],
	},
	related: {
		components: [
			"Accordion",
			"BottomNav",
			"SideNav",
		],
	},
	props: [
		{
			name: "Tabs (Root)",
			type: "Base UI Tabs.Root props (value, defaultValue, onValueChange, orientation)",
			default: "defaultValue: 0",
			description:
				"Controls the active tab. Uncontrolled via defaultValue; controlled via value + onValueChange.",
		},
	],
	subcomponents: [
		{
			name: "TabsList",
			type: "Base UI Tabs.List props (activateOnFocus, loopFocus) + variant?: \"underline\" | \"pill\" + className",
			description: "The tablist row. variant=\"underline\" (default) draws a divider rule beneath the triggers; variant=\"pill\" drops the rule and fills the active trigger. Triggers inherit the variant.",
		},
		{
			name: "TabsTrigger",
			type: "Base UI Tabs.Tab props (value, disabled) + className",
			description:
				"A single tab button. value pairs it with the panel of the same value.",
		},
		{
			name: "TabsPanel",
			type: "Base UI Tabs.Panel props (value, keepMounted) + className",
			description: "The content shown when the matching trigger is active.",
		},
		{
			name: "TabsContent",
			type: "Alias of TabsPanel",
			description: "Re-export of TabsPanel for consumers that prefer this name.",
		},
	],
	tokensUsed: ["border", "muted", "muted-foreground", "foreground", "ring"],
	a11y: [
		"Base UI provides the tablist/tab/tabpanel roles, aria-selected, and roving tabindex.",
		"Arrow keys move between tabs; Home/End jump to first/last; panels are linked via aria-controls.",
		"Active tab styling reads from the data-active attribute; disabled tabs from data-disabled. Disabled tabs are skipped by arrow-key navigation.",
		"Keyboard focus shows a ring on the focused trigger in both variants; the panel remains focusable.",
	],
	examples: [
		{
			label: "Basic",
			code: '<Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList><TabsPanel value="overview">Overview content</TabsPanel><TabsPanel value="activity">Activity content</TabsPanel></Tabs>',
		},
		{
			label: "Pill switcher",
			code: '<Tabs defaultValue="preview"><TabsList variant="pill"><TabsTrigger value="preview">Preview</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList><TabsPanel value="preview">Rendered example</TabsPanel><TabsPanel value="code">Source</TabsPanel></Tabs>',
		},
		{
			label: "With a disabled tab",
			code: '<Tabs defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="holders" disabled>Holders</TabsTrigger></TabsList><TabsPanel value="overview">Overview content</TabsPanel></Tabs>',
		},
	],
}
