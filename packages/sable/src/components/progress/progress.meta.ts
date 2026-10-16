import type { ComponentMeta } from "../../lib/meta"

export const progressMeta: ComponentMeta = {
	name: "Progress",
	summary:
		"Linear progress bar over Base UI Progress — value 0–100 drives the fill; omit value (or pass null) for an indeterminate, pulsing bar.",
	status: "stable",
	keywords: [
		"progress",
		"task progress",
		"meter",
		"loading",
	],
	usage: {
		description: "Use Progress to communicate determinate or indeterminate completion for a task or process.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use determinate values when progress can be measured.",
			},
			{
				guidance: "do",
				description: "Pair the visual indicator with text when users need context or exact values.",
			},
			{
				guidance: "dont",
				description: "Do not use Progress as a decorative divider or status color bar.",
			},
			{
				guidance: "dont",
				description: "Do not use a determinate Progress for an unknown duration. A bar that sits at 90% is worse than a Spinner, because it makes a promise about time that you cannot keep.",
				instead: ["Spinner"],
			},
		],
		anatomy: [
			{
				name: "ProgressTrack",
				required: true,
				description: "The background track that defines the range.",
			},
			{
				name: "ProgressIndicator",
				required: true,
				description: "The filled or animated progress indicator.",
			},
			{
				name: "ProgressLabel",
				required: false,
				description: "A text label for the progress task.",
			},
			{
				name: "ProgressValue",
				required: false,
				description: "A readable value such as 45 percent.",
			},
		],
	},
	related: {
		components: [
			"Spinner",
			"Skeleton",
		],
	},
	props: [
		{
			name: "value",
			type: "number | null",
			default: "null",
			description:
				"Current value between min and max. null (or omitted) renders the indeterminate state.",
		},
		{
			name: "min",
			type: "number",
			default: "0",
			description: "The minimum value of the range.",
		},
		{
			name: "max",
			type: "number",
			default: "100",
			description: "The maximum value of the range.",
		},
		{
			name: "format",
			type: "Intl.NumberFormatOptions",
			description:
				"Formatting options for ProgressValue (e.g. style: 'percent', or a currency).",
		},
		{
			name: "getAriaValueText",
			type: "(formatted, value) => string",
			description:
				"Returns a human-readable text alternative for aria-valuenow.",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description:
				"Bar thickness, on the same three rails as Meter so the two match on one page. ProgressTrack inherits it.",
		},
	],
	variants: {
		size: ["sm", "md", "lg"],
	},
	subcomponents: [
		{
			name: "ProgressTrack",
			type: "Base UI Track props + className",
			description:
				"The rail. Rendered automatically when Progress has no children; renders a ProgressIndicator child by default. Takes `size` (inherited from Progress) for its thickness — use that rather than a className height.",
		},
		{
			name: "ProgressIndicator",
			type: "Base UI Indicator props + className",
			description:
				"The fill. Width is set by Base UI from the value; spans full width and pulses while indeterminate.",
		},
		{
			name: "ProgressLabel",
			type: "Base UI Label props + className",
			description: "Accessible label; wires aria-labelledby on the Root.",
		},
		{
			name: "ProgressValue",
			type: "Base UI Value props + className",
			description:
				"Formatted value readout. Accepts a render-function child for custom formatting.",
		},
	],
	tokensUsed: ["secondary", "primary", "foreground", "muted-foreground"],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "Root",
			why: "A progress bar appears because work started. Staging its entrance delays the one piece of information the reader is waiting for.",
		},
		{
			slot: "response",
			recipe: "none",
			part: "Root",
			why: "It reports; it does not accept input. A bar that reacted to the pointer would read as a Slider, which is a control the reader can drag.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "ProgressIndicator",
			why: "Fill width eases between values on the motion tokens (no recipe animates width), so the bar reads as filling rather than as a series of unrelated widths. It matters most where progress arrives in coarse jumps — four chunked upload callbacks look like a glitching bar without it.",
		},
		{
			slot: "activity",
			recipe: "motion-pulse",
			part: "ProgressIndicator",
			why: "Indeterminate (value null) has no width to animate, so the pulse carries the whole signal that work is still happening. Without it the indeterminate state is a static bar — indistinguishable from a stalled determinate one.",
		},
	],
	a11y: [
		"Base UI sets role=progressbar with aria-valuenow / aria-valuemin / aria-valuemax and reports status to screen readers.",
		"Indeterminate state (value null) omits aria-valuenow per the ARIA spec.",
		"Pair ProgressLabel with the bar for a visible, associated name; ProgressValue exposes the formatted value.",
	],
	examples: [
		{
			label: "Determinate",
			code: "<Progress value={64} aria-label=\"Upload\" />",
		},
		{
			label: "Indeterminate",
			code: "<Progress aria-label=\"Preparing export\" />",
		},
		{
			label: "With label and value",
			code: '<Progress value={40}><div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><ProgressLabel>Uploading</ProgressLabel><ProgressValue /></div><ProgressTrack /></Progress>',
		},
	],
}
