import { useRender } from "@base-ui/react/use-render"
import type { ComponentPropsWithRef, ReactNode } from "react"
import { Icon } from "../../icon"
import { cn } from "../../lib/cn"

/**
 * Breadcrumbs — a styled navigation trail (no Base UI). Renders a labelled
 * <nav> wrapping an ordered list of crumbs. Compose the parts directly:
 *
 *   <Breadcrumbs>
 *     <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem><BreadcrumbLink href="/library">Library</BreadcrumbLink></BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem><BreadcrumbPage>Reports</BreadcrumbPage></BreadcrumbItem>
 *   </Breadcrumbs>
 *
 * The trail is a single horizontal row; the final crumb is the current page
 * (BreadcrumbPage), which is non-interactive and marked aria-current="page".
 */

export interface BreadcrumbsProps extends ComponentPropsWithRef<"nav"> {}

/** The trail root — a labelled <nav> around an inline <ol> of crumbs. */
export function Breadcrumbs({
	className,
	children,
	ref,
	...props
}: BreadcrumbsProps) {
	return (
		<nav aria-label="Breadcrumb" ref={ref} className={className} {...props}>
			<ol className="flex flex-wrap items-center gap-1.5 text-body-sm">
				{children}
			</ol>
		</nav>
	)
}
Breadcrumbs.displayName = "Breadcrumbs"

export interface BreadcrumbItemProps extends ComponentPropsWithRef<"li"> {}

/** A single crumb slot — one list item holding a link, page, or separator. */
export function BreadcrumbItem({
	className,
	ref,
	...props
}: BreadcrumbItemProps) {
	return (
		<li
			ref={ref}
			className={cn("inline-flex items-center gap-1.5", className)}
			{...props}
		/>
	)
}
BreadcrumbItem.displayName = "BreadcrumbItem"

export interface BreadcrumbLinkProps extends ComponentPropsWithRef<"a"> {
	/**
	 * Render another element, such as a router link, so navigating stays in the
	 * app: `render={<Link to="/library" />}`. Keeps the crumb's styling.
	 */
	render?: useRender.RenderProp
}

/** An interactive ancestor crumb — muted, brightening to foreground on hover. */
export function BreadcrumbLink({
	className,
	render,
	...props
}: BreadcrumbLinkProps) {
	return useRender({
		render: render ?? <a />,
		props: {
			...props,
			className: cn(
				"rounded-sm text-muted-foreground motion-interactive hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				className,
			),
		},
		defaultTagName: "a",
	})
}
BreadcrumbLink.displayName = "BreadcrumbLink"

export interface BreadcrumbPageProps extends ComponentPropsWithRef<"span"> {}

/** The current-page crumb — non-interactive, full-contrast, aria-current="page". */
export function BreadcrumbPage({
	className,
	ref,
	...props
}: BreadcrumbPageProps) {
	return (
		<span
			ref={ref}
			aria-current="page"
			className={cn("text-foreground", className)}
			{...props}
		/>
	)
}
BreadcrumbPage.displayName = "BreadcrumbPage"

export interface BreadcrumbSeparatorProps
	extends ComponentPropsWithRef<"li"> {
	/** Replace the default chevron with custom content (e.g. a slash). */
	children?: ReactNode
}

/**
 * The divider between crumbs — a decorative, aria-hidden list item. Defaults to
 * a right-chevron icon; pass children to swap in a different glyph.
 */
export function BreadcrumbSeparator({
	className,
	children,
	ref,
	...props
}: BreadcrumbSeparatorProps) {
	return (
		<li
			ref={ref}
			aria-hidden="true"
			className={cn(
				"inline-flex select-none items-center text-muted-foreground",
				className,
			)}
			{...props}
		>
			{children ?? <Icon name="chevron-right" className="text-xs" />}
		</li>
	)
}
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"
