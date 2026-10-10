import type { ComponentMeta } from "../../lib/meta"

export const inlineStatusMeta: ComponentMeta = {
	name: "InlineStatus",
	summary:
		"A borderless single-line status message — a leading semantic icon + one line of text over the canonical tone scale (neutral/info/success/warning/destructive). The non-boxed sibling of Note for inline affirmations, errors, and progress; pass a custom icon (e.g. a Spinner) for a pending row.",
	status: "stable",
	keywords: [
		"inline status",
		"state",
		"message",
		"availability",
	],
	usage: {
		description: "Use InlineStatus for short state messages placed near the thing they describe.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it beside inputs, rows, actions, or settings that need local status.",
			},
			{
				guidance: "do",
				description: "Keep the message brief and pair color with text.",
			},
			{
				guidance: "dont",
				description: "Do not use InlineStatus for global announcements or page-level alerts.",
			},
			{
				guidance: "dont",
				description: "Do not use tone as the only signal. Colour alone fails for colour-blind users — the leading icon is what carries the meaning, so never hide it.",
			},
		],
	},
	related: {
		components: ["StatusDot", "Badge", "Banner", "Note"],
	},
	props: [
		{
			name: "tone",
			type: '"neutral" | "info" | "success" | "warning" | "destructive"',
			default: '"neutral"',
			description:
				"Severity tone — drives the leading icon (name + color) and the text color. The shared status-tone vocabulary (STATUS_TONES).",
		},
		{
			name: "size",
			type: '"sm" | "md"',
			default: '"sm"',
			description: "Text size: sm (text-body-sm) or md (text-body-md). sm is the default for inline placement under a control; md matches surrounding body copy.",
		},
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Override the leading glyph (e.g. a <Spinner />); otherwise the tone selects it.",
		},
	],
	variants: {
		tone: ["neutral", "info", "success", "warning", "destructive"],
		size: ["sm", "md"],
	},
	tokensUsed: [
		"tone-info",
		"success",
		"tone-warning",
		"destructive",
		"muted-foreground",
	],
	a11y: [
		"Color reinforces, never replaces, meaning — the leading icon and the message text carry the status.",
		"For a live status (e.g. a form submit result), render it in an aria-live region or pair it with the field's error wiring so the change is announced.",
	],
	examples: [
		{
			label: "Tones",
			code: '<Stack gap={1}><InlineStatus tone="success">Top-up confirmed.</InlineStatus><InlineStatus tone="destructive">Insufficient balance.</InlineStatus></Stack>',
		},
		{
			label: "Pending (custom icon)",
			code: '<InlineStatus tone="neutral" icon={<Spinner size="sm" />}>Preparing transaction…</InlineStatus>',
		},
	],
}
