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
}

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
 * with them.
 */
export function PageHeader({
	title,
	description,
	back,
	actions,
	titleAs: Title = "h1",
	className,
	children,
	...props
}: PageHeaderProps) {
	return (
		<div className={cn("flex flex-col gap-2 pb-4", className)} {...props}>
			<HeadingRow
				as={Title}
				title={title}
				titleClassName="text-heading-2"
				band="flex min-h-(--control-md) items-center"
				titleBasis="basis-[min(100%,20rem)]"
				leading={back}
				actions={actions}
			/>
			{description ? (
				<p className="text-body-sm text-muted-foreground">{description}</p>
			) : null}
			{children}
		</div>
	)
}
PageHeader.displayName = "PageHeader"
