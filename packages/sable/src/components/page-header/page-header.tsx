import type { ComponentPropsWithRef, ReactNode } from "react"
import { cn } from "../../lib/cn"

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
	const hasControls = Boolean(back || actions)
	return (
		<div className={cn("flex flex-col gap-1 pb-4", className)} {...props}>
			<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
				<div className="flex min-w-0 flex-1 basis-48 items-start gap-2">
					{back ? <div className="shrink-0">{back}</div> : null}
					{title ? (
						<Title
							className={cn(
								"min-w-0 text-heading-2 text-balance break-words",
								hasControls && "flex min-h-(--control-md) items-center",
							)}
						>
							{title}
						</Title>
					) : null}
				</div>
				{actions ? (
					<div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
				) : null}
			</div>
			{description ? (
				<p className="text-body-sm text-muted-foreground">{description}</p>
			) : null}
			{children}
		</div>
	)
}
PageHeader.displayName = "PageHeader"
