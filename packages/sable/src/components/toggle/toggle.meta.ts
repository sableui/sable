import type { ComponentMeta } from "../../lib/meta"

export const toggleMeta: ComponentMeta = {
	name: "Toggle",
	summary:
		"Pressed-state button over Base UI Toggle, plus ToggleGroup for shared single- or multi-select rows. Pressed styling reads from data-[pressed].",
	status: "stable",
	keywords: [
		"toggle",
		"pressed",
		"button state",
		"toolbar",
		"segmented control",
		"segmented",
		"toggle group",
		"button group",
		"view switcher",
	],
	usage: {
		description: "Use Toggle for button-like controls that can be pressed on or off within a toolbar or compact control set.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for transient UI modes such as bold, preview, pin, or favorite.",
			},
			{
				guidance: "do",
				description: "Make the pressed state visually and programmatically clear.",
			},
			{
				guidance: "do",
				description: "Use ToggleGroup appearance=\"segmented\" for a single-select view switch (List / Grid). It is the same capsule ThemeSwitcher wears — do not hand-build a track around a row of toggles.",
			},
			{
				guidance: "dont",
				description: "Do not use Toggle for persistent application settings; use Switch.",
				instead: ["Switch"],
			},
			{
				guidance: "dont",
				description: "Do not leave an icon-only Toggle without an accessible name. It announces as \"button, pressed\", which tells a screen-reader user the state but never what the state applies to.",
			},
		],
		anatomy: [
			{
				name: "Toggle",
				required: true,
				description: "A single pressed or unpressed control.",
			},
			{
				name: "ToggleGroup",
				required: false,
				description: "A coordinated group of toggle choices.",
			},
			{
				name: "ToggleGroupItem",
				required: false,
				description: "One toggle inside a group — an alias of Toggle, so <Toggle value=\"…\"> inside a ToggleGroup is the same thing.",
			},
		],
	},
	related: {
		components: [
			"Switch",
			"Button",
			"Tabs",
		],
	},
	props: [
		{
			name: "appearance",
			type: '"default" | "segmented"',
			default: '"default"',
			description:
				"On ToggleGroup: `default` is a loose row of toggles; `segmented` draws the capsule segmented control (one track, the pressed option filled) shared with ThemeSwitcher. Toggles inside inherit it.",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			description:
				"On ToggleGroup: allow several toggles pressed at once. The default is single-select, which behaves like a radio group.",
		},
		{
			name: "Toggle",
			type: "Base UI Toggle props (pressed, defaultPressed, onPressedChange, disabled, value) + className",
			default: "defaultPressed: false",
			description:
				"A two-state button. Uncontrolled via defaultPressed; controlled via pressed + onPressedChange. Pass value to identify it inside a ToggleGroup.",
		},
	],
	subcomponents: [
		{
			name: "ToggleGroup",
			type: "Base UI ToggleGroup props (value, defaultValue, onValueChange, multiple, disabled, orientation, loopFocus) + appearance?: \"default\" | \"segmented\" + className",
			description:
				"Groups child Toggles and shares pressed state across them — each Toggle inside carries a value. Defaults to multiple: false (single-select) — the fit for view-mode switches and segmented controls; pass multiple to allow several pressed at once, e.g. a row of formatting toggles.",
		},
		{
			name: "ToggleGroupItem",
			type: "Alias of Toggle",
			description:
				"Re-export of Toggle for group composition — a Toggle carrying a value is the group item.",
		},
	],
	variants: {
		appearance: ["default", "segmented"],
	},
	tokensUsed: ["muted-foreground", "foreground", "accent", "accent-foreground", "card", "border", "ring"],
	a11y: [
		"Base UI sets aria-pressed on each Toggle and manages the pressed/disabled states.",
		"ToggleGroup provides arrow-key roving focus across its items; loopFocus wraps at the ends.",
		"Pressed styling reads from the data-[pressed] attribute; disabled items are dimmed and non-interactive.",
		"Always supply an aria-label (or visible text) when a Toggle holds only an icon.",
	],
	examples: [
		{
			label: "Standalone",
			code: '<Toggle aria-label="Mute">Mute</Toggle>',
		},
		{
			label: "Single-select group",
			code: '<ToggleGroup defaultValue={["list"]}><Toggle value="list" aria-label="List view"><Icon name="list" /></Toggle><Toggle value="grid" aria-label="Grid view"><Icon name="grid" /></Toggle></ToggleGroup>',
		},
		{
			label: "Segmented view switch",
			code: '<ToggleGroup appearance="segmented" defaultValue={["list"]} aria-label="View"><Toggle value="list" aria-label="List view"><Icon name="list" /></Toggle><Toggle value="grid" aria-label="Grid view"><Icon name="grid" /></Toggle></ToggleGroup>',
		},
		{
			label: "Multi-select group",
			code: '<ToggleGroup multiple defaultValue={["bold"]}><Toggle value="bold">Bold</Toggle><Toggle value="italic">Italic</Toggle></ToggleGroup>',
		},
	],
}
