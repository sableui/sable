import type { ComponentMeta } from "../../lib/meta"

export const settingsMenuMeta: ComponentMeta = {
	name: "SettingsMenu",
	summary:
		"A compact trigger that states the current settings, over a menu of rows that change them. Each row shows its own value and opens a submenu.",
	status: "stable",
	keywords: [
		"settings",
		"model picker",
		"model switcher",
		"options menu",
		"preferences",
		"submenu",
		"quality settings",
		"ai chat",
	],
	usage: {
		description:
			"For a cluster of related settings that a reader checks often and changes occasionally — the model and effort on an AI composer, quality and format on an export control, density and sort on a table. It encodes one shape: summarise the state on the trigger, then open to a list of name → current value → submenu. It knows nothing about any particular domain; the AI-model case is one instance of it.",
		bestPractices: [
			{
				guidance: "do",
				description:
					'Put the current values in `summary`, not a noun. "5.6 Sol High" tells the reader where they are; a trigger reading "Settings" makes them open it to find out, which is the wrong trade for a control glanced at twenty times a session.',
			},
			{
				guidance: "do",
				description:
					"Give every SettingsRow a `value`. One glance at the open menu should answer every setting at once — a menu of bare names is a menu you have to explore.",
			},
			{
				guidance: "do",
				description:
					"Use `MenuRadioGroup` + `MenuRadioItem` inside a row for single-choice settings, so the current option is checked rather than merely remembered.",
			},
			{
				guidance: "do",
				description:
					'Reach for `variant="subtle"` when the trigger sits on a surface where a ghost control would float unanchored — inside a ChatComposer, for instance.',
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a single setting. One choice is a `Select`; the nesting only earns its cost when there are several related settings to summarise.",
			},
			{
				guidance: "dont",
				description:
					"Do not put actions in it. Rows change state; a menu that mixes \"Effort ›\" with \"Delete conversation\" makes destructive commands look like preferences. That is `Menu` or `OverflowMenu`.",
			},
			{
				guidance: "dont",
				description:
					"Do not nest more than one level deep. Past that the reader loses the path back, and the thing you have is a settings dialog wearing a menu.",
			},
			{
				guidance: "dont",
				description:
					"Do not override the upward, end-aligned default without reason. Its home is the bottom of a composer or toolbar, where a downward menu opens off-screen.",
			},
		],
		anatomy: [
			{
				name: "Trigger",
				required: true,
				description:
					"The summary control. States the current settings and carries a chevron; quiet at rest, so it does not compete with the primary action beside it.",
			},
			{
				name: "SettingsRow",
				required: true,
				description:
					"One setting: its name, its current value, and a submenu of options. Without children it renders flat, for a row that is a statement rather than a choice.",
			},
			{
				name: "Submenu contents",
				required: false,
				description:
					"Usually a MenuRadioGroup of MenuRadioItems, so the active option is checked.",
			},
		],
	},
	related: {
		components: ["Menu", "OverflowMenu", "Select", "ChatComposer", "Popover"],
		patterns: ["ChatPanel"],
	},
	props: [
		{
			name: "summary",
			type: "ReactNode",
			description:
				"What the trigger reads when closed. Give it the current values, not a noun — the control should answer before it is opened.",
		},
		{
			name: "label",
			type: "string",
			default: '"Change settings"',
			description:
				"Accessible name for the trigger, since the visible summary is data rather than a label.",
		},
		{
			name: "variant",
			type: '"ghost" | "subtle"',
			default: '"ghost"',
			description:
				"Resting treatment. `ghost` disappears into the surface at rest and shows its affordance on hover — right for a toolbar. `subtle` adds a fill for surfaces where a ghost trigger would float unanchored.",
		},
		{
			name: "size",
			type: '"xs" | "sm"',
			default: '"sm"',
			description:
				"Trigger height, read off the density ladder so a compact scope retunes it with every other control.",
		},
		{
			name: "side",
			type: '"top" | "bottom" | "inline-start" | "inline-end"',
			default: '"top"',
			description:
				"Which side the menu opens on. Upward by default — its home is the bottom of a composer.",
		},
		{
			name: "align",
			type: '"start" | "center" | "end"',
			default: '"end"',
			description: "Alignment along that side.",
		},
		{
			name: "disabled",
			type: "boolean",
			description: "Disable the trigger.",
		},
		{
			name: "...Menu props",
			type: "Omit<ComponentProps<typeof Menu>, 'children'>",
			description:
				"`open` / `defaultOpen` / `onOpenChange` and the rest of Base UI's menu root props.",
		},
	],
	subcomponents: [
		{
			name: "SettingsRow",
			type: "{ label: ReactNode; value?: ReactNode; disabled?: boolean; children?: ReactNode }",
			description:
				"One setting. With children it opens a submenu; without them it renders as a flat statement row.",
		},
		{
			name: "MenuRadioGroup",
			type: "{ value?: string; defaultValue?: string; onValueChange?: (value: string) => void }",
			description:
				"Single-choice group for a row's submenu. Exported from Menu; re-used here rather than duplicated.",
		},
		{
			name: "MenuRadioItem",
			type: "{ value: string; disabled?: boolean }",
			description:
				"One option, with a check in a reserved leading column so labels do not shift as the highlight moves.",
		},
	],
	variants: {
		variant: ["ghost", "subtle"],
		size: ["xs", "sm"],
	},
	tokensUsed: [
		"foreground",
		"muted",
		"muted-foreground",
		"accent",
		"accent-foreground",
		"popover",
		"popover-foreground",
		"border",
		"ring",
	],
	a11y: [
		"Base UI's Menu underneath, so roving focus, typeahead, Esc and outside-dismissal, and the full menu/menuitemradio ARIA wiring come for free — including submenu traversal with the arrow keys.",
		"The trigger carries an explicit `label`, because its visible text is the current state rather than a name: without it, a screen reader announces \"5.6 Sol High\" with no indication that it is a control or what it changes.",
		"Radio rows are `menuitemradio` with a real checked state, so the current choice is conveyed to assistive tech rather than only by a visible tick.",
		"The check occupies a reserved column instead of appearing on selection, so labels never shift sideways as the highlight moves — a change that reads as motion to anyone tracking position.",
		"Submenus open on the inline-end side, which flips correctly in RTL rather than always opening right.",
	],
	examples: [
		{
			label: "A model switcher in a composer",
			code: '<ChatComposer\n\tonSend={send}\n\tactions={\n\t\t<SettingsMenu variant="subtle" size="xs" summary={<><span className="text-foreground">{model.name}</span>{" "}<span className="text-muted-foreground">{effort}</span></>}>\n\t\t\t<SettingsRow label="Model" value={model.name}>\n\t\t\t\t<MenuRadioGroup value={model.id} onValueChange={setModelId}>\n\t\t\t\t\t<MenuRadioItem value="sol">5.6 Sol</MenuRadioItem>\n\t\t\t\t\t<MenuRadioItem value="lite">5.6 Lite</MenuRadioItem>\n\t\t\t\t</MenuRadioGroup>\n\t\t\t</SettingsRow>\n\t\t\t<SettingsRow label="Effort" value={effort}>\n\t\t\t\t<MenuRadioGroup value={effort} onValueChange={setEffort}>\n\t\t\t\t\t<MenuRadioItem value="Low">Low</MenuRadioItem>\n\t\t\t\t\t<MenuRadioItem value="High">High</MenuRadioItem>\n\t\t\t\t</MenuRadioGroup>\n\t\t\t</SettingsRow>\n\t\t</SettingsMenu>\n\t}\n/>',
		},
		{
			label: "Export options — the same shape, no chat involved",
			code: '<SettingsMenu summary={`${format} · ${quality}`} side="bottom" align="start">\n\t<SettingsRow label="Format" value={format}>\n\t\t<MenuRadioGroup value={format} onValueChange={setFormat}>\n\t\t\t<MenuRadioItem value="PNG">PNG</MenuRadioItem>\n\t\t\t<MenuRadioItem value="SVG">SVG</MenuRadioItem>\n\t\t</MenuRadioGroup>\n\t</SettingsRow>\n\t<SettingsRow label="Quality" value={quality}>\n\t\t<MenuRadioGroup value={quality} onValueChange={setQuality}>\n\t\t\t<MenuRadioItem value="Draft">Draft</MenuRadioItem>\n\t\t\t<MenuRadioItem value="Final">Final</MenuRadioItem>\n\t\t</MenuRadioGroup>\n\t</SettingsRow>\n</SettingsMenu>',
		},
		{
			label: "A flat row for a setting with nothing to choose",
			code: '<SettingsMenu summary="Standard">\n\t<SettingsRow label="Speed" value="Standard">\n\t\t<MenuRadioGroup value="standard">\n\t\t\t<MenuRadioItem value="standard">Standard</MenuRadioItem>\n\t\t\t<MenuRadioItem value="priority">Priority</MenuRadioItem>\n\t\t</MenuRadioGroup>\n\t</SettingsRow>\n\t<MenuSeparator />\n\t<SettingsRow label="Plan" value="Team" />\n</SettingsMenu>',
		},
	],
}
