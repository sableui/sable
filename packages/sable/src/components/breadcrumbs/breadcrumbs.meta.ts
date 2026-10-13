import type { ComponentMeta } from "../../lib/meta"

export const breadcrumbsMeta: ComponentMeta = {
	name: "Breadcrumbs",
	summary:
		"Navigation trail showing the path to the current page. A labelled <nav> wraps an inline <ol> of crumbs — interactive ancestor links, separators, and a non-interactive current page. No Base UI.",
	status: "stable",
	keywords: [
		"breadcrumbs",
		"hierarchy",
		"path",
		"navigation",
	],
	usage: {
		description: "Use Breadcrumbs to show the user's location inside a hierarchy and provide lightweight parent navigation.",
		bestPractices: [
			{
				guidance: "do",
				description: "Use breadcrumbs when users can arrive deep in a nested structure.",
			},
			{
				guidance: "do",
				description: "Keep the current page as text so it reads as location, not another link.",
			},
			{
				guidance: "dont",
				description: "Do not use breadcrumbs as a substitute for primary navigation or step progress.",
			},
			{
				guidance: "dont",
				description: "Do not make the last crumb a link. It points at the page you are already on, and screen readers announce it as a destination; render it as the current page with aria-current.",
			},
		],
		anatomy: [
			{
				name: "BreadcrumbItem",
				required: true,
				description: "A single step in the path.",
			},
			{
				name: "BreadcrumbLink",
				required: false,
				description: "A linked ancestor destination.",
			},
			{
				name: "BreadcrumbPage",
				required: true,
				description: "The current non-linked page.",
			},
			{
				name: "BreadcrumbSeparator",
				required: false,
				description: "The visual separator between steps.",
			},
		],
	},
	related: {
		components: [
			"SideNav",
			"PageHeader",
		],
	},
	props: [
		{
			name: "Breadcrumbs",
			type: "ComponentPropsWithRef<'nav'>",
			default: "—",
			description:
				"The trail root. Renders <nav aria-label=\"Breadcrumb\"> around a flex <ol>. Pass the crumb parts as children.",
		},
	],
	subcomponents: [
		{
			name: "BreadcrumbItem",
			type: "ComponentPropsWithRef<'li'>",
			description: "A single crumb slot (<li>) holding a link or the current page.",
		},
		{
			name: "BreadcrumbLink",
			type: "ComponentPropsWithRef<'a'> & { render?: useRender.RenderProp }",
			description:
				"An interactive ancestor crumb (<a>). Muted by default, brightens to foreground on hover/focus. render composes another element with the crumb's styling, e.g. a router link: render={<Link to=\"/library\" />}, so navigating stays in the app.",
		},
		{
			name: "BreadcrumbPage",
			type: "ComponentPropsWithRef<'span'>",
			description:
				"The current-page crumb (<span aria-current=\"page\">). Non-interactive, full-contrast.",
		},
		{
			name: "BreadcrumbSeparator",
			type: "ComponentPropsWithRef<'li'> + { children? }",
			description:
				"Decorative divider (<li aria-hidden>) between crumbs. Defaults to a chevron-right icon; pass children to swap the glyph.",
		},
	],
	tokensUsed: ["muted-foreground", "foreground"],
	a11y: [
		"The <nav> carries aria-label=\"Breadcrumb\" so assistive tech announces the landmark.",
		"Crumbs sit in an ordered list (<ol>) to convey hierarchy and position.",
		"The current page uses aria-current=\"page\" and is rendered as plain text, not a link.",
		"Separators are aria-hidden so the chevron glyph is not announced.",
	],
	examples: [
		{
			label: "Three-level trail",
			code: '<Breadcrumbs><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/library">Library</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Editions</BreadcrumbPage></BreadcrumbItem></Breadcrumbs>',
		},
		{
			label: "Custom separator",
			code: '<Breadcrumbs><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator>/</BreadcrumbSeparator><BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem></Breadcrumbs>',
		},
	],
}
