import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"
import { HeadingRow } from "../../lib/heading-row"

export interface PageHeaderProps
	extends Omit<ComponentPropsWithRef<"div">, "title"> {
	/** The page title. */
	title?: ReactNode
	/** Supporting copy beneath the title. */
	description?: ReactNode
	/** Leading element before the title — typically a back control. */
	back?: ReactNode
	/** Trailing actions aligned to the title row's end. */
	actions?: ReactNode
	/**
	 * The title's heading element. `h1` — the route's one h1 — unless something
	 * above already owns it: a shell that renders the route title, or a page that
	 * shows a PageHeader as an example. @default "h1"
	 */
	titleAs?: "h1" | "h2"
	/**
	 * The title's scale. `md` (text-heading-2 over a text-body-sm description)
	 * for product pages: settings, lists, dashboards. `lg` (text-display-lg over
	 * a text-body-lg lede) for an editorial page: a personal site, a marketing
	 * page, an article index. Display type is never product chrome, so keep `lg`
	 * off app routes. @default "md"
	 */
	size?: "md" | "lg"
}

// Paired tiers, one per role, never decomposed. lg is the smallest display tier
// over the lede tier (body-lg carries text-wrap: pretty), with more air between
// them and below the block to match the larger type.
const SIZE = {
	md: { root: "gap-2 pb-4", title: "text-heading-2", description: "text-body-sm" },
	lg: { root: "gap-3 pb-6", title: "text-display-lg", description: "max-w-(--measure-prose) text-body-lg" },
} as const

/**
 * PageHeader — an in-flow page heading block: a title row (optional back control
 * + actions) over an optional description, with room for arbitrary children
 * (filters, tabs) below. Distinct from AppHeader (the fixed mobile chrome); this
 * lives inside the content region and reads on every breakpoint.
 *
 *   <PageHeader title="Settings" description="Manage your account." actions={<Button>Save</Button>} />
 *
 * The title wraps rather than truncating — a page's name is the one string that
 * must never be cut — and the actions drop under it when the row runs out of
 * room. Beside a back control or actions the title sits in a band one control
 * tall, so a one-line title centres on the buttons and a wrapped one starts level
 * with them. A title whose line is taller than the controls (`size="lg"`) is
 * lifted by half the difference instead, so its first line still centres on them.
 */
export function PageHeader({
	title,
	description,
	back,
	actions,
	titleAs: Title = "h1",
	size = "md",
	className,
	children,
	...props
}: PageHeaderProps) {
	return (
		<div data-size={size} className={cn("flex flex-col", SIZE[size].root, className)} {...props}>
			<HeadingRow
				as={Title}
				title={title}
				titleClassName={SIZE[size].title}
				band="flex min-h-(--control-md) items-center mt-[min(0px,calc((var(--control-md)_-_1lh)/2))]"
				titleBasis="basis-[min(100%,20rem)]"
				leading={back}
				actions={actions}
			/>
			{description ? (
				<p className={cn(SIZE[size].description, "text-muted-foreground")}>{description}</p>
			) : null}
			{children}
		</div>
	)
}
PageHeader.displayName = "PageHeader"
