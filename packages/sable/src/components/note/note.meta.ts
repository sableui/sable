import type { ComponentMeta } from "../../lib/meta"

export const noteMeta: ComponentMeta = {
	name: "Note",
	summary:
		"Callout / admonition box. Its tone follows the shared status-tone vocabulary (neutral/info/success/warning/destructive), pairing a soft tone fill with a matching leading icon. Optional title.",
	status: "stable",
	keywords: [
		"note",
		"callout",
		"admonition",
		"warning",
		"caveat",
		"hint",
		"context",
	],
	usage: {
		description:
			"Use Note for helpful supporting information that should sit near the relevant content — including a caveat or warning attached to a form, a dialog, or a section. It is the in-context callout; Banner is the page-level strip.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use it for tips, caveats, or secondary context that improves understanding.",
			},
			{
				guidance: "do",
				description:
					"Reach for Note rather than Banner when the message qualifies something on the page — a warning inside a dialog, a caveat above a submit button. Banner is a full-width announcement strip for page- or app-level state; inside a form it reads as a slab, and its soft fill carries no border or tone-colored icon, so the severity stops being visible.",
			},
			{
				guidance: "do",
				description: "Keep tone calm and concise so the note does not compete with primary content.",
			},
			{
				guidance: "do",
				description:
					"When the reader can resolve the state, pass `action` rather than putting a Button in children. The prop is data — label plus handler — so the callout owns the placement and weight; a Button dropped into children inherits neither, floats in the box's padding, and (in `secondary`) punches a near-background hole in the tone fill.",
			},
			{
				guidance: "dont",
				description:
					"Do not use Note for state the whole page or app is in (an outage, an offline session, a blocked account) — that is Banner — or for a message tied to one field, which is the field's own error text.",
			},
			{
				guidance: "dont",
				description:
					"Do not give a Note two actions. One remedy reads as the sentence's next move; two make it a decision point, which is a Dialog's job.",
			},
			{
				guidance: "dont",
				description: "Do not stack several in a row. Three notes together are a wall of asides; if everything is called out, nothing is.",
			},
		],
	},
	related: {
		components: ["Banner", "InlineStatus", "EmptyState"],
	},
	props: [
		{
			name: "action",
			type: "{ label: string; onClick?: () => void; href?: string }",
			description:
				"A single remedy, rendered below the body and aligned to the text column. Deliberately data, not a slot: Note owns the placement, weight, ink and motion, so the action cannot be styled into a button that outweighs the sentence explaining it. Use onClick for an in-place action (renders a button, no glyph) or href for a link (renders an anchor with a trailing chevron) — the chevron means navigate, so it appears only when the action genuinely goes somewhere.",
		},
		{
			name: "tone",
			type: '"neutral" | "info" | "success" | "warning" | "destructive"',
			default: '"info"',
			description:
				"Severity tone — drives the border, fill, and leading icon color/name. The shared status-tone vocabulary (STATUS_TONES).",
		},
		{
			name: "title",
			type: "string",
			description: "Optional bold lead-in rendered above the body (text-title-sm).",
		},
		{
			name: "icon",
			type: "string | ReactNode | null",
			description:
				"Override the variant glyph: a string swaps the icon name (keeping the tone color), a ReactNode replaces it, null removes it; omit for the variant default.",
		},
	],
	variants: {
		tone: ["neutral", "info", "success", "warning", "destructive"],
	},
	tokensUsed: [
		"foreground",
		"border",
		"muted",
		"muted-foreground",
		"tone-info",
		"tone-warning",
		"success",
		"destructive",
	],
	a11y: [
		'Rendered with role="note" so assistive tech can announce it as an aside.',
		"Color is never the sole signal — the leading icon and optional title reinforce severity.",
	],
	examples: [
		{
			label: "Info",
			code: "<Note tone=\"info\">Editions mint on Solana mainnet.</Note>",
		},
		{
			label: "With title",
			code: '<Note tone="warning" title="Low balance">Top up SOL before minting.</Note>',
		},
		{
			label: "Warning with a remedy, inside a dialog",
			code: '<Note tone="warning" action={{ label: "Unload chat model", onClick: unloadChatModel }}>gemma-4 is holding VRAM — generating now may be slow or fail.</Note>',
		},
		{
			label: "Custom icon",
			code: '<Note tone="neutral" icon="lock">Pricing and supply cannot be changed after an edition is purchased.</Note>',
		},
	],
}
