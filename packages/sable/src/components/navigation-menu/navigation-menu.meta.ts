import type { ComponentMeta } from "../../lib/meta"

export const navigationMenuMeta: ComponentMeta = {
	name: "NavigationMenu",
	summary:
		"A site header's primary nav over Base UI NavigationMenu: a bar of links and triggers, where a trigger opens a panel of links on hover, click or Enter. One shared panel glides between triggers and resizes to each one's content. Links take any router's link through `render` and mark the current page with `active`.",
	status: "stable",
	keywords: ["navigation", "nav", "header nav", "site nav", "mega menu", "top nav", "navbar", "dropdown nav"],
	usage: {
		description:
			"Use NavigationMenu for a marketing or docs site's header: a few top-level destinations, some of which open a panel of related pages. Use Menu for actions rather than destinations, Tabs to switch views inside a page, Sidebar or SideNav for an app's persistent navigation, and AppHeader for an app's mobile top bar.",
		bestPractices: [
			{
				guidance: "do",
				description:
					"Keep the bar to a handful of entries. A trigger groups related pages; a destination with nothing beneath it is a plain NavigationMenuLink in its own item.",
			},
			{
				guidance: "do",
				description:
					"Give panel links a `description` when titles alone are ambiguous (\"Sync\" → \"Offline first, conflict free\"), and lay the Content out with layout classes (`grid w-[30rem] grid-cols-2`); the shared panel sizes itself to it.",
			},
			{
				guidance: "do",
				description:
					"Pass your router's link through `render` (`<NavigationMenuLink render={<Link to=\"/pricing\" />}>`) and set `active` on the current page's link, so the bar shows where the reader is and announces it as `aria-current=\"page\"`.",
			},
			{
				guidance: "do",
				description:
					"Below `md`, hide the bar and offer the same destinations in a Sheet opened from a menu Button: SheetContent side=\"left\" holding a SideNav, its groups mirroring the panels. A hover panel has nothing to hover on a phone, and a bar of five entries does not fit one.",
			},
			{
				guidance: "dont",
				description:
					"Do not put actions in it (Sign in, New project). Those are Buttons beside the nav; the nav holds places to go.",
			},
			{
				guidance: "dont",
				description:
					"Do not assemble the panel yourself. The root renders the one Portal, Positioner, Popup and Viewport every trigger shares; a second one breaks the glide between triggers.",
			},
		],
		anatomy: [
			{ name: "NavigationMenu", required: true, description: "The `<nav>` root; also renders the shared floating panel." },
			{ name: "NavigationMenuList", required: true, description: "The bar: a `<ul>` the arrow keys rove across." },
			{ name: "NavigationMenuItem", required: true, description: "One `<li>`: a link, or a trigger with its content." },
			{ name: "NavigationMenuTrigger", required: false, description: "Opens its item's content; carries a chevron." },
			{ name: "NavigationMenuContent", required: false, description: "The links a trigger reveals, rendered into the shared panel." },
			{ name: "NavigationMenuLink", required: true, description: "A destination: a bar entry in an item, a two-line row in content." },
		],
	},
	related: {
		components: ["Menu", "SideNav", "Sheet", "AppHeader", "Tabs"],
	},
	props: [
		{
			name: "NavigationMenu (Root)",
			type: "Base UI NavigationMenu.Root props (value, defaultValue, onValueChange, delay, closeDelay, orientation) + className",
			default: "—",
			description: "The `<nav>`. `value` is the open item's value (null when closed); `delay` / `closeDelay` tune hover-to-open.",
		},
		{
			name: "align",
			type: '"start" | "center" | "end"',
			default: '"start"',
			description: "Alignment of the shared panel along its trigger.",
		},
		{
			name: "sideOffset",
			type: "number",
			default: "8",
			description: "Gap between the bar and the panel, in px. The pointer crosses it on a bridge, so the panel does not close on the way in.",
		},
	],
	subcomponents: [
		{
			name: "NavigationMenuList",
			type: "Base UI NavigationMenu.List props + className",
			description: "The bar of items, a `<ul>`. Arrow keys move between entries.",
		},
		{
			name: "NavigationMenuItem",
			type: "Base UI NavigationMenu.Item props + className + value?: string",
			description: "One `<li>` holding either a NavigationMenuLink or a NavigationMenuTrigger with its NavigationMenuContent.",
		},
		{
			name: "NavigationMenuTrigger",
			type: "Base UI NavigationMenu.Trigger props + className",
			description: "Opens its item's content on hover, click or Enter, with a chevron that turns while open. Styled like the bar's links: muted at rest, full ink when hovered or open.",
		},
		{
			name: "NavigationMenuContent",
			type: "Base UI NavigationMenu.Content props + className + keepMounted?: boolean",
			description: "The item's panel content. Size and lay it out with layout classes; the shared panel follows its size and slides it in from the side it was reached from.",
		},
		{
			name: "NavigationMenuLink",
			type: "Base UI NavigationMenu.Link props + className + href?: string + active?: boolean + closeOnClick?: boolean + render?: ReactElement + description?: ReactNode",
			description: "A destination. In an item it is a bar entry; in content it is a row with an optional `description` line. `active` sets `aria-current=\"page\"`; `render={<Link to=\"…\" />}` keeps the roving focus on your router's link.",
		},
	],
	tokensUsed: ["popover", "popover-foreground", "border-floating", "accent", "accent-foreground", "muted-foreground", "foreground", "ring"],
	motion: [
		{
			slot: "arrival",
			recipe: "custom",
			part: "Panel",
			why: "The panel fades and scales in from its trigger like a popover, but it also resizes as the reader moves between triggers, which motion-pop cannot express: Base UI measures each content into --popup-width/--popup-height and the popup transitions to them on the motion tokens.",
		},
		{
			slot: "transition",
			recipe: "custom",
			part: "Panel",
			why: "Moving from one trigger to the next keeps one panel open: it glides along the bar and the new content slides in from the direction of travel, so the reader sees one surface changing rather than two popups swapping. Snaps on first open and on resize (data-instant), where a glide would mean nothing.",
		},
		{
			slot: "response",
			recipe: "motion-interactive",
			part: "Trigger, Link",
			why: "Bar entries and panel rows fill on hover and focus like the other interactive surfaces, so the bar reads as live before anything opens.",
		},
		{
			slot: "activity",
			recipe: "none",
			part: "root",
			why: "Nothing in a nav moves on its own.",
		},
	],
	a11y: [
		"The root is a <nav>; give it an aria-label when the page has more than one nav (\"Main\").",
		"Arrow keys move across the bar; Enter, Space or ArrowDown opens a trigger's content and moves focus into it; Esc closes and returns focus to the trigger.",
		"A trigger is a button with aria-expanded; its content is reachable by Tab in reading order once open.",
		"`active` on a link sets aria-current=\"page\" and gives it full ink, so the current page is announced as well as shown.",
		"Panel motion runs on the motion tokens, so reduced motion (or MotionProvider \"reduced\") collapses the glide and resize to instant.",
	],
	examples: [
		{
			label: "Bar with a panel",
			code: '<NavigationMenu aria-label="Main">\n\t<NavigationMenuList>\n\t\t<NavigationMenuItem>\n\t\t\t<NavigationMenuTrigger>Product</NavigationMenuTrigger>\n\t\t\t<NavigationMenuContent className="grid w-[30rem] grid-cols-2">\n\t\t\t\t<NavigationMenuLink href="/editor" description="Write and review together.">Editor</NavigationMenuLink>\n\t\t\t\t<NavigationMenuLink href="/sync" description="Offline first, conflict free.">Sync</NavigationMenuLink>\n\t\t\t</NavigationMenuContent>\n\t\t</NavigationMenuItem>\n\t\t<NavigationMenuItem>\n\t\t\t<NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>\n\t\t</NavigationMenuItem>\n\t</NavigationMenuList>\n</NavigationMenu>',
		},
		{
			label: "With a router, marking the current page",
			code: '<NavigationMenu aria-label="Main">\n\t<NavigationMenuList>\n\t\t<NavigationMenuItem>\n\t\t\t<NavigationMenuLink active={path === "/docs"} render={<Link to="/docs" />}>Docs</NavigationMenuLink>\n\t\t</NavigationMenuItem>\n\t\t<NavigationMenuItem>\n\t\t\t<NavigationMenuLink active={path === "/blog"} render={<Link to="/blog" />}>Blog</NavigationMenuLink>\n\t\t</NavigationMenuItem>\n\t</NavigationMenuList>\n</NavigationMenu>',
		},
	],
}
