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
				"On ToggleGroup: `default` is a loose row of toggles; `segmented` draws the capsule segmented control (one track, the pressed option filled) shared with ThemeSwitcher. Single-select segmented draws ONE fill that glides to the pressed option and resizes to its label; multi-select keeps a fill per pressed option. Toggles inside inherit it.",
		},
		{
			name: "multiple",
			type: "boolean",
			default: "false",
			description:
				"On ToggleGroup: allow several toggles pressed at once. The default is single-select, which behaves like a radio group.",
		},
		{
			name: "motion",
			type: '"full" | "subtle" | "off"',
			default: '"full"',
			description:
				"On ToggleGroup: how much motion this component uses: `full` (default) inherits the app's policy, `subtle` keeps feedback and drops the glide, `off` stills it. It can only turn motion down — it never overrides a reader's reduce-motion setting.",
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
			type: "Base UI ToggleGroup props (value, defaultValue, onValueChange, multiple, disabled, orientation, loopFocus) + appearance?: \"default\" | \"segmented\" + motion?: \"full\" | \"subtle\" | \"off\" + className",
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
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Toggle",
			why: "Toggles arrive with the toolbar or header they sit in. Animating each one in would make a row of controls ripple for no reason.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Toggle",
			why: "Hover and the pressed fill ease rather than flip, so pressing reads as the same button changing state, not a different button appearing.",
		},
		{
			slot: "response",
			recipe: "motion-press",
			part: "Toggle",
			why: "The small settle under the finger confirms the press landed before the state change is read — the difference matters most on touch, where there is no hover.",
		},
		{
			slot: "transition",
			recipe: "motion-glide",
			part: "Segmented fill",
			why: "In a single-select segmented group one fill travels to the chosen option and stretches to its label, so a view switch reads as one control now pointing elsewhere. Measured, because labels differ in width. Expressive: motion=\"subtle\" lands it in place.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Toggle",
			why: "A toggle commits instantly. Work that follows from the new state shows where its result appears, not on the control.",
		},
	],
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
			label: "Segmented with labels, subtle motion",
			code: '<ToggleGroup appearance="segmented" motion="subtle" defaultValue={["week"]} aria-label="Range"><Toggle value="day">Day</Toggle><Toggle value="week">Week</Toggle><Toggle value="month">Month</Toggle></ToggleGroup>',
		},
		{
			label: "Multi-select group",
			code: '<ToggleGroup multiple defaultValue={["bold"]}><Toggle value="bold">Bold</Toggle><Toggle value="italic">Italic</Toggle></ToggleGroup>',
		},
	],
}
