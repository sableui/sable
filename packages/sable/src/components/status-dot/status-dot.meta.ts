import type { ComponentMeta } from "../../lib/meta"

export const statusDotMeta: ComponentMeta = {
	name: "StatusDot",
	summary:
		"A small colored status dot. Tone variants encode state via semantic tone tokens; sizes scale the diameter. Decorative (aria-hidden) — pair with text. Optional pulse adds a live ping ring.",
	keywords: [
		"status",
		"dot",
		"presence",
		"health",
		"state",
		"online",
		"live",
		"indicator",
	],
	usage: {
		description:
			"Use StatusDot as a compact visual state cue next to text, avatars, rows, or labels. It is decorative by design, so pair it with visible text or use `<Badge appearance=\"plain\" dot>` when the label and dot should travel together — that is the labelled status line, not a hand-built row.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Place StatusDot beside a readable state label, person name, or row title.",
			},
			{
				guidance: "do",
				description:
					"Use pulse only for live or in-progress states that are actively changing.",
			},
			{
				guidance: "dont",
				description:
					"Use the dot as the only status indicator; it is aria-hidden and color alone is not enough.",
			},
			{
				guidance: "dont",
				description:
					"Mix many dot sizes in the same list. Keep row indicators visually consistent.",
			},
		],
		anatomy: [
			{
				name: "Dot",
				required: true,
				description:
					"The small tone-colored circle. It is decorative and hidden from assistive tech.",
			},
			{
				name: "Pulse ring",
				required: false,
				description:
					"Optional motion ring for in-progress or live states.",
			},
		],
	},
	related: {
		components: ["Badge", "Avatar", "InlineStatus"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "tone",
			type: '"neutral" | "1" | "2" | "3" | "success" | "warning" | "info" | "destructive" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description: "Semantic color of the dot, or a palette family (red … pink) for a category legend.",
		},
		{
			name: "size",
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: "Dot diameter.",
		},
		{
			name: "pulse",
			type: "boolean",
			default: "false",
			description: "Wrap the dot in an animated ping ring to signal a live state.",
		},
	],
	variants: {
		tone: ["neutral", "1", "2", "3", "success", "warning", "info", "destructive", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"],
		size: ["sm", "md", "lg"],
	},
	tokensUsed: [
		"palette-dot",
		"muted-foreground",
		"tone-3",
		"success",
		"tone-warning",
		"tone-info",
		"tone-1",
		"tone-2",
		"destructive",
	],
	a11y: [
		"Rendered aria-hidden — purely decorative. Convey status in adjacent text, not color alone.",
		"A dot conveys state through colour alone, which fails for colour-blind users and announces as nothing. It must always sit beside text that states the same thing, or carry its own accessible name.",
	],
	examples: [
		{
			label: "Tones",
			code: '<Row gap={2}><StatusDot tone="3" /><StatusDot tone="info" /><StatusDot tone="warning" /><StatusDot tone="destructive" /></Row>',
		},
		{
			label: "With label — use Badge",
			code: '<Badge appearance="plain" tone="success" dot pulse>Live</Badge>',
		},
	],
}
