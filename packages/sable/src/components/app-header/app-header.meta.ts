import type { ComponentMeta } from "../../lib/meta"

export const appHeaderMeta: ComponentMeta = {
	name: "AppHeader",
	summary:
		"Mobile top bar (sticky, hidden at lg) with leading / title / actions slots on a 3-column grid that keeps the title optically centered. Grows into the top safe-area.",
	status: "stable",
	keywords: [
		"app header",
		"top bar",
		"mobile header",
		"chrome",
	],
	usage: {
		description: "Use AppHeader for compact application chrome at the top of a screen, usually with navigation, identity, and a small action set. Pass it to AppShell's `header` slot so screen content clears it on mobile (it is sticky and hides itself at lg).",
		bestPractices: [
			{
				guidance: "do",
				description: "Keep the header actions narrow and predictable so the page title remains legible.",
			},
			{
				guidance: "do",
				description: "Use it once per app view as chrome, not as repeated content inside page sections.",
			},
			{
				guidance: "dont",
				description: "Do not overload it with filters, forms, or page-specific controls that belong in the content area.",
			},
			{
				guidance: "dont",
				description: "Do not render more than one per app, or put a second one inside a route. It is sticky chrome, so two of them stack and permanently eat the top of the viewport.",
			},
		],
	},
	related: {
		components: [
			"AppShell",
			"PageHeader",
			"BottomNav",
		],
	},
	props: [
		{
			name: "leading",
			type: "ReactNode",
			description: "Leading slot — back button, create action, or menu trigger.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "Center slot — brand wordmark or contextual page title.",
		},
		{
			name: "actions",
			type: "ReactNode",
			description: "Trailing slot — wallet trigger, action buttons.",
		},
	],
	a11y: [
		"Renders a <header> landmark.",
		"Pair with a leading control that has an accessible label (e.g. a BackButton).",
	],
	tokensUsed: ["background", "border", "foreground"],
	examples: [
		{
			label: "Contextual header",
			code: '<AppHeader leading={<Button size="icon" variant="ghost" aria-label="Back"><Icon name="chevron-left" /></Button>} title="Notifications" />',
		},
		{
			label: "Choosing between AppHeader and PageHeader",
			code: `// AppHeader is APP chrome — it persists across routes and holds global
// affordances (brand, search, account). One per app.
<AppShell header={<AppHeader title="Studio" />}>
  <Region max="content">Route content</Region>
</AppShell>

// PageHeader is CONTENT — it introduces the current route and scrolls away
// with it. One per page, INSIDE the region.
<Region max="content">
  <PageHeader title="Billing" description="Plans, invoices, payment methods." />
</Region>

// ✗ Putting route-specific actions in AppHeader. They then persist onto routes
//   where they mean nothing, and the header becomes a dumping ground.`,
		},
	],
}
