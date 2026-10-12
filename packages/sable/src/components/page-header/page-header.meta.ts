import type { ComponentMeta } from "../../lib/meta"

export const pageHeaderMeta: ComponentMeta = {
	name: "PageHeader",
	summary:
		"In-flow page heading block: a title row (optional back control + actions) over an optional description, with room for children (filters, tabs) below.",
	status: "stable",
	keywords: [
		"page header",
		"title",
		"lede",
		"page actions",
	],
	usage: {
		description: "Use PageHeader to establish a page's title, supporting description, and primary page actions.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use one PageHeader per major page or route.",
			},
			{
				guidance: "do",
				description: "Keep the title literal and put explanation in the lede or nearby content.",
			},
			{
				guidance: "dont",
				description: "Do not use PageHeader inside repeated cards, dialogs, or compact panels.",
			},
			{
				guidance: "dont",
				description: "Do not use a second PageHeader for a section of the page. It is the route's one h1; each section below it takes a SectionHeader (an h2 with the same title row, description and actions).",
			},
			{
				guidance: "dont",
				description: "Do not put it outside the Region that holds the page content. It then sits at a different measure from what it introduces, and the page reads as two documents.",
			},
		],
	},
	related: {
		components: [
			"AppHeader",
			"SectionHeader",
			"Breadcrumbs",
			"Button",
		],
	},
	props: [
		{ name: "title", type: "ReactNode", description: "The page title (renders an <h1>)." },
		{
			name: "description",
			type: "ReactNode",
			description: "Supporting copy beneath the title.",
		},
		{
			name: "back",
			type: "ReactNode",
			description: "Leading element before the title — typically a back control on drill-in routes. Keep it a ghost icon Button (size=\"icon\", variant=\"ghost\", aria-label=\"Back\") so it stays quieter than the title. A ghost back control bleeds by its inset at the start, so its glyph lines up with the content edge below (Button bleed=\"none\" opts out).",
		},
		{
			name: "actions",
			type: "ReactNode",
			description: "Trailing actions aligned to the title row's end. They drop under the title when the row runs out of room, and the title wraps rather than truncating. A ghost or link Button at either end of the group bleeds by its own padding, so its label meets the content edge (the end on the title row, the start once wrapped); filled buttons keep their edge on the line. Direct children only.",
		},
		{
			name: "titleAs",
			type: '"h1" | "h2"',
			default: '"h1"',
			description:
				"The title's heading element. Keep h1 — the route's one h1. Use h2 only when something above already owns the h1: a shell that renders the route title, or a page showing a PageHeader as an example.",
		},
	],
	a11y: ["Renders the title as an <h1>; use one PageHeader per page.",
		"Its title renders the route's `h1`. Do not render another `h1` elsewhere on the page: heading navigation would report two documents, and the outline a screen-reader user builds from it stops matching the page.",
	],
	tokensUsed: ["foreground", "muted-foreground"],
	examples: [
		{
			label: "With actions",
			code: '<PageHeader title="Storage credits" description="Fund permanent storage." actions={<Button>Top up</Button>} />',
		},
		{
			label: "One per page, inside the region",
			code: `// PageHeader introduces the current route: title, optional description, and the
// actions that act on THIS page.

<Region max="content">
  <PageHeader
    title="Invoices"
    description="Every charge on this account."
    actions={<Button>Export</Button>}
  />
  <p className="text-body-md text-muted-foreground">Page content.</p>
</Region>

// ✗ Outside the Region. The header then sits at a different measure from the
//   content it introduces, and the page reads as two documents.
// ✗ Two on one page. A second one is a section heading: a SectionHeader
//   (an h2 on text-heading-3, same title row and actions), not another PageHeader.
// ✗ Global actions in it (account, search). Those persist across routes and
//   belong in AppHeader.`,
		},
	],
}
