import type { ComponentMeta } from "../../lib/meta"

export const segmentedBarMeta: ComponentMeta = {
	name: "SegmentedBar",
	summary:
		"One bar split into the parts of a whole — revenue by type, storage by kind, results by outcome. Segments size by their share of the total; the bar is one labelled image to assistive tech.",
	keywords: ["breakdown", "stacked", "segmented", "proportion", "split", "distribution", "category", "bar", "share"],
	usage: {
		description:
			"Use SegmentedBar when a stat card or row needs to show how a total divides into a few categories. Pair it with a legend you compose (StatusDot + label + share), placed where the card has room. For one reading against a range (storage used, quota), use Meter; for task completion, use Progress.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep it to two to six segments and give the same category the same tone everywhere it appears.",
			},
			{
				guidance: "do",
				description:
					"Show the legend's shares in text (\"42%\") — colour identifies a segment, but the number is what a reader compares.",
			},
			{
				guidance: "dont",
				description: "Use it for a single value against a limit; that is Meter, which carries the meter role and its value.",
				instead: ["Meter"],
			},
			{
				guidance: "dont",
				description:
					"Rely on tone order alone to tell segments apart; a legend row per segment, with its label, is required.",
			},
		],
		anatomy: [
			{ name: "Track", required: true, description: "The rounded bar; segments fill it edge to edge with a hairline gap." },
			{ name: "Segment", required: true, description: "One category, sized by its share of the total and filled with its tone." },
		],
	},
	related: {
		components: ["Meter", "Progress", "StatusDot", "Card"],
		patterns: ["DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "segments",
			type: "{ label: string; value: number; tone?: SegmentedBarTone }[]",
			description: "The categories, left to right. Values in any unit; zero or negative values are skipped.",
		},
		{
			name: "label",
			type: "string",
			description: "What the bar breaks down. Prefixes the accessible summary of every segment's share.",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: "Bar thickness — the same rails as Meter and Progress.",
		},
		{
			name: "locale",
			type: "string",
			default: "runtime locale",
			description: "Locale for the spoken percentages.",
		},
	],
	variants: {
		size: ["sm", "md", "lg"],
		tone: ["1", "2", "3", "info", "primary", "neutral", "success", "warning", "destructive"],
	},
	tokensUsed: [
		"tone-1",
		"tone-2",
		"tone-3",
		"tone-info",
		"primary",
		"muted-foreground",
		"success",
		"tone-warning",
		"destructive",
		"destructive-mark",
		"success-mark",
		"tone-warning-mark",
		"tone-info-mark",
		"tone-1-mark",
		"tone-2-mark",
		"tone-3-mark",
	],
	motion: [
		{
			slot: "arrival",
			recipe: "none",
			part: "SegmentedBar",
			why: "A breakdown is a reading, present with the card that reports it; growing the segments in on load would act out a change that did not happen.",
		},
		{ slot: "response", recipe: "none", part: "SegmentedBar", why: "It reports and accepts no input." },
		{
			slot: "transition",
			recipe: "custom",
			part: "Segment",
			why: "Each segment's share and colour ease on the motion tokens when the data changes (no recipe animates flex-grow), so the reader sees which part grew.",
		},
		{ slot: "activity", recipe: "none", part: "SegmentedBar", why: "No indeterminate state — an unknown breakdown is not drawn." },
	],
	a11y: [
		"Rendered role=img with an aria-label built from `label` and each segment's share (\"Revenue by channel: Direct 42%, Partners 27%\"), so the whole breakdown is read in one stop.",
		"Colour alone does not identify a segment: always show a legend with each segment's label beside the bar.",
	],
	examples: [
		{
			label: "With a legend",
			code: 'const sales = [\n\t{ label: "Direct", value: 42, tone: "1" },\n\t{ label: "Partners", value: 27, tone: "2" },\n\t{ label: "Referrals", value: 19, tone: "3" },\n] as const\n\n<Stack gap={3}>\n\t<SegmentedBar label="Revenue by channel" segments={[...sales]} size="lg" />\n\t<ul className="flex flex-col gap-1.5">\n\t\t{sales.map((s) => (\n\t\t\t<li key={s.label} className="flex items-center gap-2 text-body-sm">\n\t\t\t\t<StatusDot tone={s.tone} />\n\t\t\t\t<span className="flex-1 text-muted-foreground">{s.label}</span>\n\t\t\t\t<span className="text-mono-caption">{s.value}%</span>\n\t\t\t</li>\n\t\t))}\n\t</ul>\n</Stack>',
		},
		{
			label: "Test results — status tones",
			code: '<SegmentedBar\n\tlabel="Test results"\n\tsegments={[\n\t\t{ label: "Passed", value: 412, tone: "success" },\n\t\t{ label: "Flaky", value: 9, tone: "warning" },\n\t\t{ label: "Failed", value: 3, tone: "destructive" },\n\t]}\n/>',
		},
	],
}
