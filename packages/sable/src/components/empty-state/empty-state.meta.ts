import type { ComponentMeta } from "../../lib/meta"

export const emptyStateMeta: ComponentMeta = {
	name: "EmptyState",
	summary:
		"The centered empty / error block: optional icon or error code, title, description and an action. tone=\"destructive\" makes it an announced error, size=\"lg\" a page-level state, surface=\"card\" a self-contained card.",
	keywords: [
		"empty",
		"zero state",
		"blank slate",
		"no results",
		"placeholder",
		"onboarding",
		"no data",
	],
	usage: {
		description:
			"Use EmptyState when a content area has no items, no search results, or no first-time setup yet. The title should name the empty condition and the description/action should give the user a next step.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Explain what is empty in plain language, such as \"No posts yet\" or \"No matching customers\".",
			},
			{
				guidance: "do",
				description:
					"Offer one next step when the user can recover, create, clear filters, or start setup.",
			},
			{
				guidance: "do",
				description:
					"Keep the icon decorative and make the title carry the meaning.",
			},
			{
				guidance: "do",
				description:
					"For a search or filter result, name the query back to the user and offer the way out, such as \"No results for 'quarterly'\" with a Clear filters action. An empty result that does not say what was searched leaves the user unsure whether the query or the data was wrong.",
			},
			{
				guidance: "dont",
				description:
					"Use generic copy like \"No data\"; it gives users and agents no useful path forward.",
			},
			{
				guidance: "dont",
				description:
					"Park anything the user needs permanently here, such as setup instructions, billing notices, or keyboard shortcuts. An empty state is the one surface guaranteed to disappear the moment content exists, so information that matters after the first item is lost exactly when the user has learned enough to want it.",
			},
			{
				guidance: "dont",
				description:
					"Use it for a field's validation error — that is Field error messaging. Reserve tone=\"destructive\" for a view or block that failed to load.",
			},
		],
		anatomy: [
			{
				name: "Icon",
				required: false,
				description:
					"A decorative cue that reinforces the empty condition.",
			},
			{
				name: "Title",
				required: true,
				description:
					"The short message naming what is empty.",
			},
			{
				name: "Description",
				required: false,
				description:
					"Supporting copy that explains why the state exists or what to try next.",
			},
			{
				name: "Action",
				required: false,
				description:
					"One clear button or link that moves the user forward.",
			},
		],
	},
	related: {
		components: ["Button", "Icon", "Card", "Banner", "DataTable"],
		patterns: ["FeedPage", "ListDetailPage", "DashboardPage"],
	},
	status: "stable",
	props: [
		{
			name: "icon",
			type: "ReactNode",
			description:
				"Optional glyph above the title — an `<Icon />` takes the muted ink at 3xl; an image or illustration renders as given.",
		},
		{
			name: "title",
			type: "ReactNode",
			description: "The headline. Short and direct.",
		},
		{
			name: "description",
			type: "ReactNode",
			description: "Optional supporting line beneath the title.",
		},
		{
			name: "action",
			type: "ReactNode",
			description: "Optional action below the copy — typically a `<Button />`.",
		},
		{
			name: "code",
			type: "ReactNode",
			description: "A large figure above the title, such as an error code (404).",
		},
		{
			name: "tone",
			type: '"neutral" | "destructive"',
			default: '"neutral"',
			description: "destructive is an error state: a destructive icon (a warning by default) and role=\"alert\" so it is announced.",
		},
		{
			name: "size",
			type: '"md" | "lg"',
			default: '"md"',
			description: "lg is page-level: the title is an h2 and the block takes more room. md sits in a panel, list or card.",
		},
		{
			name: "surface",
			type: '"none" | "card"',
			default: '"none"',
			description: "card draws it as a Card, for an error or empty block standing on its own in a page.",
		},
	],
	variants: {
		tone: ["neutral", "destructive"],
		size: ["md", "lg"],
		surface: ["none", "card"],
	},
	tokensUsed: ["muted", "muted-foreground", "foreground", "destructive"],
	a11y: [
		"Decorative icons should not carry meaning the title doesn't already convey.",
		"Pair with an actionable next step so the zero-state is a path forward, not a dead end.",
	],
	examples: [
		{
			label: "With icon and action",
			code: '<EmptyState icon={<Icon name="info" />} title="No posts yet" description="Create your first." action={<Button>New post</Button>} />',
		},
		{
			label: "No search results",
			code: '<EmptyState icon={<Icon name="search" />} title="No matching posts" description="Try a different keyword or clear your filters." action={<Button variant="secondary">Clear filters</Button>} />',
		},
		{
			label: "First-run setup",
			code: '<EmptyState surface="card" icon={<Icon name="sparkles" />} title="Start your first project" description="Create a project, import one from a file, or invite collaborators." action={<Row gap={1}><Button>Create project</Button><Button variant="ghost">Import</Button></Row>} />',
		},
		{
			label: "Page-level error",
			code: '<EmptyState tone="destructive" size="lg" code="404" title="Page not found" description="The page you are looking for has moved or never existed." action={<Button>Go home</Button>} />',
		},
		{
			label: "Error card",
			code: '<EmptyState tone="destructive" surface="card" title="Could not load this project" description="Check your connection and try again." action={<Button variant="secondary">Retry</Button>} />',
		},
		{
			label: "Empty table body",
			code: '<DataTable data={[]} columns={[{ key: "name", header: "Customer" }, { key: "status", header: "Status" }]} empty={<EmptyState title="No customers yet" description="Customers appear here after the first order." />} />',
		},
	],
}
