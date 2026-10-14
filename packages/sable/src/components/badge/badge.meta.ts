import type { ComponentMeta } from "../../lib/meta"

export const badgeMeta: ComponentMeta = {
	name: "Badge",
	summary:
		"Compact static label, set on two axes: appearance (soft, outline, solid, overlay on media, plain text) and tone (neutral, a semantic tone, or a palette family like blue for a category with no meaning attached). An optional leading icon, or a status dot (with pulse) for state.",
	keywords: [
		"badge",
		"tag",
		"label",
		"status",
		"metadata",
		"chip",
		"pill",
		"tone",
		"category",
	],
	usage: {
		description:
			"Use Badge for any short static label: metadata, categories, tone-coded labels, a label on artwork (appearance=\"overlay\"), or a status line (appearance=\"plain\" with dot). Use Pill for a chip someone clicks, NotificationBadge for an unread count on an icon, and Banner or Toast for messages that need attention.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep badge text short: one to three words or a compact count.",
			},
			{
				guidance: "do",
				description:
					"Use tone variants when the badge carries meaning, such as success, warning or destructive, or a decorative tone for a category or plan.",
			},
			{
				guidance: "do",
				description:
					"Pair icons with text; the icon reinforces meaning but should not be the only cue.",
			},
			{
				guidance: "dont",
				description:
					"Use a Badge as a button. If it triggers an action, use Button, Toggle, or a menu item.",
			},
			{
				guidance: "do",
				description:
					"Choose appearance and tone separately: appearance is how loud it is (soft by default, solid for emphasis, overlay on images, plain for a status line); tone is what it means.",
			},
			{
				guidance: "dont",
				description:
					"Stack many loud tone badges in one row; too many semantic colors compete with the actual content.",
			},
		],
		anatomy: [
			{
				name: "Container",
				required: true,
				description:
					"The compact pill surface carrying the tone or neutral treatment.",
			},
			{
				name: "Label",
				required: true,
				description:
					"Short visible text that names the category, state, role, or metadata value.",
			},
			{
				name: "Icon",
				required: false,
				description:
					"Optional leading Icon used to reinforce the label.",
			},
		],
	},
	related: {
		components: ["Pill", "StatusDot", "NotificationBadge", "Banner", "Toast"],
		patterns: ["DashboardPage", "ListDetailPage"],
	},
	status: "stable",
	props: [
		{
			name: "appearance",
			type: '"soft" | "outline" | "solid" | "overlay" | "plain"',
			default: '"soft"',
			description:
				"How it is drawn. soft: a tinted fill (neutral is the secondary surface). outline: a hairline. solid: the tone at full strength (neutral is the inverted chip). overlay: legible on images — a dark scrim, or the solid tone. plain: no fill or padding, a status line.",
		},
		{
			name: "tone",
			type: '"neutral" | "1" | "2" | "3" | "info" | "success" | "warning" | "destructive" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "purple" | "pink"',
			default: '"neutral"',
			description: "What it means. Every appearance takes every tone. The palette families (red … pink) are categories with no meaning attached — tags, labels, project colours — painted from the theme's generated palette, so they lean toward the brand and read in both modes.",
		},
		{
			name: "size",
			type: '"sm" | "md"',
			default: '"md"',
			description:
				'"sm" uses tighter padding + text-label-sm; "md" is the default look.',
		},
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Optional leading glyph (e.g. <Icon name=\"lock\" />), rendered before the children with the base gap. Ignored when dot is set.",
		},
		{
			name: "dot",
			type: "boolean",
			default: "false",
			description: "A leading status dot in the badge's tone. With appearance=\"plain\" it is a status line (\u25cf Ready).",
		},
		{
			name: "pulse",
			type: "boolean",
			default: "false",
			description: "Pulse the dot, for a state in progress. Needs dot.",
		},
	],
	variants: {
		appearance: ["soft", "outline", "solid", "overlay", "plain"],
		tone: ["neutral", "1", "2", "3", "info", "success", "warning", "destructive", "red", "orange", "yellow", "green", "teal", "blue", "purple", "pink"],
		size: ["sm", "md"],
	},
	tokensUsed: [
		"palette-wash",
		"palette-wash-strong",
		"palette-edge",
		"palette-dot",
		"palette-solid",
		"palette-text",
		"palette-solid-ink",
		"secondary",
		"secondary-foreground",
		"border",
		"foreground",
		"background",
		"muted",
		"muted-foreground",
		"tone-1",
		"tone-2",
		"tone-3",
		"tone-info",
		"success",
		"tone-warning",
		"destructive",
		"overlay",
		"overlay-foreground",
		"tone-1-foreground",
		"tone-2-foreground",
		"tone-3-foreground",
		"tone-info-foreground",
		"success-foreground",
		"tone-warning-foreground",
		"destructive-foreground",
	],
	a11y: [
		"Badges are static text by default; do not rely on color alone for meaning.",
		"Use clear label text for semantic tones so assistive tech receives the same status information sighted users see.",
	],
	examples: [
		{
			label: "Tones",
			code: '<Row gap={1}><Badge tone="1">Business</Badge><Badge tone="2">Studio</Badge><Badge tone="3">Starter</Badge></Row>',
		},
		{
			label: "Palette colours (categories)",
			code: '<Row gap={1}><Badge tone="blue">Design</Badge><Badge tone="teal">Research</Badge><Badge tone="orange">Marketing</Badge><Badge tone="pink" appearance="outline">Ops</Badge><Badge tone="purple" appearance="solid">Launch</Badge></Row>',
		},
		{
			label: "Solid",
			code: '<Badge appearance="solid" size="sm">Admin</Badge>',
		},
		{
			label: "Success",
			code: '<Badge tone="success">Resolved</Badge>',
		},
		{
			label: "With icon",
			code: '<Badge size="sm" icon={<Icon name="lock" />}>Locked</Badge>',
		},
		{
			label: "Small",
			code: '<Badge size="sm" tone="info">New</Badge>',
		},
		{
			label: "Metadata row",
			code: '<Row gap={1}><Badge>12 projects</Badge><Badge appearance="outline">Draft</Badge><Badge tone="info" icon={<Icon name="info" />}>Curated</Badge></Row>',
		},
		{
			label: "Semantic state",
			code: '<Row gap={1}><Badge tone="success">Synced</Badge><Badge tone="warning">Review</Badge><Badge tone="destructive">Blocked</Badge></Row>',
		},
	],
}
