import type { ComponentMeta } from "../../lib/meta"

export const meterMeta: ComponentMeta = {
	name: "Meter",
	summary:
		"A role=meter reading over Base UI Meter, drawn as a bar or a ring — how full something is within a known range (storage, quota, strength), with a tone for good/caution/bad. Not task progress.",
	status: "stable",
	keywords: [
		"meter",
		"usage bar",
		"storage",
		"quota",
		"capacity",
		"limit",
		"password strength",
		"level",
	],
	usage: {
		description:
			"Use Meter to show a static measurement against a known maximum — storage used, seats taken, API quota, password strength. It is announced as a meter, not a progress bar, so a screen-reader user hears a level rather than a task underway.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Label it and show the reading in units people use (\"7.2 of 10 GB\"), with MeterLabel and MeterValue. The bar shows proportion; the number is what gets acted on.",
			},
			{
				guidance: "do",
				description:
					"Pick `tone` from thresholds you own and apply them consistently across the page — warning near the limit, destructive at or over it. The component does not guess where good becomes bad.",
			},
			{
				guidance: "dont",
				description:
					"Do not use Meter for a task in flight — an upload, an install, a step count. That is Progress; Meter tells assistive tech nothing is happening.",
			},
			{
				guidance: "dont",
				description:
					"Do not use it for a value without a meaningful maximum (followers, total spend). A bar implies a full scale; an unbounded count is a stat.",
			},
			{
				guidance: "do",
				description:
					"Use shape=\"ring\" when the reading is a score that belongs in a small, glanceable spot on a card. It is the same measurement drawn as a circular gauge, not a different component.",
			},
		],
		anatomy: [
			{
				name: "MeterTrack",
				required: true,
				description: "The rail that represents the full range.",
			},
			{
				name: "MeterIndicator",
				required: true,
				description: "The fill, sized from value and coloured by tone.",
			},
			{
				name: "MeterLabel",
				required: false,
				description: "The visible name; also names the meter for assistive tech.",
			},
			{
				name: "MeterValue",
				required: false,
				description: "The formatted reading.",
			},
		],
	},
	related: {
		components: ["Progress", "Badge"],
	},
	props: [
		{
			name: "value",
			type: "number",
			description: "The current reading, between min and max. Required.",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			description: "The bottom of the range.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			description: "The top of the range.",
		},
		{
			name: "tone",
			type: '"primary" | "3" | "success" | "warning" | "destructive"',
			default: '"primary"',
			description: "Fill colour, mapped to a semantic token. Choose it from your own thresholds.",
		},
		{
			name: "shape",
			type: '"bar" | "ring"',
			default: '"bar"',
			description: "bar is a horizontal track; ring is a circular gauge for a small, glanceable reading — the same value, min, max and tones.",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: "Ring diameter (40 / 64 / 96px at the default spacing; the centre value steps with it), or bar thickness on the same sm / md / lg rails as Progress.",
		},
		{
			name: "showValue",
			type: "boolean",
			description: "Print the value in the ring's centre (formatted like MeterValue).",
		},
		{
			name: "strokeWidth",
			type: "number",
			default: "6",
			description: "Ring stroke width, in viewBox units of 100.",
		},
		{
			name: "format",
			type: "Intl.NumberFormatOptions",
			description: "Formatting for MeterValue and aria-valuetext (percent, unit, currency).",
		},
		{
			name: "getAriaValueText",
			type: "(formatted: string, value: number) => string",
			description: "Human-readable reading for assistive tech (\"7.2 of 10 gigabytes used\").",
		},
		{
			name: "locale",
			type: "Intl.LocalesArgument",
			description: "Locale for formatting. Defaults to the runtime locale.",
		},
	],
	subcomponents: [
		{
			name: "MeterTrack",
			type: "Base UI Track props + className + size",
			description: "The rail. Rendered automatically when Meter has no children; renders a MeterIndicator by default.",
		},
		{
			name: "MeterIndicator",
			type: "Base UI Indicator props + className + tone",
			description: "The fill. Inherits the Meter's tone unless given its own.",
		},
		{
			name: "MeterLabel",
			type: "Base UI Label props + className",
			description: "Visible label; wires aria-labelledby on the root.",
		},
		{
			name: "MeterValue",
			type: "Base UI Value props + className",
			description: "Formatted reading. Accepts a `(formatted, value) => ReactNode` child.",
		},
	],
	variants: {
		tone: ["primary", "3", "success", "warning", "destructive"],
		shape: ["bar", "ring"],
		size: ["sm", "md", "lg"],
	},
	tokensUsed: [
		"secondary",
		"primary",
		"success",
		"tone-warning",
		"destructive",
		"foreground",
		"muted-foreground",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Meter",
			why: "A meter is a reading, present with the page that reports it. Animating the fill up from zero on load would act out a change that did not happen.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Meter",
			why: "It reports and accepts no input. A bar that reacted to the pointer would read as a Slider the user could drag.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "MeterIndicator",
			why: "Width and colour ease on the motion tokens (no recipe animates width) when the reading changes — freeing space after a delete visibly shrinks the bar, so the user sees the cause and effect rather than a different bar.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "Meter",
			why: "A meter has no indeterminate state; a reading is either known or not shown. Unknown-but-working is Progress with no value.",
		},
	],
	a11y: [
		"Base UI renders role=meter with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext — distinct from Progress's role=progressbar.",
		"Name it with MeterLabel or aria-label; an unnamed meter is announced as a bare number.",
		"Tone is colour only. Say the state in text too (\"Almost full\") when it matters, and use getAriaValueText to give units.",
	],
	examples: [
		{
			label: "Ring",
			code: '<Meter shape="ring" value={72} showValue aria-label="Storage used" />',
		},
		{
			label: "Bare",
			code: '<Meter value={64} aria-label="Storage used" />',
		},
		{
			label: "Storage with label and reading",
			code: `<Meter value={7.2} max={10} tone="warning" getAriaValueText={(_, v) => \`\${v} of 10 gigabytes used\`}>
	<div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
		<MeterLabel>Storage</MeterLabel>
		<MeterValue>{(_, value) => \`\${value} of 10 GB\`}</MeterValue>
	</div>
	<MeterTrack />
</Meter>`,
		},
		{
			label: "Tones",
			code: `<div className="flex flex-col gap-3">
	<Meter value={30} tone="success" aria-label="Seats used" />
	<Meter value={82} tone="warning" aria-label="API quota used" />
	<Meter value={100} tone="destructive" aria-label="Storage used" />
</div>`,
		},
	],
}
