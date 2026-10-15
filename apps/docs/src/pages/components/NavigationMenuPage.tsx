import {
	Button,
	Icon,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SideNav,
	SideNavGroup,
	SideNavItem,
	navigationMenuMeta,
} from "@sableui/react"
import { useState } from "react"
import { Example, MetaFooter, PageHeader, Section, ledeFor } from "../../components/docs-ui"

/* Sample destinations: hash links, so following one in the docs goes nowhere. */
const PRODUCT = [
	{ href: "#editor", title: "Editor", description: "Write and review together." },
	{ href: "#sync", title: "Sync", description: "Offline first, conflict free." },
	{ href: "#publish", title: "Publish", description: "One click to a live site." },
	{ href: "#analytics", title: "Analytics", description: "See what readers finish." },
]
const RESOURCES = [
	{ href: "#guides", title: "Guides", description: "Start to finish, step by step." },
	{ href: "#changelog", title: "Changelog", description: "What shipped this week." },
]

function SiteNav() {
	const [current, setCurrent] = useState("#pricing")
	const link = (href: string) => ({
		href,
		active: current === href,
		onClick: (event: React.MouseEvent) => {
			event.preventDefault()
			setCurrent(href)
		},
	})
	return (
		<NavigationMenu aria-label="Main">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Product</NavigationMenuTrigger>
					<NavigationMenuContent className="grid w-[32rem] grid-cols-2">
						{PRODUCT.map((item) => (
							<NavigationMenuLink key={item.href} description={item.description} {...link(item.href)}>
								{item.title}
							</NavigationMenuLink>
						))}
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
					<NavigationMenuContent className="grid w-64">
						{RESOURCES.map((item) => (
							<NavigationMenuLink key={item.href} description={item.description} {...link(item.href)}>
								{item.title}
							</NavigationMenuLink>
						))}
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink {...link("#pricing")}>Pricing</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	)
}

export function NavigationMenuPage() {
	return (
		<>
			<PageHeader eyebrow="Components" title="Navigation Menu" lede={ledeFor(navigationMenuMeta)} />

			<Section
				title="Bar with panels"
				description="Hover or focus a trigger. Moving to the next one keeps one panel open: it glides along the bar, resizes to the new content, and slides it in from the side you came from."
			>
				<Example code={navigationMenuMeta.examples[0].code}>
					<SiteNav />
				</Example>
			</Section>

			<Section
				title="With a router"
				description="Pass your router's link through render and set active on the current page's link. It takes full ink and is announced as the current page."
			>
				<Example code={navigationMenuMeta.examples[1].code}>
					<SiteNav />
				</Example>
			</Section>

			<Section
				title="On a narrow screen"
				description="A hover panel has nothing to hover on a phone. Below md, hide the bar and open the same destinations in a Sheet: a SideNav whose groups mirror the panels."
			>
				<Example
					code={
						'<div className="hidden md:block">{/* the NavigationMenu */}</div>\n<Sheet>\n\t<SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menu" className="md:hidden" />}>\n\t\t<Icon name="bars" />\n\t</SheetTrigger>\n\t<SheetContent side="left">\n\t\t<SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>\n\t\t<SideNav aria-label="Main">\n\t\t\t<SideNavGroup label="Product">\n\t\t\t\t<SideNavItem label="Editor" render={<Link to="/editor" />} />\n\t\t\t\t<SideNavItem label="Sync" render={<Link to="/sync" />} />\n\t\t\t</SideNavGroup>\n\t\t\t<SideNavItem label="Pricing" active render={<Link to="/pricing" />} />\n\t\t</SideNav>\n\t</SheetContent>\n</Sheet>'
					}
				>
					<Sheet>
						<SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menu" />}>
							<Icon name="bars" />
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle>Menu</SheetTitle>
							</SheetHeader>
							<SideNav aria-label="Main">
								<SideNavGroup label="Product">
									{PRODUCT.map((item) => (
										<SideNavItem key={item.href} label={item.title} render={<a href={item.href} />} />
									))}
								</SideNavGroup>
								<SideNavGroup label="Resources">
									{RESOURCES.map((item) => (
										<SideNavItem key={item.href} label={item.title} render={<a href={item.href} />} />
									))}
								</SideNavGroup>
								<SideNavItem label="Pricing" active render={<a href="#pricing" />} />
							</SideNav>
						</SheetContent>
					</Sheet>
				</Example>
			</Section>

			<MetaFooter meta={navigationMenuMeta} />
		</>
	)
}
