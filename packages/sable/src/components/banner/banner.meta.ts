import type { ComponentMeta } from "../../lib/meta"

export const bannerMeta: ComponentMeta = {
	name: "Banner",
	summary:
		"Full-width, page-level announcement bar. A tone (neutral, info, success, warning, the decorative 1, destructive) × an appearance (soft tint or loud solid fill), and an optional leading scope label. Centers its message, or — with a trailing action — switches to a leading-text + trailing-button layout. Optionally sticky and dismissible.",
	keywords: [
		"banner",
		"announcement",
		"alert",
		"status",
		"message",
		"warning",
		"success",
		"offline",
		"sticky",
	],
	usage: {
		description:
			"Use Banner for page-level or app-level messages that affect the current experience: outages, maintenance, success confirmations, policy notices, or major warnings. Prefer Toast for transient feedback from a specific action, and prefer InlineStatus for local row or form state.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Use soft appearance for contextual notices and solid appearance for urgent, blocking, or system-wide states.",
			},
			{
				guidance: "do",
				description:
					"Set live='polite' or live='assertive' only when the banner appears or changes dynamically.",
			},
			{
				guidance: "do",
				description:
					"Include one clear action when the user can resolve or inspect the state.",
			},
			{
				guidance: "dont",
				description:
					"Use multiple stacked solid banners unless the page is genuinely blocked by multiple independent states.",
			},
			{
				guidance: "dont",
				description:
					"Use Banner for field-level validation, row status, or small local hints; use Field, InlineStatus, or Badge instead.",
			},
			{
				guidance: "dont",
				description:
					"Use Banner inside a dialog, a form, or a section to qualify the content around it — that is Note. Banner is a full-width announcement strip for page- or app-level state, so in a modal it reads as a slab heavier than the fields it warns about, and its soft appearance has no border and no tone-colored icon: the severity survives only as a faint wash.",
			},
		],
		anatomy: [
			{
				name: "Message",
				required: true,
				description:
					"The short announcement text. It should explain the state in plain language.",
			},
			{
				name: "Action",
				required: false,
				description:
					"Optional trailing action that changes the layout from centered copy to text plus action.",
			},
			{
				name: "Dismiss",
				required: false,
				description:
					"Optional close control for notices the user can safely hide.",
			},
		],
	},
	related: {
		components: ["Note", "AppShell", "Toast", "InlineStatus", "EmptyState", "Button"],
		patterns: ["DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "tone",
			type: '"neutral" | "info" | "success" | "warning" | "1" | "destructive"',
			default: '"neutral"',
			description:
				"Neutral surface or a tone that encodes the announcement's intent (info / success / warning / the decorative 1 / destructive).",
		},
		{
			name: "appearance",
			type: '"soft" | "solid"',
			default: '"soft"',
			description:
				'"soft" is a quiet tinted fill; "solid" is the full tone with its paired ink — for loud, can\'t-miss states (offline, chain-down, RPC errors).',
		},
		{
			name: "label",
			type: "ReactNode",
			description: "A short scope label (\"Preview\", \"Staging\", a project name) in a leading chip — a Badge that reads on soft and solid fills.",
		},
		{
			name: "action",
			type: "ReactNode",
			description:
				"A trailing action (e.g. a Button). Switches the bar to leading text + trailing action instead of centered text.",
		},
		{
			name: "sticky",
			type: "boolean",
			default: "false",
			description:
				"Stick the banner to the top of its scroll container (sticky top-0, z-30).",
		},
		{
			name: "live",
			type: '"off" | "polite" | "assertive"',
			default: '"off"',
			description:
				'ARIA live-region politeness for banners shown/updated at runtime (offline, RPC-down, "N new posts"). "polite" → role=status; "assertive" → role=alert. "off" keeps a static labelled region.',
		},
		{
			name: "dismissible",
			type: "boolean",
			default: "false",
			description:
				"Render a trailing close button that hides the banner when clicked.",
		},
		{
			name: "onDismiss",
			type: "() => void",
			description: "Called after the banner is dismissed.",
		},
	],
	variants: {
		tone: ["neutral", "info", "success", "warning", "1", "destructive"],
		appearance: ["soft", "solid"],
	},
	tokensUsed: [
		"secondary",
		"secondary-foreground",
		"foreground",
		"background",
		"tone-info",
		"tone-info-foreground",
		"success",
		"success-foreground",
		"tone-warning",
		"tone-warning-foreground",
		"tone-1",
		"tone-1-foreground",
		"destructive",
		"destructive-foreground",
	],
	a11y: [
		"Static banners render as a labelled region (role=region); set `live` to announce dynamic status bars (role=status / role=alert) when they appear or change.",
		"The dismiss control is Button (on-color-ghost, icon-xs) with an aria-label; it takes the bar's own ink, so its glyph and focus ring stay legible on soft and solid fills alike.",
		"Solid fills pair each tone with its theme-adaptive ink token, so text stays legible in light and dark.",
	],
	examples: [
		{
			label: "Tones",
			code: '<Banner tone="info">Maintenance window tonight at 02:00 UTC.</Banner>',
		},
		{
			label: "Solid (loud)",
			code: '<Banner tone="destructive" appearance="solid" live="assertive">Payments are down. Checkout and upgrades are temporarily disabled.</Banner>',
		},
		{
			label: "Success",
			code: '<Banner tone="success" live="polite">Credits authorized for Studio.</Banner>',
		},
		{
			label: "Action",
			code: '<Banner sticky action={<Button variant="outline" size="sm">Refresh</Button>}>12 new posts</Banner>',
		},
		{
			label: "Dismissible",
			code: '<Banner tone="warning" dismissible>Your session expires soon.</Banner>',
		},
		{
			label: "Recoverable warning",
			code: '<Banner tone="warning" action={<Button variant="outline" size="sm">Reconnect</Button>}>Calendar sync paused.</Banner>',
		},
		{
			label: "App-shell outage",
			code: '<AppShell banners={<Banner tone="destructive" appearance="solid" live="assertive">Uploads are temporarily unavailable.</Banner>}><Region max="feed"><EmptyState title="Uploads paused" description="Existing posts are still visible while the service recovers." /></Region></AppShell>',
		},
	],
}
