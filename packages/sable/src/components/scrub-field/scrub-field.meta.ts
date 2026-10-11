import type { ComponentMeta } from "../../lib/meta"

export const scrubFieldMeta: ComponentMeta = {
	name: "ScrubField",
	summary:
		"The compact numeric field a property grid is built from: a leading glyph inside the field that doubles as a drag-to-scrub handle, the value, and an optional unit.",
	keywords: [
		"scrub",
		"numeric",
		"number",
		"field",
		"property",
		"inspector",
		"drag",
		"workspace",
		"tool",
		"unit",
	],
	usage: {
		description:
			"Use ScrubField for numeric properties in tool chrome — an inspector, a property grid, a panel. The leading icon or letter says what the number is and is also the thing you drag, which is why a value like opacity needs no slider. Reach for NumberField instead in page-register forms: it has steppers and locale formatting, and it renders at page-register height. Those two steppers put a ~112px floor on a control that needs to be about 44px in a property grid, which is why ScrubField exists rather than a NumberField size variant. The input is sized in ch, so each field is as wide as its longest value and a grid of them lines up without per-field tuning.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Give the field an icon or prefix when it stands alone, so the row has a drag affordance and the value has an identity.",
			},
			{
				guidance: "do",
				description:
					"Pass the unit as `suffix` rather than baking it into the label — it renders against the number the way reference tools show 100%.",
			},
			{
				guidance: "do",
				description:
					"Bracket undo with onGestureStart/onGestureEnd. A scrub fires per frame, so without it one undo rewinds a single pixel of the drag.",
			},
			{
				guidance: "do",
				description:
					"Set `step` to the real precision (0.01 for a normalised threshold). Display precision follows it, so a seed shows 1234 and never 1,234.",
			},
			{
				guidance: "dont",
				description:
					"Add a separate drag gripper beside the glyph. The icon or prefix already is the scrub handle; a second one is the same affordance twice and costs width a 240px panel does not have.",
			},
			{
				guidance: "dont",
				description:
					"Pair it with a Slider AND give it a glyph. The slider is already the drag affordance; two on one row is the same gesture twice. Omit icon/prefix when there's a slider.",
			},
			{
				guidance: "dont",
				description:
					"Use it in a page form. It is chrome-sized and has no label, description, or error slots — that's Field plus Input or NumberField.",
			},
		],
	},
	related: {
		components: ["NumberField", "Slider", "PanelSection", "Workspace", "Input"],
	},
	status: "stable",
	props: [
		{ name: "value", type: "number", description: "The current value (controlled)." },
		{
			name: "onValueChange",
			type: "(next: number) => void",
			description: "Fires on commit, arrow-key step, and every frame of a scrub.",
		},
		{ name: "min", type: "number", description: "Lower clamp, applied to typing and scrubbing." },
		{ name: "max", type: "number", description: "Upper clamp, applied to typing and scrubbing." },
		{
			name: "step",
			type: "number",
			default: "1",
			description:
				"Arrow-key and scrub increment, and the source of display precision. Shift multiplies arrows by 10 and divides scrubbing by 10.",
		},
		{
			name: "label",
			type: "string",
			description: "Accessible name for the input. Required — the visible glyph is decorative.",
		},
		{
			name: "icon",
			type: "string",
			description:
				"Semantic icon name rendered inside the field; doubles as the scrub handle. Any name the app's IconProvider resolves works — image tools typically supply their own checkerboard glyph for opacity, which is a domain icon rather than one Sable's contract carries.",
		},
		{
			name: "prefix",
			type: "ReactNode",
			description: 'Short text used instead of an icon (e.g. "X" / "Y"), with the same scrub role.',
		},
		{
			name: "suffix",
			type: "ReactNode",
			description: 'Unit rendered after the value inside the field (e.g. "%", "px").',
		},
		{
			name: "onGestureStart",
			type: "() => void",
			description: "Fires once when a scrub drag begins — open an undo transaction here, and drop expensive downstream work (e.g. a GPU renderer) to a cheap preview quality; without it a pipeline re-renders at full quality on every pointer move and the drag stutters.",
		},
		{
			name: "onGestureEnd",
			type: "() => void",
			description: "Fires when a scrub drag ends — close the undo transaction here and restore full render quality.",
		},
		{ name: "disabled", type: "boolean", description: "Disables typing and scrubbing." },
		{ name: "id", type: "string", description: "Input id, for a PropertyRow's htmlFor." },
	],
	a11y: [
		"The input carries the accessible name via `label`; the glyph is aria-hidden because it is decorative.",
		"Every scrub gesture is reachable from the keyboard: ArrowUp/ArrowDown step by `step`, Shift+Arrow by ten steps.",
		"Enter commits, Escape reverts to the last committed value, and blur commits — so a partial edit is never silently kept.",
	],
	tokensUsed: ["foreground", "muted-foreground", "ring", "panel-field", "panel-field-hover"],
	examples: [
		{
			label: "Opacity with a glyph handle",
			code: '<ScrubField label="Opacity" icon="grid" suffix="%" value={60} min={0} max={100} onValueChange={(v) => setOpacity(v)} />',
		},
		{
			label: "X/Y offset pair (PropertyPair puts two fields on one scan line)",
			code: `<PropertyPair labels={["Offset X", "Offset Y"]}>
  <ScrubField label="Offset X" prefix="X" value={x} min={-128} max={128} onValueChange={setX} />
  <ScrubField label="Offset Y" prefix="Y" value={y} min={-128} max={128} onValueChange={setY} />
</PropertyPair>`,
		},
		{
			label: "No glyph — the property name is the handle",
			code: `<PropertyRow label="Block size" scrub={{ value: size, onValueChange: setSize, min: 2, max: 256 }}>
  <ScrubField label="Block size" value={size} min={2} max={256} suffix="px" onValueChange={setSize} />
</PropertyRow>`,
		},
		{
			label: "Paired with a slider (no glyph — one drag affordance per row)",
			code: `<PropertyRow label="Block size" stacked>
  <div className="flex items-center gap-2">
    <Slider value={32} min={4} max={256} className="min-w-0 flex-1" />
    <ScrubField label="Block size" value={32} min={4} max={256} step={1} suffix="px" className="w-16 shrink-0" onValueChange={(v) => setBlockSize(v)} />
  </div>
</PropertyRow>`,
		},
	],
}
