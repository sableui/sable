import type { ComponentMeta } from "../../lib/meta"

export const sliderFieldMeta: ComponentMeta = {
	name: "SliderField",
	summary:
		"A slider drawn as a field: the whole box is the track, the fill is the value's share of the range, and the number sits inside it. Double-click, Enter or a typed digit turns the readout into a text input.",
	status: "stable",
	keywords: [
		"slider",
		"fill",
		"field",
		"numeric",
		"number",
		"range",
		"property",
		"inspector",
		"toolbar",
		"workspace",
		"unit",
	],
	usage: {
		description:
			"Use SliderField for a bounded number in a panel, an inspector or a toolbar: opacity, strength, a resolution. It does the work of a Slider with a ScrubField beside it in one control, and the drag target is the full field instead of a 6px rail. The fill only means something between two bounds, so a number without them (an X offset, a seed) stays a ScrubField. In a form where the slider is the main control and its row has room, a Slider reads lighter.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give it real bounds. The fill is the value's share of min to max, so the range has to be one a reader would recognise: 0 to 100%, 0 to 20px.",
			},
			{
				guidance: "do",
				description:
					'Pass the unit as `suffix`. It renders after the number, and a string suffix is spoken with the value ("60%").',
			},
			{
				guidance: "do",
				description:
					"Match the rung of the row: `xs` in a property grid beside ScrubField and an xs SelectTrigger, `sm` in a toolbar, `md` in a form.",
			},
			{
				guidance: "do",
				description:
					"Give every field in a property grid the same width (w-36 in a 260px panel), so the fills share one scale and their ends line up down the column.",
			},
			{
				guidance: "do",
				description:
					"Record undo in onValueCommitted. onValueChange fires on every frame of a drag, so an undo entry there rewinds one pixel at a time.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a number with no upper or lower bound. With invented bounds the fill reports a share of nothing; use ScrubField.",
				instead: ["ScrubField"],
			},
			{
				guidance: "dont",
				description:
					"Do not put a ScrubField or NumberField beside it for the exact value. It already takes one: double-click, Enter or type.",
			},
			{
				guidance: "dont",
				description: "Do not use it for a range with two ends. It has one value; a range is a Slider with an array value.",
				instead: ["Slider"],
			},
		],
	},
	related: {
		components: ["Slider", "ScrubField", "NumberField", "PanelSection", "Toolbar"],
	},
	props: [
		{ name: "value", type: "number", description: "Controlled value." },
		{ name: "defaultValue", type: "number", default: "min", description: "Uncontrolled initial value." },
		{
			name: "onValueChange",
			type: "(next: number) => void",
			description: "Fires on every change: each frame of a drag, each key step, a typed commit.",
		},
		{
			name: "onValueCommitted",
			type: "(next: number) => void",
			description:
				"Fires once when a change settles: the drag is released, a key step lands, a typed value is committed or reverted. Record an undo entry here.",
		},
		{ name: "min", type: "number", default: "0", description: "Lower bound, and the empty end of the fill." },
		{ name: "max", type: "number", default: "100", description: "Upper bound, and the full end of the fill." },
		{
			name: "step",
			type: "number",
			default: "1",
			description:
				"Drag and arrow-key increment, and the source of the displayed precision: 0.01 shows 0.25. A typed value is clamped to the bounds and rounded to this precision, not snapped to a multiple.",
		},
		{
			name: "label",
			type: "string",
			description: "Accessible name for the slider and for the input that replaces the readout while typing. Required.",
		},
		{ name: "icon", type: "string", description: "Semantic icon name shown at the start of the field. Decorative." },
		{
			name: "prefix",
			type: "ReactNode",
			description: "Short text at the start of the field in place of an icon, for a toolbar with no label beside the control.",
		},
		{
			name: "suffix",
			type: "ReactNode",
			description: 'Unit shown after the value ("%", "px"). A string is also spoken with the value.',
		},
		{
			name: "size",
			type: '"md" | "sm" | "xs"',
			default: '"md"',
			description:
				"The field ladder shared with Input, SelectTrigger and DatePicker. md is the form field, sm the toolbar field, xs the borderless property-grid rung beside ScrubField.",
		},
		{ name: "disabled", type: "boolean", description: "Ignores the pointer and keyboard, dims the field and submits nothing." },
		{ name: "name", type: "string", description: "Submits the value with a form under this name." },
		{ name: "form", type: "string", description: "Id of a form elsewhere on the page that the value belongs to." },
		{ name: "className", type: "string", description: "Sizes the field (w-36, flex-1). Defaults to w-full with a 7rem floor, so in a slot sized by its content (a PropertyRow's control side) it draws at the floor until given a width." },
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "It arrives with the panel row or toolbar it sits in.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Root",
			why: "The shell eases its hover step and focus ring like every field on the same rung.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Grip",
			why: "The grip on the fill's leading edge comes up to full strength while the field is hovered or dragged. It is the mark that says the fill can be taken hold of, so it answers the pointer before the press.",
		},
		{
			slot: "transition",
			recipe: "motion-glide",
			part: "Fill",
			why: "A jump glides: a press on the track, a key step or a typed value moves the fill and handle to the new place on the emphasized ease, so it reads as one value moving and not two states swapping. In a drag the fill follows the pointer with no transition, since an eased fill would show a value already left. The grip alone trails a moment behind a growing fill, like something towed on a short line; a shrinking fill pushes it along at once, so the grip is never left outside the fill.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Root",
			why: "A slider commits as it moves; there is nothing to wait for.",
		},
	],
	a11y: [
		"Base UI provides role=slider with aria-valuemin/max/now and arrow, Page Up/Down and Home/End control; `label` names it.",
		"A string suffix is spoken with the value through aria-valuetext, so a screen reader hears 60% and not 60.",
		"Every value is reachable from the keyboard two ways: step with the arrows, or press Enter (or type a digit) to open the text input. Enter commits it, Escape reverts, blur commits, and focus returns to the slider.",
		"After a double-click, Escape restores the value from before the first press, which had already moved it.",
		"The focus ring is on the field, raised by has-[:focus-visible], because the focusable element is the range input nested in the thumb.",
		"The visible readout and unit are aria-hidden; the slider announces the value once.",
		"It takes no id, so a label's htmlFor cannot point at it. `label` is the name; inside a Field, Base UI wires the Field's label to the slider.",
	],
	tokensUsed: ["foreground", "muted-foreground", "ring", "field", "field-border", "panel-field", "panel-field-hover"],
	examples: [
		{
			label: "In a property row",
			code: `<PropertyRow label="Strength">
  <SliderField size="xs" label="Strength" suffix="px" value={strength} min={0} max={20} onValueChange={setStrength} className="w-36" />
</PropertyRow>`,
		},
		{
			label: "Fractional step",
			code: '<SliderField size="xs" label="Falloff" value={falloff} min={0} max={2} step={0.1} onValueChange={setFalloff} className="w-36" />',
		},
		{
			label: "In a toolbar, with the name inside the field",
			code: '<SliderField size="sm" label="Opacity" prefix="Opacity" suffix="%" defaultValue={80} className="w-44" />',
		},
		{
			label: "Undo on commit",
			code: '<SliderField label="Brightness" suffix="%" value={brightness} onValueChange={setBrightness} onValueCommitted={(v) => history.push({ brightness: v })} />',
		},
	],
}
