import type { ComponentMeta } from "../../lib/meta"

export const panelSectionMeta: ComponentMeta = {
	name: "PanelSection",
	summary:
		"A flush group of property rows inside a docked panel — eyebrow header, hairline separator, rows beneath. The workspace register's answer to Card, which does not belong in a panel.",
	keywords: [
		"panel",
		"section",
		"inspector",
		"properties",
		"property grid",
		"workspace",
		"tool",
		"chrome",
		"sidebar",
	],
	usage: {
		description:
			"Use PanelSection to group properties inside an inspector or docked panel, with PropertyRow for one label-plus-control line and PropertyPair for two controls side by side. This is the workspace register's grouping primitive: it separates with a hairline and nothing else, because a Card inside a 240px panel spends its border and inset on nothing and pushes every row inward.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Group related properties under a short functional title — Blending, Layout, Fill — the way a tool inspector names its sections.",
			},
			{
				guidance: "do",
				description:
					"Reach for PropertyPair before giving each property its own full-width row; pairing halves the vertical cost in a narrow panel.",
			},
			{
				guidance: "do",
				description:
					"Put a section-scoped control (a visibility toggle, an add action) in the action slot rather than inventing a second header row.",
			},
			{
				guidance: "dont",
				description:
					"Wrap panel content in Card. Cards are page-register furniture; in a panel they read as a page pasted into chrome.",
			},
			{
				guidance: "dont",
				description:
					"Repeat the panel's own title as the section title. If the header above already names the selection, title the section by what it controls (Parameters, Blending).",
			},
			{
				guidance: "dont",
				description:
					"Hand-roll a property line (`<div className=\"flex justify-between\"><span>Opacity</span><Slider /></div>`). Use PropertyRow for every label-plus-control line: when each property type invents its own arrangement, a panel of fifteen properties ends up with fifteen layouts.",
			},
			{
				guidance: "dont",
				description:
					"Use PropertyRow for page forms — use Field, which carries label/description/error semantics. PropertyRow is a dense chrome row, not a form control.",
			},
		],
		anatomy: [
			{
				name: "Header",
				required: true,
				description:
					"The section title in the UI section tier, with an optional trailing action.",
			},
			{
				name: "PropertyRow",
				required: false,
				description:
					"One property: label left, control right. `stacked` moves the control to its own line for full-width controls.",
			},
			{
				name: "PropertyPair",
				required: false,
				description: "Two controls side by side, with optional captions above each.",
			},
			{
				name: "PropertyGroup",
				required: false,
				description:
					"A set of properties folded behind one row that names the group and summarises its value, opening with +/− to the controls beneath.",
			},
		],
	},
	related: {
		components: ["Workspace", "PanelGroup", "ScrubField", "StatusBar", "Field", "Card"],
	},
	status: "stable",
	props: [
		{
			name: "title",
			type: "ReactNode",
			description: "Section name, rendered as the header in the UI section tier.",
		},
		{
			name: "action",
			type: "ReactNode",
			description:
				"Optional trailing control in the header — a visibility toggle, an add action.",
		},
	],
	subcomponents: [
		{
			name: "PropertyRow",
			type: "{ label: ReactNode; htmlFor?: string; hint?: string; stacked?: boolean; scrub?: { value, onValueChange, step?, min?, max?, onGestureStart?, onGestureEnd?, disabled? } }",
			description:
				"One property line. `hint` becomes the label's hover explanation; `stacked` puts the control on its own line. `scrub` makes the property NAME a drag handle for its value — the Figma/Framer/Paper convention, and the answer for a numeric row with no honest glyph to put in a ScrubField (a schema-generated `levels` or `seed`, where a `#` would be noise pretending to be meaning). Opt-in and additive: a row without it is unchanged. The label stays a real `<label htmlFor>` — a 2px jitter threshold keeps a click a click, and the click synthesised after a real drag is swallowed so a scrub does not also select the field's text.",
		},
		{
			name: "PropertyPair",
			type: "{ labels?: [ReactNode, ReactNode] }",
			description:
				"Two controls side by side in a 2-up grid, with optional captions above each.",
		},
		{
			name: "PropertyGroup",
			type: "{ label: ReactNode; summary?: ReactNode; defaultOpen?: boolean; open?: boolean; onOpenChange?: (open: boolean) => void }",
			description:
				"A collapsible set of properties inside a section, at the panel's scale (an Accordion is page furniture). The row shows the label, then the summary (the group's value, readable while closed: a word, a few swatches, or both), then a + that turns to − when open. Groups open independently and stack with a hairline between them. Built on Collapsible.",
		},
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "Sections are part of the inspector they sit in and arrive with it. Animating each in would make a panel switch look like a page load.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "PropertyGroup trigger",
			why: "The fold row eases its focus ring, so arrowing down a dense inspector shows where the keyboard is without the ring flickering from row to row.",
		},
		{
			slot: "transition",
			recipe: "motion-disclosure",
			part: "PropertyGroup panel",
			why: "The group opens by easing its height, so the rows below slide down to make room instead of jumping. In an inspector, the next section moving is otherwise how you lose your place.",
		},
		{
			slot: "transition",
			recipe: "motion-icon-swap",
			part: "PropertyGroup indicator",
			why: "The + collapses into − as the group opens, both glyphs stacked as one mark, so the indicator reads as this row changing state rather than a different icon landing.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "The inspector edits values in place; nothing in it loads.",
		},
	],
	a11y: [
		"PropertyGroup's row is a real button with aria-expanded (Collapsible); its summary is part of the button's name, so a closed group still announces its value.",
		"PropertyRow renders a real <label>; pass htmlFor with the control's id so clicking the label focuses it.",
		"The section title is an h3, so panels contribute a real heading outline rather than styled divs.",
		"`hint` is exposed as the label's title attribute — keep the essential meaning in the label itself, since title text is not reliably announced.",
		"A `scrub` label does not replace keyboard editing and must not be the only way to set the value: the drag is a pointer affordance, so the control it names still has to accept typing and arrow keys. It also keeps its `htmlFor` behaviour, which is the reason the gesture arms on a 2px threshold rather than on pointerdown.",
	],
	tokensUsed: ["foreground", "muted-foreground", "hairline"],
	examples: [
		{
			label: "Groups that fold behind their value",
			code: `<PanelSection title="Color">
  <PropertyGroup label="Tones" summary="Brand only">
    <PropertyRow label="Scheme">
      <Select value="brand">
        <SelectTrigger size="xs" />
        <SelectContent>
          <SelectItem value="brand">Brand only</SelectItem>
          <SelectItem value="harmonize">Harmonize</SelectItem>
        </SelectContent>
      </Select>
    </PropertyRow>
  </PropertyGroup>
  <PropertyGroup label="Grid" summary="8px">
    <PropertyRow label="Size">
      <ScrubField label="Grid size" value={8} min={1} max={64} suffix="px" />
    </PropertyRow>
  </PropertyGroup>
</PanelSection>`,
		},
		{
			label: "Blending section, 2-up",
			code: `<PanelSection title="Blending">
  <PropertyPair>
    <ScrubField label="Opacity" value={100} min={0} max={100} suffix="%" />
    <Select value="normal">
      <SelectTrigger size="xs" />
      <SelectContent>
        <SelectItem value="normal">Normal</SelectItem>
        <SelectItem value="multiply">Multiply</SelectItem>
      </SelectContent>
    </Select>
  </PropertyPair>
</PanelSection>`,
		},
		{
			label: "Rows with a stacked slider",
			code: `<PanelSection title="Parameters">
  <PropertyRow label="Block size" hint="Block edge length in reference pixels." stacked>
    <Slider value={32} min={4} max={256} />
  </PropertyRow>
  <PropertyRow label="Direction">
    <Select value="both">
      <SelectTrigger size="xs" />
      <SelectContent>
        <SelectItem value="both">Both</SelectItem>
        <SelectItem value="horizontal">Horizontal</SelectItem>
      </SelectContent>
    </Select>
  </PropertyRow>
  <PropertyRow label="Reverse">
    <Switch checked={false} />
  </PropertyRow>
</PanelSection>`,
		},
		{
			label: "Section with a header action",
			code: `<PanelSection
  title="Blending"
  action={
    <Button size="icon-xs" variant="ghost" aria-label="Hide layer">
      <Icon name="eye" />
    </Button>
  }
>
  <PropertyRow label="Opacity">
    <ScrubField label="Opacity" value={60} min={0} max={100} suffix="%" />
  </PropertyRow>
</PanelSection>`,
		},
	],
}
