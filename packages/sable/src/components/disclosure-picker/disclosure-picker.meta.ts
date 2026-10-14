import type { ComponentMeta } from "../../lib/meta"

export const disclosurePickerMeta: ComponentMeta = {
	name: "DisclosurePicker",
	summary:
		"A property row that names the current value and opens its list in place, beneath the row, instead of in a popup — for a tool panel or settings column where the choice is made while looking at what it changes. Built on Collapsible; the list is a listbox — arrow keys move, Enter or a click picks, applies and closes — and an optional search field filters long lists.",
	status: "stable",
	keywords: [
		"disclosure picker",
		"inline picker",
		"in-place select",
		"expanding list",
		"property row",
		"font picker",
		"preset picker",
		"inspector",
		"picker row",
	],
	usage: {
		description:
			"Use DisclosurePicker for one-of-many choices in a docked panel or inspector where a popup would cover the preview the choice is about: the row shows the current value (in its own face, with a tile, as the content warrants), and the list opens beneath it, pushing the panel down. Use Select for a form field or anywhere a popup is fine; use Combobox when people type to find an option among hundreds; use RadioGroup or RadioCard when every option should stay visible. Nothing applies while arrowing through the list — only Enter, Space or a click picks — so it suits choices with a cost (a confirm, a font load, a reset); where each option should apply as focus lands on it, that is a radio group (ThemeSelector, RadioGroup).",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Enable search (`search` on DisclosurePickerPanel) only for long lists — roughly a dozen options or more, i.e. once the list scrolls. A short list (a handful of presets) reads faster with no field to skip past; the panel then has no search row and no gap.",
			},
			{
				guidance: "do",
				description:
					"Show the value as the thing it is: a font row renders the family in its own face, a theme row leads with a ThemePreview tile in `media`. The row is a preview of the choice, not a label for it.",
			},
			{
				guidance: "do",
				description:
					'Use `size="xs"` in a property grid (a compact Density / PanelSection), where it sits on the inset panel-field fill beside ScrubField and an xs SelectTrigger. Keep `md` in a settings column or a simple panel.',
			},
			{
				guidance: "do",
				description:
					"When several rows share a panel, control `open` from the parent so only one list is open at a time — two open lists push each other and the preview out of view.",
			},
			{
				guidance: "do",
				description:
					"Use it for a choice with a cost — one that opens a confirm, loads something, or resets other settings. Arrow keys only move focus; onValueChange fires once, on Enter, Space or a click, and only when the pick differs from `value`.",
			},
			{
				guidance: "do",
				description:
					"Give options a leading visual with `media` (a ThemePreview tile, a swatch) instead of nesting another component's list: ThemeSelector's radio list applies each theme as the arrow keys land on it, which defeats commit-on-Enter. A list the picker cannot express (a Tree) can still close the row with `useDisclosurePicker().close()`.",
			},
			{
				guidance: "do",
				description:
					"Render DisclosurePickerEmpty in place of the list when a search matches nothing, not inside it — a listbox holds only options.",
			},
			{
				guidance: "dont",
				description:
					"Use it in a page-register form. A form field that pushes the form down on open reads as a layout jump; that is Select's job.",
			},
			{
				guidance: "dont",
				description:
					"Rebuild the row from a Collapsible with hand-copied classes. The disclosure, the well, the hover step, the xs field shell, focus return and scroll-into-view all live here; two hand copies of this row in one panel is how it came to exist.",
			},
			{
				guidance: "dont",
				description:
					"Turn search on for a short list just because the other rows have it. A search field over six options is a control with nothing to do.",
			},
		],
		anatomy: [
			{ name: "DisclosurePicker", required: true, description: "Root. Owns open state, size, focus return and scroll-into-view." },
			{ name: "DisclosurePickerTrigger", required: true, description: "The row: optional `label` caption, optional `media`, the value, and a chevron that flips when open." },
			{ name: "DisclosurePickerPanel", required: true, description: "What opens beneath the row: the opt-in search field, then the list." },
			{ name: "DisclosurePickerList", required: false, description: "A listbox of options that scrolls past 16rem. Arrow keys move; Enter, Space or a click picks." },
			{ name: "DisclosurePickerOption", required: false, description: "One option row, with optional leading media and trailing note. Chosen, it lifts out of the well; focused, it takes the ring." },
			{ name: "DisclosurePickerEmpty", required: false, description: "The no-match line, rendered in place of the list when a search filters everything out." },
		],
	},
	related: {
		components: ["Collapsible", "Select", "Combobox", "SearchInput", "RadioGroup", "ThemeSelector", "FontPicker", "PropertyRow"],
	},
	props: [
		{ name: "open", type: "boolean", description: "Controlled open state. Pair with onOpenChange." },
		{ name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial open state." },
		{ name: "onOpenChange", type: "(open: boolean) => void", description: "Called with the next open state — from the trigger, a pick, or Escape." },
		{
			name: "size",
			type: '"md" | "xs"',
			default: '"md"',
			description:
				"md is a --control-md row (40px comfortable) in a settings column, its own well when closed. xs is the property-grid rung: a --control-xs row on the inset panel-field fill with ui-tier type. Height, padding, radius, type and surface move together.",
		},
		{ name: "className", type: "string", description: "Merged onto the root (layout only — the look comes from size)." },
	],
	subcomponents: [
		{
			name: "DisclosurePickerTrigger",
			type: "{ label?: ReactNode; media?: ReactNode; children?: ReactNode } + Base UI Collapsible.Trigger props",
			description:
				"The row. `label` is a muted leading caption on a fixed column so stacked rows align; `media` a leading visual (a ThemePreview tile); children the value, truncated on one line. ArrowDown opens it, and steps into the list once open.",
		},
		{
			name: "DisclosurePickerPanel",
			type: "{ search?: { value: string; onValueChange(value: string): void; placeholder?: string; label?: string } } + Collapsible.Panel props",
			description:
				"Opens beneath the row. `search` opts in to a SearchInput above the list (off by default); it is controlled because the consumer filters, and it is cleared when the row closes. Escape clears a query first, then closes; ArrowDown in the field steps into the list.",
		},
		{
			name: "DisclosurePickerList",
			type: "{ value: string; onValueChange(value: string): void; aria-label?: string } + div props",
			description:
				"A listbox. ArrowUp/ArrowDown, Home/End and type-ahead move focus without applying anything (ArrowUp from the first option returns to the search field); Enter, Space or a click picks the focused option — onValueChange fires once, only when it differs from `value` — and closes the row. Escape closes without a pick.",
		},
		{
			name: "DisclosurePickerOption",
			type: "{ value: string; children?: ReactNode; media?: ReactNode; note?: ReactNode; disabled?: boolean; textValue?: string; onRemove?: () => void; removeLabel?: string }",
			description:
				"One option row. `media` is a leading visual (a ThemePreview tile); `note` a muted trailing annotation — options without one show a check when chosen. `disabled` skips it for the keyboard and refuses the pick; `textValue` is what type-ahead matches when the name is not plain text. `onRemove` makes the option removable — for entries the person added (an imported preset, a saved font): a trash glyph at the row's end on hover or focus (always on touch), and Delete or Backspace on the focused row; removing never picks, and focus moves to a neighbour first. `removeLabel` is the glyph's tooltip.",
		},
		{ name: "DisclosurePickerEmpty", type: "{ children?: ReactNode }", description: "The no-match line, rendered in place of the list." },
		{
			name: "useDisclosurePicker",
			type: "() => { open: boolean; close(): void; size: \"md\" | \"xs\" }",
			description: "For a list the picker does not own (a Tree) that should close the row when something is picked.",
		},
	],
	tokensUsed: ["foreground", "muted-foreground", "popover", "hairline", "panel-field", "panel-field-hover", "ring", "accent"],
	a11y: [
		"The trigger is a real <button>; Base UI wires aria-expanded and aria-controls to the panel. Its accessible name is its text (caption + value) unless an aria-label is given.",
		'The list is role="listbox" with role="option" rows; aria-selected marks the committed value, not the focused row, so a screen reader hears both where focus is and what is chosen. Selection does not follow focus: ArrowUp/ArrowDown, Home/End and type-ahead move focus (roving tabindex — one tab stop, so Tab leaves the list in one step) and apply nothing; Enter, Space or a click picks, applies and closes. Disabled options carry aria-disabled and are skipped.',
		"Why a listbox and not a radio group: a radio group's checked state follows focus, so every arrow press would be a pick — wrong for a choice that opens a confirm, loads a font or resets settings. Base UI ships no standalone listbox (Select is popup-only, Combobox's inline list is focus-in-the-input, Composite is internal), so the keyboard model lives here.",
		"Opening from the keyboard (Enter, Space, ArrowDown) moves focus into the panel: the search field when there is one, otherwise the chosen option (or the first). A pointer open focuses the search field on a fine pointer only, so touch does not raise the on-screen keyboard.",
		"Escape closes the row without changing the value (clearing a query first) and returns focus to the trigger; a pick does the same. Focus is not pulled back when it has already moved on, e.g. to a confirm dialog the pick opened.",
		"A removable option (onRemove) announces aria-keyshortcuts=\"Delete\"; Delete or Backspace removes it and focus moves to the next option (or the previous). The trash glyph is a pointer target only (aria-hidden, not focusable): an option's children are presentational, so a nested button would be unreachable by assistive tech anyway.",
		"The panel animates with motion-disclosure, which is static under prefers-reduced-motion or MotionProvider off; the scroll that keeps the row in view is instant, never smooth.",
	],
	motion: [
		{ slot: "arrival", recipe: "none", part: "root", why: "A property row is present from first paint; animating it in would stage chrome the user is already scanning." },
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "DisclosurePickerTrigger",
			why: "The row reads as a value, not a button; the hover step is what says it opens before it is clicked.",
		},
		{
			slot: "transition",
			recipe: "motion-disclosure",
			part: "DisclosurePickerPanel",
			why: "The list pushes the panel down; growing its height ties the movement below to this row rather than to a layout jump.",
		},
		{ slot: "activity", recipe: "none", part: "root", why: "Nothing is indeterminate: the options are resident. A list that loads should show its own loader inside the panel." },
	],
	examples: [
		{
			label: "A short list — no search",
			code: `const [preset, setPreset] = useState("comfortable")
const [open, setOpen] = useState(false)
<DisclosurePicker open={open} onOpenChange={setOpen} className="w-72">
  <DisclosurePickerTrigger label="Density">{preset === "compact" ? "Compact" : "Comfortable"}</DisclosurePickerTrigger>
  <DisclosurePickerPanel>
    <DisclosurePickerList aria-label="Density" value={preset} onValueChange={setPreset}>
      <DisclosurePickerOption value="comfortable">Comfortable</DisclosurePickerOption>
      <DisclosurePickerOption value="compact">Compact</DisclosurePickerOption>
    </DisclosurePickerList>
  </DisclosurePickerPanel>
</DisclosurePicker>`,
		},
		{
			label: "A long list — search opted in",
			code: `const COUNTRIES = ["Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Denmark", "Finland", "France", "Germany", "Ireland", "Italy", "Japan", "Mexico", "Norway", "Portugal", "Spain", "Sweden"]
const [country, setCountry] = useState("Canada")
const [query, setQuery] = useState("")
const shown = COUNTRIES.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
<DisclosurePicker className="w-72">
  <DisclosurePickerTrigger label="Country">{country}</DisclosurePickerTrigger>
  <DisclosurePickerPanel search={{ value: query, onValueChange: setQuery, placeholder: \`Search \${COUNTRIES.length} countries\` }}>
    {shown.length > 0 ? (
      <DisclosurePickerList aria-label="Country" value={country} onValueChange={setCountry}>
        {shown.map((name) => (
          <DisclosurePickerOption key={name} value={name}>{name}</DisclosurePickerOption>
        ))}
      </DisclosurePickerList>
    ) : (
      <DisclosurePickerEmpty>No countries match “{query}”.</DisclosurePickerEmpty>
    )}
  </DisclosurePickerPanel>
</DisclosurePicker>`,
		},
		{
			label: "A theme picker — media tiles, commit on Enter",
			code: `const { themeId, setThemeId, themes, mode } = useSableTheme()
const current = themes.find((theme) => theme.id === themeId)
<DisclosurePicker>
  <DisclosurePickerTrigger aria-label={\`Theme: \${current?.label}\`} media={current ? <ThemePreview theme={current} mode={mode} size="sm" /> : null}>
    {current?.label}
  </DisclosurePickerTrigger>
  <DisclosurePickerPanel>
    <DisclosurePickerList aria-label="Theme" value={themeId} onValueChange={setThemeId}>
      {themes.map((theme) => (
        <DisclosurePickerOption key={theme.id} value={theme.id} media={<ThemePreview theme={theme} mode={mode} size="sm" />}>
          {theme.label}
        </DisclosurePickerOption>
      ))}
    </DisclosurePickerList>
  </DisclosurePickerPanel>
</DisclosurePicker>`,
		},
		{
			label: "Property-grid rung",
			code: `const [blend, setBlend] = useState("normal")
<Density value="compact" className="w-64">
  <DisclosurePicker size="xs">
    <DisclosurePickerTrigger label="Blend">{blend}</DisclosurePickerTrigger>
    <DisclosurePickerPanel>
      <DisclosurePickerList aria-label="Blend mode" value={blend} onValueChange={setBlend}>
        <DisclosurePickerOption value="normal">normal</DisclosurePickerOption>
        <DisclosurePickerOption value="multiply">multiply</DisclosurePickerOption>
        <DisclosurePickerOption value="screen">screen</DisclosurePickerOption>
      </DisclosurePickerList>
    </DisclosurePickerPanel>
  </DisclosurePicker>
</Density>`,
		},
	],
}
